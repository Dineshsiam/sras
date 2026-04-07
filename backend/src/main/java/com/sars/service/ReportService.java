package com.sars.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.sars.dto.report.ReportDtos;
import com.sars.entity.*;
import com.sars.entity.enums.EntryStatus;
import com.sars.entity.enums.ReportFormat;
import com.sars.entity.enums.ReportType;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final DataEntryRepository dataEntryRepository;
    private final UserRepository userRepository;

    @Value("${app.reports.storage-path}")
    private String storagePath;

    // ─── Generate Report ─────────────────────────────────────────────────────
    @Transactional
    public ReportDtos.Response generate(ReportDtos.GenerateRequest request, String userEmail) throws Exception {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Collect relevant entries
        List<DataEntry> entries = dataEntryRepository
                .findWithFilters(EntryStatus.APPROVED, getPlaceId(request), getMachineId(request),
                        null, request.getDateFrom(), request.getDateTo(),
                        Pageable.unpaged())
                .getContent();

        // Generate file
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = String.format("%s_%s_%s.%s",
                request.getType().name(),
                request.getFormat().name(),
                timestamp,
                request.getFormat() == ReportFormat.PDF ? "pdf" : "xlsx");

        Path dir = Paths.get(storagePath);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String filePath = dir.resolve(fileName).toString();

        if (request.getFormat() == ReportFormat.PDF) {
            generatePdf(entries, filePath, request);
        } else {
            generateExcel(entries, filePath, request);
        }

        Report report = Report.builder()
                .type(request.getType())
                .format(request.getFormat())
                .entityId(request.getEntityId())
                .fileName(fileName)
                .fileUrl("/api/reports/download/" + fileName)
                .generatedBy(user)
                .dateFrom(request.getDateFrom())
                .dateTo(request.getDateTo())
                .build();

        return toResponse(reportRepository.save(report));
    }

    // ─── List Reports ────────────────────────────────────────────────────────
    public Page<ReportDtos.Response> list(Pageable pageable) {
        return reportRepository.findAllByOrderByGeneratedAtDesc(pageable).map(this::toResponse);
    }

    // ─── Download File ───────────────────────────────────────────────────────
    public byte[] download(Long reportId) throws IOException {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", reportId));
        Path filePath = Paths.get(storagePath, report.getFileName());
        return Files.readAllBytes(filePath);
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", id));
    }

    // ─── PDF Generation ──────────────────────────────────────────────────────
    private void generatePdf(List<DataEntry> entries, String filePath, ReportDtos.GenerateRequest request) throws Exception {
        PdfWriter writer = new PdfWriter(filePath);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Title
        document.add(new Paragraph("SARS - Sustainability Analytics Report")
                .setFontSize(20).setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(0, 100, 0)));

        document.add(new Paragraph("Report Type: " + request.getType().name())
                .setFontSize(12).setTextAlignment(TextAlignment.CENTER));

        String dateRange = (request.getDateFrom() != null ? request.getDateFrom().toLocalDate().toString() : "All time")
                + " to "
                + (request.getDateTo() != null ? request.getDateTo().toLocalDate().toString() : "Now");
        document.add(new Paragraph("Period: " + dateRange)
                .setFontSize(11).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

        // Table
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 1.5f, 1.5f, 2}))
                .useAllAvailableWidth();

        String[] headers = {"Place", "Machine", "Metric", "Value", "Unit", "Date"};
        for (String h : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(h).setBold())
                    .setBackgroundColor(new DeviceRgb(0, 100, 0))
                    .setFontColor(ColorConstants.WHITE));
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (DataEntry e : entries) {
            table.addCell(e.getPlace().getName());
            table.addCell(e.getMachine() != null ? e.getMachine().getName() : "-");
            table.addCell(e.getMetric().getName());
            table.addCell(e.getValue().toPlainString());
            table.addCell(e.getMetric().getUnit());
            table.addCell(e.getCreatedAt().format(fmt));
        }

        document.add(table);
        document.add(new Paragraph("\nTotal entries: " + entries.size())
                .setFontSize(10).setItalic());
        document.close();
    }

    // ─── Excel Generation ────────────────────────────────────────────────────
    private void generateExcel(List<DataEntry> entries, String filePath, ReportDtos.GenerateRequest request) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sustainability Data");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Place", "Machine", "Metric", "Value", "Unit", "Status", "Submitted By", "Date"};
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            int rowNum = 1;
            for (DataEntry e : entries) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(e.getId());
                row.createCell(1).setCellValue(e.getPlace().getName());
                row.createCell(2).setCellValue(e.getMachine() != null ? e.getMachine().getName() : "-");
                row.createCell(3).setCellValue(e.getMetric().getName());
                row.createCell(4).setCellValue(e.getValue().doubleValue());
                row.createCell(5).setCellValue(e.getMetric().getUnit());
                row.createCell(6).setCellValue(e.getStatus().name());
                row.createCell(7).setCellValue(e.getSubmittedBy().getName());
                row.createCell(8).setCellValue(e.getCreatedAt().format(fmt));
            }

            for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);

            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                workbook.write(fos);
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private Long getPlaceId(ReportDtos.GenerateRequest req) {
        return req.getType() == ReportType.PLACE ? req.getEntityId() : null;
    }

    private Long getMachineId(ReportDtos.GenerateRequest req) {
        return req.getType() == ReportType.MACHINE ? req.getEntityId() : null;
    }

    private ReportDtos.Response toResponse(Report r) {
        return ReportDtos.Response.builder()
                .id(r.getId())
                .type(r.getType().name())
                .format(r.getFormat().name())
                .fileName(r.getFileName())
                .fileUrl(r.getFileUrl())
                .generatedAt(r.getGeneratedAt())
                .generatedByName(r.getGeneratedBy().getName())
                .dateFrom(r.getDateFrom())
                .dateTo(r.getDateTo())
                .build();
    }
}

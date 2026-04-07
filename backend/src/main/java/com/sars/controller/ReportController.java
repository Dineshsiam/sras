package com.sars.controller;

import com.sars.dto.report.ReportDtos;
import com.sars.entity.Report;
import com.sars.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/generate")
    public ResponseEntity<ReportDtos.Response> generate(
            @Valid @RequestBody ReportDtos.GenerateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        return ResponseEntity.ok(reportService.generate(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<Page<ReportDtos.Response>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("generatedAt").descending());
        return ResponseEntity.ok(reportService.list(pageable));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws Exception {
        Report report = reportService.getReportById(id);
        byte[] content = reportService.download(id);

        MediaType mediaType = report.getFormat().name().equals("PDF")
                ? MediaType.APPLICATION_PDF
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + report.getFileName() + "\"")
                .contentType(mediaType)
                .body(content);
    }
}

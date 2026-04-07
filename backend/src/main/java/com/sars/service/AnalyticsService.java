package com.sars.service;

import com.sars.dto.analytics.AnalyticsDtos;
import com.sars.entity.DataEntry;
import com.sars.entity.Machine;
import com.sars.entity.Metric;
import com.sars.entity.Place;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final DataEntryRepository dataEntryRepository;
    private final OrganizationRepository organizationRepository;
    private final PlaceRepository placeRepository;
    private final MachineRepository machineRepository;
    private final MetricRepository metricRepository;

    // ─── Org Overview ────────────────────────────────────────────────────────
    public AnalyticsDtos.OrgOverview getOrgOverview(Long orgId, LocalDateTime from, LocalDateTime to) {
        var org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId));

        List<Place> places = placeRepository.findByOrganizationId(orgId);
        List<Metric> metrics = metricRepository.findAll();

        List<AnalyticsDtos.KpiSummary> metricSummaries = metrics.stream()
                .map(m -> buildKpiSummary(m, null, null, from, to))
                .collect(Collectors.toList());

        List<AnalyticsDtos.PlaceSummary> topPlaces = places.stream()
                .map(p -> buildPlaceSummary(p, null, from, to))
                .collect(Collectors.toList());

        long total = dataEntryRepository.count();
        long pending = dataEntryRepository.countByStatus(com.sars.entity.enums.EntryStatus.PENDING);
        long approved = dataEntryRepository.countByStatus(com.sars.entity.enums.EntryStatus.APPROVED);
        long rejected = dataEntryRepository.countByStatus(com.sars.entity.enums.EntryStatus.REJECTED);

        return AnalyticsDtos.OrgOverview.builder()
                .organizationId(org.getId())
                .organizationName(org.getName())
                .totalEntries(total)
                .pendingEntries(pending)
                .approvedEntries(approved)
                .rejectedEntries(rejected)
                .metricSummaries(metricSummaries)
                .topPlaces(topPlaces)
                .build();
    }

    // ─── Place Analytics ─────────────────────────────────────────────────────
    public AnalyticsDtos.PlaceSummary getPlaceAnalytics(Long placeId, Long metricId, LocalDateTime from, LocalDateTime to) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", placeId));
        return buildPlaceSummary(place, metricId, from, to);
    }

    // ─── Machine Analytics ───────────────────────────────────────────────────
    public AnalyticsDtos.MachineSummary getMachineAnalytics(Long machineId, Long metricId, LocalDateTime from, LocalDateTime to) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new ResourceNotFoundException("Machine", machineId));

        List<DataEntry> entries = dataEntryRepository.findApprovedByMachine(machineId, metricId, from, to);
        List<Metric> metricsToReport = metricId != null
                ? List.of(metricRepository.findById(metricId).orElseThrow())
                : metricRepository.findAll();

        List<AnalyticsDtos.KpiSummary> kpis = metricsToReport.stream()
                .map(m -> computeKpi(m, entries.stream()
                        .filter(e -> e.getMetric().getId().equals(m.getId()))
                        .map(DataEntry::getValue).collect(Collectors.toList())))
                .collect(Collectors.toList());

        return AnalyticsDtos.MachineSummary.builder()
                .machineId(machine.getId())
                .machineName(machine.getName())
                .placeId(machine.getPlace().getId())
                .placeName(machine.getPlace().getName())
                .metricSummaries(kpis)
                .entryCount(entries.size())
                .build();
    }

    // ─── Trend Analysis ──────────────────────────────────────────────────────
    public AnalyticsDtos.TrendResponse getTrends(Long metricId, String granularity, LocalDateTime from, LocalDateTime to) {
        Metric metric = metricRepository.findById(metricId)
                .orElseThrow(() -> new ResourceNotFoundException("Metric", metricId));

        List<DataEntry> entries = dataEntryRepository.findApprovedForTrends(metricId, from, to);

        DateTimeFormatter formatter = switch (granularity.toLowerCase()) {
            case "weekly" -> DateTimeFormatter.ofPattern("YYYY-'W'ww");
            case "daily" -> DateTimeFormatter.ofPattern("yyyy-MM-dd");
            default -> DateTimeFormatter.ofPattern("yyyy-MM");
        };

        Map<String, List<BigDecimal>> grouped = new LinkedHashMap<>();
        for (DataEntry e : entries) {
            String key = e.getCreatedAt().format(formatter);
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(e.getValue());
        }

        List<AnalyticsDtos.TrendPoint> points = grouped.entrySet().stream()
                .map(entry -> {
                    List<BigDecimal> values = entry.getValue();
                    BigDecimal total = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal avg = total.divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
                    return AnalyticsDtos.TrendPoint.builder()
                            .period(entry.getKey())
                            .metricName(metric.getName())
                            .totalValue(total)
                            .avgValue(avg)
                            .count(values.size())
                            .build();
                })
                .collect(Collectors.toList());

        return AnalyticsDtos.TrendResponse.builder()
                .granularity(granularity)
                .metricName(metric.getName())
                .metricUnit(metric.getUnit())
                .dataPoints(points)
                .build();
    }

    // ─── Anomaly Detection ───────────────────────────────────────────────────
    public List<AnalyticsDtos.AnomalyEntry> getAnomalies(Long metricId) {
        List<Metric> metrics = metricId != null
                ? List.of(metricRepository.findById(metricId).orElseThrow())
                : metricRepository.findAll();

        List<AnalyticsDtos.AnomalyEntry> anomalies = new ArrayList<>();

        for (Metric metric : metrics) {
            BigDecimal threshold = metric.getThreshold();

            if (threshold == null) {
                // 2× average rule
                BigDecimal avg = dataEntryRepository.avgApprovedByMetricAndPlace(metric.getId(), null);
                if (avg == null) continue;
                threshold = avg.multiply(BigDecimal.valueOf(2));
            }

            final BigDecimal finalThreshold = threshold;
            List<DataEntry> anomalyEntries = dataEntryRepository.findAnomaliesByThreshold(metric.getId(), threshold);

            anomalyEntries.forEach(e -> anomalies.add(AnalyticsDtos.AnomalyEntry.builder()
                    .dataEntryId(e.getId())
                    .placeName(e.getPlace().getName())
                    .machineName(e.getMachine() != null ? e.getMachine().getName() : null)
                    .metricName(metric.getName())
                    .metricUnit(metric.getUnit())
                    .value(e.getValue())
                    .threshold(finalThreshold)
                    .detectedAt(e.getCreatedAt().toString())
                    .build()));
        }

        return anomalies;
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private AnalyticsDtos.PlaceSummary buildPlaceSummary(Place place, Long metricId, LocalDateTime from, LocalDateTime to) {
        List<DataEntry> entries = dataEntryRepository.findApprovedByPlace(place.getId(), metricId, from, to);
        List<Metric> metricsToReport = metricId != null
                ? List.of(metricRepository.findById(metricId).orElseThrow())
                : metricRepository.findAll();

        List<AnalyticsDtos.KpiSummary> kpis = metricsToReport.stream()
                .map(m -> computeKpi(m, entries.stream()
                        .filter(e -> e.getMetric().getId().equals(m.getId()))
                        .map(DataEntry::getValue).collect(Collectors.toList())))
                .collect(Collectors.toList());

        return AnalyticsDtos.PlaceSummary.builder()
                .placeId(place.getId())
                .placeName(place.getName())
                .location(place.getLocation())
                .machineCount(place.getMachines() != null ? place.getMachines().size() : 0)
                .entryCount(entries.size())
                .metricSummaries(kpis)
                .build();
    }

    private AnalyticsDtos.KpiSummary buildKpiSummary(Metric m, Long placeId, Long machineId,
                                                       LocalDateTime from, LocalDateTime to) {
        List<DataEntry> entries = machineId != null
                ? dataEntryRepository.findApprovedByMachine(machineId, m.getId(), from, to)
                : placeId != null
                ? dataEntryRepository.findApprovedByPlace(placeId, m.getId(), from, to)
                : dataEntryRepository.findApprovedForTrends(m.getId(), from, to);

        List<BigDecimal> values = entries.stream().map(DataEntry::getValue).collect(Collectors.toList());
        return computeKpi(m, values);
    }

    private AnalyticsDtos.KpiSummary computeKpi(Metric metric, List<BigDecimal> values) {
        if (values.isEmpty()) {
            return AnalyticsDtos.KpiSummary.builder()
                    .metricName(metric.getName())
                    .metricUnit(metric.getUnit())
                    .totalValue(BigDecimal.ZERO)
                    .averageValue(BigDecimal.ZERO)
                    .maxValue(BigDecimal.ZERO)
                    .minValue(BigDecimal.ZERO)
                    .entryCount(0)
                    .build();
        }

        BigDecimal total = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avg = total.divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
        BigDecimal max = values.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal min = values.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        return AnalyticsDtos.KpiSummary.builder()
                .metricName(metric.getName())
                .metricUnit(metric.getUnit())
                .totalValue(total)
                .averageValue(avg)
                .maxValue(max)
                .minValue(min)
                .entryCount(values.size())
                .build();
    }
}

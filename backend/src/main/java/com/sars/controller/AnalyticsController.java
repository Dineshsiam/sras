package com.sars.controller;

import com.sars.dto.analytics.AnalyticsDtos;
import com.sars.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<AnalyticsDtos.OrgOverview> getOrgOverview(
            @PathVariable Long orgId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getOrgOverview(orgId, from, to));
    }

    @GetMapping("/place/{placeId}")
    public ResponseEntity<AnalyticsDtos.PlaceSummary> getPlaceAnalytics(
            @PathVariable Long placeId,
            @RequestParam(required = false) Long metricId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getPlaceAnalytics(placeId, metricId, from, to));
    }

    @GetMapping("/machine/{machineId}")
    public ResponseEntity<AnalyticsDtos.MachineSummary> getMachineAnalytics(
            @PathVariable Long machineId,
            @RequestParam(required = false) Long metricId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getMachineAnalytics(machineId, metricId, from, to));
    }

    @GetMapping("/trends")
    public ResponseEntity<AnalyticsDtos.TrendResponse> getTrends(
            @RequestParam Long metricId,
            @RequestParam(defaultValue = "monthly") String granularity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getTrends(metricId, granularity, from, to));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<AnalyticsDtos.AnomalyEntry>> getAnomalies(
            @RequestParam(required = false) Long metricId) {
        return ResponseEntity.ok(analyticsService.getAnomalies(metricId));
    }
}

package com.sars.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;


public class AnalyticsDtos {

    // ─── KPI Summary ─────────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiSummary {
        private String metricName;
        private String metricUnit;
        private BigDecimal totalValue;
        private BigDecimal averageValue;
        private BigDecimal maxValue;
        private BigDecimal minValue;
        private long entryCount;
    }

    // ─── Organization Overview ────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrgOverview {
        private Long organizationId;
        private String organizationName;
        private long totalEntries;
        private long pendingEntries;
        private long approvedEntries;
        private long rejectedEntries;
        private List<KpiSummary> metricSummaries;
        private List<PlaceSummary> topPlaces;
    }

    // ─── Place Summary ────────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceSummary {
        private Long placeId;
        private String placeName;
        private String location;
        private List<KpiSummary> metricSummaries;
        private long machineCount;
        private long entryCount;
    }

    // ─── Machine Summary ──────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MachineSummary {
        private Long machineId;
        private String machineName;
        private Long placeId;
        private String placeName;
        private List<KpiSummary> metricSummaries;
        private long entryCount;
    }

    // ─── Trend Data Point ─────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendPoint {
        private String period;        // "2024-01", "2024-W01", "2024-01-15"
        private String metricName;
        private BigDecimal totalValue;
        private BigDecimal avgValue;
        private long count;
    }

    // ─── Trend Response ───────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendResponse {
        private String granularity;   // "daily", "weekly", "monthly"
        private String metricName;
        private String metricUnit;
        private List<TrendPoint> dataPoints;
    }

    // ─── Anomaly ─────────────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyEntry {
        private Long dataEntryId;
        private String placeName;
        private String machineName;
        private String metricName;
        private String metricUnit;
        private BigDecimal value;
        private BigDecimal threshold;
        private String detectedAt;
    }
}

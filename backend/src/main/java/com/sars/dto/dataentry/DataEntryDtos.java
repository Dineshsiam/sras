package com.sars.dto.dataentry;

import com.sars.entity.enums.EntryStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DataEntryDtos {

    // ─── Create (Submit) ──────────────────────────────────────────────────────
    @Data
    public static class CreateRequest {
        @NotNull(message = "Place ID is required")
        private Long placeId;

        private Long machineId;

        @NotNull(message = "Metric ID is required")
        private Long metricId;

        @NotNull(message = "Value is required")
        @Positive(message = "Value must be positive")
        private BigDecimal value;

        private String notes;
    }

    // ─── Reject (with required reason) ───────────────────────────────────────
    @Data
    public static class RejectRequest {
        @NotNull(message = "Rejection reason is required")
        private String reason;
    }

    // ─── Modify + Approve ─────────────────────────────────────────────────────
    @Data
    public static class ModifyRequest {
        @Positive(message = "Value must be positive")
        private BigDecimal value;
        private String notes;
    }

    // ─── Full Response ────────────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long placeId;
        private String placeName;
        private Long machineId;
        private String machineName;
        private Long metricId;
        private String metricName;
        private String metricUnit;
        private BigDecimal value;
        private EntryStatus status;
        private Long submittedById;
        private String submittedByName;
        private Long reviewedById;
        private String reviewedByName;
        private String rejectionReason;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ─── Summary (for lists) ──────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String placeName;
        private String machineName;
        private String metricName;
        private String metricUnit;
        private BigDecimal value;
        private EntryStatus status;
        private String submittedByName;
        private LocalDateTime createdAt;
    }
}

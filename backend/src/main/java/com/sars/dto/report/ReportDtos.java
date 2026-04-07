package com.sars.dto.report;

import com.sars.entity.enums.ReportFormat;
import com.sars.entity.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ReportDtos {

    @Data
    public static class GenerateRequest {
        @NotNull(message = "Report type is required")
        private ReportType type;

        @NotNull(message = "Format is required")
        private ReportFormat format;

        private Long entityId;   // Optional: placeId or machineId
        private LocalDateTime dateFrom;
        private LocalDateTime dateTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String type;
        private String format;
        private String fileName;
        private String fileUrl;
        private LocalDateTime generatedAt;
        private String generatedByName;
        private LocalDateTime dateFrom;
        private LocalDateTime dateTo;
    }
}

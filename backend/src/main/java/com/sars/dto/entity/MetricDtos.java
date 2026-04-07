package com.sars.dto.entity;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class MetricDtos {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Metric name is required")
        private String name;
        @NotBlank(message = "Unit is required")
        private String unit;
        private String description;
        private BigDecimal threshold;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String unit;
        private String description;
        private BigDecimal threshold;
    }
}

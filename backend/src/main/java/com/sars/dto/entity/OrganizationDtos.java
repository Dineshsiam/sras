package com.sars.dto.entity;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ─── Organization DTOs ────────────────────────────────────────────────────────

public class OrganizationDtos {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Organization name is required")
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private long placeCount;
        private long userCount;
    }
}

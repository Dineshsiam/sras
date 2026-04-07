package com.sars.dto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PlaceDtos {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Place name is required")
        private String name;
        private String location;
        @NotNull(message = "Organization ID is required")
        private Long organizationId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String location;
        private Long organizationId;
        private String organizationName;
        private long machineCount;
    }
}

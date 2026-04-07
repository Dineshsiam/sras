package com.sars.dto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class MachineDtos {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Machine name is required")
        private String name;
        private String description;
        @NotNull(message = "Place ID is required")
        private Long placeId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private Long placeId;
        private String placeName;
        private Long organizationId;
    }
}

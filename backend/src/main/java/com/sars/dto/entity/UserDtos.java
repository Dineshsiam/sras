package com.sars.dto.entity;

import com.sars.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private Long organizationId;
        private String organizationName;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private Role role;
        private Long organizationId;
        private Boolean isActive;
    }
}

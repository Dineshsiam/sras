package com.sars.controller;

import com.sars.dto.dataentry.DataEntryDtos;
import com.sars.entity.enums.EntryStatus;
import com.sars.service.DataEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/data-entries")
@RequiredArgsConstructor
public class DataEntryController {

    private final DataEntryService dataEntryService;

    // ─── Submit ───────────────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','ANALYST','ADMIN')")
    public ResponseEntity<DataEntryDtos.Response> submit(
            @Valid @RequestBody DataEntryDtos.CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dataEntryService.submit(request, userDetails.getUsername()));
    }

    // ─── List All (Paginated) ─────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Page<DataEntryDtos.Summary>> getAll(
            @RequestParam(required = false) EntryStatus status,
            @RequestParam(required = false) Long placeId,
            @RequestParam(required = false) Long machineId,
            @RequestParam(required = false) Long metricId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(dataEntryService.getAll(status, placeId, machineId, metricId, from, to, pageable));
    }

    // ─── My Submissions ───────────────────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<Page<DataEntryDtos.Summary>> getMyEntries(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(dataEntryService.getMyEntries(userDetails.getUsername(), pageable));
    }

    // ─── Single Entry ─────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<DataEntryDtos.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dataEntryService.getById(id));
    }

    // ─── Approve ─────────────────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ANALYST','ADMIN')")
    public ResponseEntity<DataEntryDtos.Response> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dataEntryService.approve(id, userDetails.getUsername()));
    }

    // ─── Reject ───────────────────────────────────────────────────────────────
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ANALYST','ADMIN')")
    public ResponseEntity<DataEntryDtos.Response> reject(
            @PathVariable Long id,
            @Valid @RequestBody DataEntryDtos.RejectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dataEntryService.reject(id, request, userDetails.getUsername()));
    }

    // ─── Modify + Approve ─────────────────────────────────────────────────────
    @PutMapping("/{id}/modify")
    @PreAuthorize("hasAnyRole('ANALYST','ADMIN')")
    public ResponseEntity<DataEntryDtos.Response> modify(
            @PathVariable Long id,
            @Valid @RequestBody DataEntryDtos.ModifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dataEntryService.modify(id, request, userDetails.getUsername()));
    }
}

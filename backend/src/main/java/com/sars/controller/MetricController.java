package com.sars.controller;

import com.sars.dto.entity.MetricDtos;
import com.sars.service.MetricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricController {

    private final MetricService metricService;

    @GetMapping
    public ResponseEntity<List<MetricDtos.Response>> getAll() {
        return ResponseEntity.ok(metricService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetricDtos.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(metricService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MetricDtos.Response> create(@Valid @RequestBody MetricDtos.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metricService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MetricDtos.Response> update(
            @PathVariable Long id, @Valid @RequestBody MetricDtos.CreateRequest request) {
        return ResponseEntity.ok(metricService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        metricService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

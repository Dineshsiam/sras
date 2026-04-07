package com.sars.controller;

import com.sars.dto.entity.PlaceDtos;
import com.sars.service.PlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<List<PlaceDtos.Response>> getAll(
            @RequestParam(required = false) Long organizationId) {
        return ResponseEntity.ok(placeService.getAll(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlaceDtos.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<PlaceDtos.Response> create(@Valid @RequestBody PlaceDtos.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(placeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<PlaceDtos.Response> update(
            @PathVariable Long id, @Valid @RequestBody PlaceDtos.CreateRequest request) {
        return ResponseEntity.ok(placeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        placeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

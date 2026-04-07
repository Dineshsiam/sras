package com.sars.controller;

import com.sars.dto.entity.MachineDtos;
import com.sars.service.MachineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<List<MachineDtos.Response>> getAll(
            @RequestParam(required = false) Long placeId) {
        return ResponseEntity.ok(machineService.getAll(placeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MachineDtos.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<MachineDtos.Response> create(@Valid @RequestBody MachineDtos.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(machineService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<MachineDtos.Response> update(
            @PathVariable Long id, @Valid @RequestBody MachineDtos.CreateRequest request) {
        return ResponseEntity.ok(machineService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        machineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

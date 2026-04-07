package com.sars.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * A measurable sustainability metric (e.g., Energy, CO2, Water).
 * The threshold field enables per-metric anomaly detection.
 */
@Entity
@Table(name = "metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String unit;  // e.g., kWh, kgCO2, m3

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Per-metric anomaly threshold. Entries exceeding this value trigger alerts.
     * If null, the system falls back to 2× average rule.
     */
    @Column(name = "threshold", precision = 15, scale = 4)
    private BigDecimal threshold;
}

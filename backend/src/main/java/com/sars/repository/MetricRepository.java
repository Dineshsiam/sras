package com.sars.repository;

import com.sars.entity.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {
    Optional<Metric> findByName(String name);
    boolean existsByName(String name);
}

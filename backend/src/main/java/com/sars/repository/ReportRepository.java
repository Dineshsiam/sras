package com.sars.repository;

import com.sars.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByGeneratedByIdOrderByGeneratedAtDesc(Long userId, Pageable pageable);
    Page<Report> findAllByOrderByGeneratedAtDesc(Pageable pageable);
}

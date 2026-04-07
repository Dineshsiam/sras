package com.sars.repository;

import com.sars.entity.DataEntry;
import com.sars.entity.enums.EntryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DataEntryRepository extends JpaRepository<DataEntry, Long> {

    // ─── Paginated queries with filters ──────────────────────────────────────

    @Query("""
        SELECT d FROM DataEntry d
        WHERE (cast(:status as string) IS NULL OR d.status = :status)
          AND (cast(:placeId as long) IS NULL OR d.place.id = :placeId)
          AND (cast(:machineId as long) IS NULL OR d.machine.id = :machineId)
          AND (cast(:metricId as long) IS NULL OR d.metric.id = :metricId)
          AND (cast(:from as timestamp) IS NULL OR d.createdAt >= :from)
          AND (cast(:to as timestamp) IS NULL OR d.createdAt <= :to)
        """)
    Page<DataEntry> findWithFilters(
            @Param("status") EntryStatus status,
            @Param("placeId") Long placeId,
            @Param("machineId") Long machineId,
            @Param("metricId") Long metricId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    // ─── Submissions by user ──────────────────────────────────────────────────

    Page<DataEntry> findBySubmittedById(Long userId, Pageable pageable);

    // ─── Analytics aggregations ───────────────────────────────────────────────

    @Query("""
        SELECT SUM(d.value) FROM DataEntry d
        WHERE d.status = 'APPROVED'
          AND d.metric.id = :metricId
          AND (cast(:from as timestamp) IS NULL OR d.createdAt >= :from)
          AND (cast(:to as timestamp) IS NULL OR d.createdAt <= :to)
        """)
    BigDecimal sumApprovedByMetric(
            @Param("metricId") Long metricId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
        SELECT AVG(d.value) FROM DataEntry d
        WHERE d.status = 'APPROVED'
          AND d.metric.id = :metricId
          AND (cast(:placeId as long) IS NULL OR d.place.id = :placeId)
        """)
    BigDecimal avgApprovedByMetricAndPlace(
            @Param("metricId") Long metricId,
            @Param("placeId") Long placeId
    );

    @Query("""
        SELECT d FROM DataEntry d
        WHERE d.status = 'APPROVED'
          AND d.place.id = :placeId
          AND (cast(:metricId as long) IS NULL OR d.metric.id = :metricId)
          AND (cast(:from as timestamp) IS NULL OR d.createdAt >= :from)
          AND (cast(:to as timestamp) IS NULL OR d.createdAt <= :to)
        """)
    List<DataEntry> findApprovedByPlace(
            @Param("placeId") Long placeId,
            @Param("metricId") Long metricId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
        SELECT d FROM DataEntry d
        WHERE d.status = 'APPROVED'
          AND d.machine.id = :machineId
          AND (cast(:metricId as long) IS NULL OR d.metric.id = :metricId)
          AND (cast(:from as timestamp) IS NULL OR d.createdAt >= :from)
          AND (cast(:to as timestamp) IS NULL OR d.createdAt <= :to)
        """)
    List<DataEntry> findApprovedByMachine(
            @Param("machineId") Long machineId,
            @Param("metricId") Long metricId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
        SELECT d FROM DataEntry d
        WHERE d.status = 'APPROVED'
          AND (cast(:metricId as long) IS NULL OR d.metric.id = :metricId)
          AND (cast(:from as timestamp) IS NULL OR d.createdAt >= :from)
          AND (cast(:to as timestamp) IS NULL OR d.createdAt <= :to)
        ORDER BY d.createdAt ASC
        """)
    List<DataEntry> findApprovedForTrends(
            @Param("metricId") Long metricId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // ─── Anomaly Detection ────────────────────────────────────────────────────

    @Query("""
        SELECT d FROM DataEntry d
        WHERE d.status = 'APPROVED'
          AND d.metric.id = :metricId
          AND d.value > :threshold
        """)
    List<DataEntry> findAnomaliesByThreshold(
            @Param("metricId") Long metricId,
            @Param("threshold") BigDecimal threshold
    );

    // ─── Status counts ────────────────────────────────────────────────────────

    long countByStatus(EntryStatus status);
    long countBySubmittedByIdAndStatus(Long userId, EntryStatus status);
}

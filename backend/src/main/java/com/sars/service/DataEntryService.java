package com.sars.service;

import com.sars.dto.dataentry.DataEntryDtos;
import com.sars.entity.*;
import com.sars.entity.enums.EntryStatus;
import com.sars.entity.enums.NotificationType;
import com.sars.exception.BusinessException;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DataEntryService {

    private final DataEntryRepository dataEntryRepository;
    private final PlaceRepository placeRepository;
    private final MachineRepository machineRepository;
    private final MetricRepository metricRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    // ─── Submit ───────────────────────────────────────────────────────────────
    @Transactional
    public DataEntryDtos.Response submit(DataEntryDtos.CreateRequest request, String userEmail) {
        User submitter = getUserByEmail(userEmail);
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Place", request.getPlaceId()));
        Machine machine = request.getMachineId() != null
                ? machineRepository.findById(request.getMachineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Machine", request.getMachineId()))
                : null;
        Metric metric = metricRepository.findById(request.getMetricId())
                .orElseThrow(() -> new ResourceNotFoundException("Metric", request.getMetricId()));

        DataEntry entry = DataEntry.builder()
                .place(place)
                .machine(machine)
                .metric(metric)
                .value(request.getValue())
                .notes(request.getNotes())
                .submittedBy(submitter)
                .status(EntryStatus.PENDING)
                .build();

        DataEntry saved = dataEntryRepository.save(entry);

        auditLogService.log("DataEntry", saved.getId(), "SUBMITTED", submitter,
                "New data entry submitted for metric: " + metric.getName());

        // Notify analysts
        notificationService.notifyAnalysts(
                NotificationType.DATA_SUBMITTED,
                "New data entry submitted by " + submitter.getName() + " for " + metric.getName(),
                saved.getId()
        );

        return toResponse(saved);
    }

    // ─── Get All (Paginated, Filtered) ────────────────────────────────────────
    public Page<DataEntryDtos.Summary> getAll(
            EntryStatus status, Long placeId, Long machineId, Long metricId,
            LocalDateTime from, LocalDateTime to, Pageable pageable) {

        return dataEntryRepository.findWithFilters(status, placeId, machineId, metricId, from, to, pageable)
                .map(this::toSummary);
    }

    // ─── Get by User ──────────────────────────────────────────────────────────
    public Page<DataEntryDtos.Summary> getMyEntries(String userEmail, Pageable pageable) {
        User user = getUserByEmail(userEmail);
        return dataEntryRepository.findBySubmittedById(user.getId(), pageable)
                .map(this::toSummary);
    }

    // ─── Get Single ───────────────────────────────────────────────────────────
    public DataEntryDtos.Response getById(Long id) {
        return toResponse(findById(id));
    }

    // ─── Approve ─────────────────────────────────────────────────────────────
    @Transactional
    public DataEntryDtos.Response approve(Long id, String reviewerEmail) {
        DataEntry entry = findById(id);
        if (entry.getStatus() != EntryStatus.PENDING) {
            throw new BusinessException("Only PENDING entries can be approved");
        }
        User reviewer = getUserByEmail(reviewerEmail);
        String oldStatus = entry.getStatus().name();

        entry.setStatus(EntryStatus.APPROVED);
        entry.setReviewedBy(reviewer);
        DataEntry saved = dataEntryRepository.save(entry);

        auditLogService.logWithValues("DataEntry", id, "APPROVED", reviewer,
                "Entry approved", oldStatus, "APPROVED");

        notificationService.notifyUser(
                entry.getSubmittedBy(),
                NotificationType.DATA_APPROVED,
                "Your data entry for " + entry.getMetric().getName() + " has been approved.",
                id
        );

        // Check for anomaly after approval
        notificationService.checkAndNotifyAnomaly(saved);

        return toResponse(saved);
    }

    // ─── Reject ───────────────────────────────────────────────────────────────
    @Transactional
    public DataEntryDtos.Response reject(Long id, DataEntryDtos.RejectRequest request, String reviewerEmail) {
        DataEntry entry = findById(id);
        if (entry.getStatus() != EntryStatus.PENDING) {
            throw new BusinessException("Only PENDING entries can be rejected");
        }
        User reviewer = getUserByEmail(reviewerEmail);
        String oldStatus = entry.getStatus().name();

        entry.setStatus(EntryStatus.REJECTED);
        entry.setReviewedBy(reviewer);
        entry.setRejectionReason(request.getReason());
        DataEntry saved = dataEntryRepository.save(entry);

        auditLogService.logWithValues("DataEntry", id, "REJECTED", reviewer,
                "Reason: " + request.getReason(), oldStatus, "REJECTED");

        notificationService.notifyUser(
                entry.getSubmittedBy(),
                NotificationType.DATA_REJECTED,
                "Your data entry for " + entry.getMetric().getName() + " was rejected: " + request.getReason(),
                id
        );

        return toResponse(saved);
    }

    // ─── Modify + Approve ─────────────────────────────────────────────────────
    @Transactional
    public DataEntryDtos.Response modify(Long id, DataEntryDtos.ModifyRequest request, String reviewerEmail) {
        DataEntry entry = findById(id);
        if (entry.getStatus() != EntryStatus.PENDING) {
            throw new BusinessException("Only PENDING entries can be modified");
        }
        User reviewer = getUserByEmail(reviewerEmail);
        String oldValue = entry.getValue().toPlainString();

        if (request.getValue() != null) entry.setValue(request.getValue());
        if (request.getNotes() != null) entry.setNotes(request.getNotes());
        entry.setStatus(EntryStatus.APPROVED);
        entry.setReviewedBy(reviewer);
        DataEntry saved = dataEntryRepository.save(entry);

        auditLogService.logWithValues("DataEntry", id, "MODIFIED_AND_APPROVED", reviewer,
                "Value modified and approved", oldValue, saved.getValue().toPlainString());

        return toResponse(saved);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private DataEntry findById(Long id) {
        return dataEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataEntry", id));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public DataEntryDtos.Response toResponse(DataEntry e) {
        return DataEntryDtos.Response.builder()
                .id(e.getId())
                .placeId(e.getPlace().getId())
                .placeName(e.getPlace().getName())
                .machineId(e.getMachine() != null ? e.getMachine().getId() : null)
                .machineName(e.getMachine() != null ? e.getMachine().getName() : null)
                .metricId(e.getMetric().getId())
                .metricName(e.getMetric().getName())
                .metricUnit(e.getMetric().getUnit())
                .value(e.getValue())
                .status(e.getStatus())
                .submittedById(e.getSubmittedBy().getId())
                .submittedByName(e.getSubmittedBy().getName())
                .reviewedById(e.getReviewedBy() != null ? e.getReviewedBy().getId() : null)
                .reviewedByName(e.getReviewedBy() != null ? e.getReviewedBy().getName() : null)
                .rejectionReason(e.getRejectionReason())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private DataEntryDtos.Summary toSummary(DataEntry e) {
        return DataEntryDtos.Summary.builder()
                .id(e.getId())
                .placeName(e.getPlace().getName())
                .machineName(e.getMachine() != null ? e.getMachine().getName() : null)
                .metricName(e.getMetric().getName())
                .metricUnit(e.getMetric().getUnit())
                .value(e.getValue())
                .status(e.getStatus())
                .submittedByName(e.getSubmittedBy().getName())
                .createdAt(e.getCreatedAt())
                .build();
    }
}

package com.sars.service;

import com.sars.dto.notification.NotificationDtos;
import com.sars.entity.DataEntry;
import com.sars.entity.Notification;
import com.sars.entity.User;
import com.sars.entity.enums.NotificationType;
import com.sars.entity.enums.Role;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.NotificationRepository;
import com.sars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ─── Get Notifications for User ──────────────────────────────────────────
    public Page<NotificationDtos.Response> getForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ─── Mark Read ────────────────────────────────────────────────────────────
    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!n.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    // ─── Internal: Notify Single User ─────────────────────────────────────────
    @Transactional
    public void notifyUser(User user, NotificationType type, String message, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // ─── Internal: Notify All Analysts ───────────────────────────────────────
    @Transactional
    public void notifyAnalysts(NotificationType type, String message, Long referenceId) {
        List<User> analysts = userRepository.findByRole(Role.ANALYST);
        for (User analyst : analysts) {
            notifyUser(analyst, type, message, referenceId);
        }
    }

    // ─── Internal: Anomaly Detection Notification ────────────────────────────
    @Transactional
    public void checkAndNotifyAnomaly(DataEntry entry) {
        BigDecimal threshold = entry.getMetric().getThreshold();

        boolean isAnomaly;
        if (threshold != null) {
            isAnomaly = entry.getValue().compareTo(threshold) > 0;
        } else {
            // Fallback: 2× average rule
            isAnomaly = false; // analytics service handles this separately
        }

        if (isAnomaly) {
            String message = String.format(
                    "⚠️ Anomaly detected! %s value %.2f %s exceeds threshold %.2f at %s",
                    entry.getMetric().getName(),
                    entry.getValue(),
                    entry.getMetric().getUnit(),
                    threshold,
                    entry.getPlace().getName()
            );

            List<User> managers = userRepository.findByRole(Role.MANAGER);
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            managers.forEach(u -> notifyUser(u, NotificationType.ANOMALY_DETECTED, message, entry.getId()));
            admins.forEach(u -> notifyUser(u, NotificationType.ANOMALY_DETECTED, message, entry.getId()));
        }
    }

    private NotificationDtos.Response toResponse(Notification n) {
        return NotificationDtos.Response.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .referenceId(n.getReferenceId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

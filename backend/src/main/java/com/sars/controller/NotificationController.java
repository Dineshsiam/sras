package com.sars.controller;

import com.sars.dto.notification.NotificationDtos;
import com.sars.repository.UserRepository;
import com.sars.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<NotificationDtos.Response>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(userDetails.getUsername());
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(notificationService.getForUser(userId, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<NotificationDtos.UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails.getUsername());
        return ResponseEntity.ok(new NotificationDtos.UnreadCountResponse(
                notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails.getUsername());
        notificationService.markRead(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails.getUsername());
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

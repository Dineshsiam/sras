package com.sars.service;

import com.sars.dto.entity.UserDtos;
import com.sars.entity.Organization;
import com.sars.entity.User;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.OrganizationRepository;
import com.sars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public List<UserDtos.Response> getAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserDtos.Response getById(Long id) {
        return toResponse(findById(id));
    }

    public UserDtos.Response getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toResponse(user);
    }

    @Transactional
    public UserDtos.Response update(Long id, UserDtos.UpdateRequest request) {
        User user = findById(id);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization", request.getOrganizationId()));
            user.setOrganization(org);
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = findById(id);
        user.setIsActive(false);   // soft delete
        userRepository.save(user);
    }

    public User findEntityById(Long id) {
        return findById(id);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public UserDtos.Response toResponse(User u) {
        return UserDtos.Response.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .organizationId(u.getOrganization() != null ? u.getOrganization().getId() : null)
                .organizationName(u.getOrganization() != null ? u.getOrganization().getName() : null)
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}

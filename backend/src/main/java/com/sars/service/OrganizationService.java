package com.sars.service;

import com.sars.dto.entity.OrganizationDtos;
import com.sars.entity.Organization;
import com.sars.exception.BusinessException;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public List<OrganizationDtos.Response> getAll() {
        return organizationRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrganizationDtos.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public OrganizationDtos.Response create(OrganizationDtos.CreateRequest request) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new BusinessException("Organization with name '" + request.getName() + "' already exists");
        }
        Organization org = Organization.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return toResponse(organizationRepository.save(org));
    }

    @Transactional
    public OrganizationDtos.Response update(Long id, OrganizationDtos.CreateRequest request) {
        Organization org = findById(id);
        org.setName(request.getName());
        org.setDescription(request.getDescription());
        return toResponse(organizationRepository.save(org));
    }

    @Transactional
    public void delete(Long id) {
        Organization org = findById(id);
        organizationRepository.delete(org);
    }

    private Organization findById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id));
    }

    private OrganizationDtos.Response toResponse(Organization org) {
        return OrganizationDtos.Response.builder()
                .id(org.getId())
                .name(org.getName())
                .description(org.getDescription())
                .placeCount(org.getPlaces() != null ? org.getPlaces().size() : 0)
                .userCount(org.getUsers() != null ? org.getUsers().size() : 0)
                .build();
    }
}

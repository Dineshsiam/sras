package com.sars.service;

import com.sars.dto.entity.PlaceDtos;
import com.sars.entity.Organization;
import com.sars.entity.Place;
import com.sars.exception.BusinessException;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.OrganizationRepository;
import com.sars.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final OrganizationRepository organizationRepository;

    public List<PlaceDtos.Response> getAll(Long organizationId) {
        List<Place> places = organizationId != null
                ? placeRepository.findByOrganizationId(organizationId)
                : placeRepository.findAll();
        return places.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PlaceDtos.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public PlaceDtos.Response create(PlaceDtos.CreateRequest request) {
        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization", request.getOrganizationId()));

        if (placeRepository.existsByNameAndOrganizationId(request.getName(), request.getOrganizationId())) {
            throw new BusinessException("Place '" + request.getName() + "' already exists in this organization");
        }

        Place place = Place.builder()
                .name(request.getName())
                .location(request.getLocation())
                .organization(org)
                .build();
        return toResponse(placeRepository.save(place));
    }

    @Transactional
    public PlaceDtos.Response update(Long id, PlaceDtos.CreateRequest request) {
        Place place = findById(id);
        place.setName(request.getName());
        place.setLocation(request.getLocation());
        return toResponse(placeRepository.save(place));
    }

    @Transactional
    public void delete(Long id) {
        placeRepository.delete(findById(id));
    }

    private Place findById(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place", id));
    }

    private PlaceDtos.Response toResponse(Place p) {
        return PlaceDtos.Response.builder()
                .id(p.getId())
                .name(p.getName())
                .location(p.getLocation())
                .organizationId(p.getOrganization().getId())
                .organizationName(p.getOrganization().getName())
                .machineCount(p.getMachines() != null ? p.getMachines().size() : 0)
                .build();
    }
}

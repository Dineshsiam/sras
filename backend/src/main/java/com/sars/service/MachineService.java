package com.sars.service;

import com.sars.dto.entity.MachineDtos;
import com.sars.entity.Machine;
import com.sars.entity.Place;
import com.sars.exception.BusinessException;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.MachineRepository;
import com.sars.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MachineService {

    private final MachineRepository machineRepository;
    private final PlaceRepository placeRepository;

    public List<MachineDtos.Response> getAll(Long placeId) {
        List<Machine> machines = placeId != null
                ? machineRepository.findByPlaceId(placeId)
                : machineRepository.findAll();
        return machines.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MachineDtos.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public MachineDtos.Response create(MachineDtos.CreateRequest request) {
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Place", request.getPlaceId()));

        if (machineRepository.existsByNameAndPlaceId(request.getName(), request.getPlaceId())) {
            throw new BusinessException("Machine '" + request.getName() + "' already exists at this place");
        }

        Machine machine = Machine.builder()
                .name(request.getName())
                .description(request.getDescription())
                .place(place)
                .build();
        return toResponse(machineRepository.save(machine));
    }

    @Transactional
    public MachineDtos.Response update(Long id, MachineDtos.CreateRequest request) {
        Machine machine = findById(id);
        machine.setName(request.getName());
        machine.setDescription(request.getDescription());
        return toResponse(machineRepository.save(machine));
    }

    @Transactional
    public void delete(Long id) {
        machineRepository.delete(findById(id));
    }

    private Machine findById(Long id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine", id));
    }

    private MachineDtos.Response toResponse(Machine m) {
        return MachineDtos.Response.builder()
                .id(m.getId())
                .name(m.getName())
                .description(m.getDescription())
                .placeId(m.getPlace().getId())
                .placeName(m.getPlace().getName())
                .organizationId(m.getPlace().getOrganization().getId())
                .build();
    }
}

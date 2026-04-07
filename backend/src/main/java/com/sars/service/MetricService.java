package com.sars.service;

import com.sars.dto.entity.MetricDtos;
import com.sars.entity.Metric;
import com.sars.exception.BusinessException;
import com.sars.exception.ResourceNotFoundException;
import com.sars.repository.MetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MetricService {

    private final MetricRepository metricRepository;

    public List<MetricDtos.Response> getAll() {
        return metricRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MetricDtos.Response getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public MetricDtos.Response create(MetricDtos.CreateRequest request) {
        if (metricRepository.existsByName(request.getName())) {
            throw new BusinessException("Metric '" + request.getName() + "' already exists");
        }
        Metric metric = Metric.builder()
                .name(request.getName())
                .unit(request.getUnit())
                .description(request.getDescription())
                .threshold(request.getThreshold())
                .build();
        return toResponse(metricRepository.save(metric));
    }

    @Transactional
    public MetricDtos.Response update(Long id, MetricDtos.CreateRequest request) {
        Metric metric = findById(id);
        metric.setName(request.getName());
        metric.setUnit(request.getUnit());
        metric.setDescription(request.getDescription());
        metric.setThreshold(request.getThreshold());
        return toResponse(metricRepository.save(metric));
    }

    @Transactional
    public void delete(Long id) {
        metricRepository.delete(findById(id));
    }

    private Metric findById(Long id) {
        return metricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Metric", id));
    }

    public MetricDtos.Response toResponse(Metric m) {
        return MetricDtos.Response.builder()
                .id(m.getId())
                .name(m.getName())
                .unit(m.getUnit())
                .description(m.getDescription())
                .threshold(m.getThreshold())
                .build();
    }
}

package com.sars.repository;

import com.sars.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByOrganizationId(Long organizationId);
    boolean existsByNameAndOrganizationId(String name, Long organizationId);
}

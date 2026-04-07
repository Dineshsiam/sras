package com.sars.repository;

import com.sars.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByPlaceId(Long placeId);
    List<Machine> findByPlaceOrganizationId(Long organizationId);
    boolean existsByNameAndPlaceId(String name, Long placeId);
}

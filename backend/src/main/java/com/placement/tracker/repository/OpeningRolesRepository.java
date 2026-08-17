package com.placement.tracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.placement.tracker.entity.OpeningRoles;

@Repository
public interface OpeningRolesRepository  extends JpaRepository<OpeningRoles,Long> {
    List<OpeningRoles> findByCompanyId(Long companyId);
    List<OpeningRoles> findByActiveTrue();
}

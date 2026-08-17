package com.placement.tracker.repository;

import com.placement.tracker.entity.Company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByActiveTrue();
    List<Company> findByIndustry(String industry);
    List<Company> findByNameContainingIgnoreCase(String name);
    
}


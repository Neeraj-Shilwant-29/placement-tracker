package com.placement.tracker.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.placement.tracker.entity.JobApplications;

@Repository
public interface JobApplicationsRepository extends JpaRepository<JobApplications,Long> {
    boolean existsByStudentIdAndCompanyId(
            Long studentId,
            Long companyId);
    
    List<JobApplications> findByStudentId(Long studentId);
}

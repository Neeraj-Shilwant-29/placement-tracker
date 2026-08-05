package com.placement.tracker.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import com.placement.tracker.dto.JobApplicationRequest;
import com.placement.tracker.entity.Company;
import com.placement.tracker.entity.JobApplications;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.CompanyRepository;
import com.placement.tracker.repository.JobApplicationsRepository;
import com.placement.tracker.repository.StudentRepository;

@Service
public class JobApplicationService {
    @Autowired
    private JobApplicationsRepository jobApplicationsRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private CompanyRepository companyRepository;
    @Autowired

   public void apply(Long studentId, Long companyId) {

    if (jobApplicationsRepository.existsByStudentIdAndCompanyId(studentId, companyId)) {
        throw new RuntimeException("Already Applied.");
    }

    Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found"));

    JobApplications application = JobApplications.builder()
            .student(student)
            .company(company)
            .status("APPLIED")
            .appliedAt(LocalDateTime.now())
            .build();

    jobApplicationsRepository.save(application);
}
}

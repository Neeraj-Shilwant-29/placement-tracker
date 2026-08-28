package com.placement.tracker.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.placement.tracker.dto.AppliedJobResponse;
import com.placement.tracker.dto.OpeningRoleDTO;
import com.placement.tracker.entity.Company;
import com.placement.tracker.entity.JobApplications;
import com.placement.tracker.entity.OpeningRoles;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.CompanyRepository;
import com.placement.tracker.repository.JobApplicationsRepository;
import com.placement.tracker.repository.OpeningRolesRepository;
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
    private OpeningRolesRepository openingRolesRepository;

    public JobApplications getApplicationById(Long id) {
        return jobApplicationsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public void apply(Long studentId, Long companyId, Long openingRoleId) {

        if (jobApplicationsRepository.existsByStudentIdAndCompanyId(studentId, companyId)) {
            throw new RuntimeException("Already Applied.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        OpeningRoles openingRoles = openingRolesRepository.findById(openingRoleId)
         .orElseThrow(() -> new RuntimeException("Opening not found"));

        JobApplications application = JobApplications.builder()
                .student(student)
                .company(company)
                .openingRoles(openingRoles)
                .status("APPLIED")
                .appliedAt(LocalDateTime.now())
                .build();

        jobApplicationsRepository.save(application);
    }

        private OpeningRoleDTO mapToOpeningRoleDTO(OpeningRoles openingRole) {
        return new OpeningRoleDTO(
                openingRole.getId(),
                openingRole.getCompany().getId(),
                openingRole.getCompany().getName(),
                openingRole.getRole(),
                openingRole.getSkills(),
                openingRole.getDescription(),
                openingRole.getOpenings(),
                openingRole.getPackageOffered(),
                openingRole.getEligibleBranches(),
                openingRole.getMinCgpa(),
                openingRole.getMinTenth(),
                openingRole.getMinTwelfth(),
                openingRole.getLocation(),
                openingRole.getActive()
        );
        }
    public List<AppliedJobResponse> getAppliedJobs(Long studentId){
        List<JobApplications> applications = jobApplicationsRepository.findByStudentId(studentId);
        return applications.stream()
            .map(application -> new AppliedJobResponse(
                application.getId(),
                application.getStatus(),
                mapToOpeningRoleDTO(application.getOpeningRoles()),
                application.getAppliedAt()
            ))
            .toList();
    }
}
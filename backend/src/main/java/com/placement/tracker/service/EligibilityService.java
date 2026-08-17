package com.placement.tracker.service;

import com.placement.tracker.dto.EligibilityResult;
import com.placement.tracker.entity.Company;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.CompanyRepository;
import com.placement.tracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<EligibilityResult> checkEligibility(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Company> companies = companyRepository.findByActiveTrue();
        List<EligibilityResult> results = new ArrayList<>();

        for (Company company : companies) {
            boolean eligible = true;
            StringBuilder message = new StringBuilder();

            double studentCgpa = 0;
            if (student.getCgpa() != null && !student.getCgpa().isEmpty()) {
                studentCgpa = Double.parseDouble(student.getCgpa());
            }

            if (studentCgpa < company.getMinCgpa()) {
                eligible = false;
                message.append("CGPA below minimum requirement. ");
            }

            if (!company.getEligibleBranches().isEmpty() &&
                !company.getEligibleBranches().contains(student.getBranch())) {
                eligible = false;
                message.append("Branch not in eligible list. ");
            }

            if (eligible) {
                message.append("You are eligible for this company!");
            }

            EligibilityResult result = new EligibilityResult();
            result.setEligible(eligible);
            result.setMessage(message.toString());
            result.setCompany(new com.placement.tracker.dto.CompanyDTO(
                    company.getId(), company.getName(), company.getLogo(),
                    company.getWebsite(), company.getDescription(),
                    company.getIndustry(), company.getLocation(), company.getBond(),
                    company.getMinCgpa(), company.getMinTenth(),
                    company.getMinTwelfth(), company.getEligibleBranches(),
                    company.isActive()
            ));
            results.add(result);
        }

        return results;
    }

    public EligibilityResult checkCompanyEligibility(Long studentId, Long companyId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        boolean eligible = true;
        StringBuilder message = new StringBuilder();

        double studentCgpa = 0;
        if (student.getCgpa() != null && !student.getCgpa().isEmpty()) {
            studentCgpa = Double.parseDouble(student.getCgpa());
        }

        if (studentCgpa < company.getMinCgpa()) {
            eligible = false;
            message.append("CGPA below minimum requirement. ");
        }

        if (!company.getEligibleBranches().isEmpty() &&
            !company.getEligibleBranches().contains(student.getBranch())) {
            eligible = false;
            message.append("Branch not in eligible list. ");
        }

        if (eligible) {
            message.append("You are eligible for this company!");
        }

        EligibilityResult result = new EligibilityResult();
        result.setEligible(eligible);
        result.setMessage(message.toString());
        result.setCompany(new com.placement.tracker.dto.CompanyDTO(
                company.getId(), company.getName(), company.getLogo(),
                company.getWebsite(), company.getDescription(),
                company.getIndustry(), company.getLocation(),
                company.getBond(),
                company.getMinCgpa(), company.getMinTenth(),
                company.getMinTwelfth(), company.getEligibleBranches(),
                company.isActive()
        ));
        return result;
    }
}

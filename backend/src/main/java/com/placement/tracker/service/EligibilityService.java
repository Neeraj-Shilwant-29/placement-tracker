package com.placement.tracker.service;

import com.placement.tracker.dto.CompanyDTO;
import com.placement.tracker.dto.EligibilityResult;
import com.placement.tracker.dto.OpeningRoleDTO;
import com.placement.tracker.entity.Company;
import com.placement.tracker.entity.OpeningRoles;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.CompanyRepository;
import com.placement.tracker.repository.OpeningRolesRepository;
import com.placement.tracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private OpeningRolesRepository openingRolesRepository;

    public List<EligibilityResult> checkEligibility(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<OpeningRoles> openingRoles = openingRolesRepository.findByActiveTrue();
        List<EligibilityResult> results = new ArrayList<>();

        for (OpeningRoles openingRole : openingRoles) {
            boolean eligible = true;
            StringBuilder message = new StringBuilder();
            Company company = openingRole.getCompany();

            double studentCgpa = 0;
            if (student.getCgpa() != null && !student.getCgpa().isEmpty()) {
                studentCgpa = Double.parseDouble(student.getCgpa());
            }

            if (openingRole.getMinCgpa() != null && studentCgpa < openingRole.getMinCgpa()) {
                eligible = false;
                message.append("CGPA below minimum requirement. ");
            }

            if (!openingRole.getEligibleBranches().isEmpty() &&
                !openingRole.getEligibleBranches().contains(student.getBranch())) {
                eligible = false;
                message.append("Branch not in eligible list. ");
            }

            if (eligible) {
                message.append("You are eligible for this company!");
            }

            CompanyDTO companyDTO = new CompanyDTO();
            companyDTO.setId(company.getId());
            companyDTO.setName(company.getName());
            companyDTO.setLogo(company.getLogo());
            companyDTO.setWebsite(company.getWebsite());
            companyDTO.setDescription(company.getDescription());
            companyDTO.setIndustry(company.getIndustry());
            companyDTO.setLocation(company.getLocation());
            companyDTO.setBond(company.getBond());
            companyDTO.setActive(company.isActive());

            OpeningRoleDTO roleDTO = OpeningRoleDTO.builder()
                    .id(openingRole.getId())
                    .companyId(company.getId())
                    .companyName(company.getName())
                    .roleName(openingRole.getRole())
                    .skills(openingRole.getSkills())
                    .jd(openingRole.getDescription())
                    .openings(openingRole.getOpenings())
                    .packageOffered(openingRole.getPackageOffered())
                    .eligibleBranches(openingRole.getEligibleBranches())
                    .minCgpa(openingRole.getMinCgpa())
                    .minTenth(openingRole.getMinTenth())
                    .minTwelfth(openingRole.getMinTwelfth())
                    .location(openingRole.getLocation())
                    .active(openingRole.getActive())
                    .build();

            EligibilityResult result = new EligibilityResult();
            result.setEligible(eligible);
            result.setMessage(message.toString());
            result.setCompany(companyDTO);
            result.setOpeningRoles(roleDTO);
            results.add(result);
        }

        return results;
    }


    public OpeningRoleDTO checkCompanyEligibility(Long studentId, Long openingRoleId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        OpeningRoles openingRole = openingRolesRepository.findById(openingRoleId)
          .orElseThrow(() -> new RuntimeException("Opening Role not found"));;

        double studentCgpa = 0;

            boolean eligible = true;
            StringBuilder message = new StringBuilder();
            Company company = openingRole.getCompany();

        if (student.getCgpa() != null && !student.getCgpa().isEmpty()) {
            studentCgpa = Double.parseDouble(student.getCgpa());
        }

        if (openingRole.getMinCgpa() != null && studentCgpa < openingRole.getMinCgpa()) {
            eligible = false;
            message.append("CGPA below minimum requirement. ");
        }

        if (!openingRole.getEligibleBranches().isEmpty() &&
            !openingRole.getEligibleBranches().contains(student.getBranch())) {
            eligible = false;
            message.append("Branch not in eligible list. ");
        }

        if (eligible) {
            message.append("You are eligible for this company!");
        }

            OpeningRoleDTO roleDTO = OpeningRoleDTO.builder()
                    .id(openingRole.getId())
                    .companyId(company.getId())
                    .companyName(company.getName())
                    .roleName(openingRole.getRole())
                    .skills(openingRole.getSkills())
                    .jd(openingRole.getDescription())
                    .openings(openingRole.getOpenings())
                    .packageOffered(openingRole.getPackageOffered())
                    .eligibleBranches(openingRole.getEligibleBranches())
                    .minCgpa(openingRole.getMinCgpa())
                    .minTenth(openingRole.getMinTenth())
                    .minTwelfth(openingRole.getMinTwelfth())
                    .location(openingRole.getLocation())
                    .active(openingRole.getActive())
                    .build();
  
        return roleDTO;
    }
}   

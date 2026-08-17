package com.placement.tracker.service;

import com.placement.tracker.dto.OpeningRoleRequest;
import com.placement.tracker.dto.OpeningRoleResponse;
import com.placement.tracker.entity.Company;
import com.placement.tracker.entity.OpeningRoles;
import com.placement.tracker.repository.CompanyRepository;
import com.placement.tracker.repository.OpeningRolesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OpeningRoleService {
    
    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private OpeningRolesRepository openingRoleRepository;

    public List<OpeningRoleResponse> getAllOpenings() {
        return openingRoleRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<OpeningRoleResponse> getOpeningsByCompany(Long companyId) {
        return openingRoleRepository.findByCompanyId(companyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public OpeningRoleResponse createOpeningRole(Long companyId, OpeningRoleRequest dto) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        OpeningRoles openingRole = OpeningRoles.builder()
                .company(company)
                .role(dto.getRoleName())
                .skills(dto.getSkills())
                .description(dto.getJd())
                .openings(dto.getOpenings())
                .packageOffered(dto.getPackageOffered())
                .eligibleBranches(dto.getEligibleBranches())
                .minCgpa(dto.getMinCgpa())
                .minTenth(dto.getMinTenth())
                .minTwelfth(dto.getMinTwelfth())
                .location(dto.getLocation())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        OpeningRoles savedOpeningRole = openingRoleRepository.save(openingRole);

        return toDTO(savedOpeningRole);
    }

    private OpeningRoleResponse toDTO(OpeningRoles openingRole) {
        Company company = openingRole.getCompany();

        return OpeningRoleResponse.builder()
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
    }
}

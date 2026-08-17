package com.placement.tracker.service;
import com.placement.tracker.dto.CompanyDTO;
import com.placement.tracker.entity.Company;
import com.placement.tracker.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<CompanyDTO> searchCompanies(String name) {
        return companyRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<CompanyDTO> getCompaniesByIndustry(String industry) {
        return companyRepository.findByIndustry(industry).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return toDTO(company);
    }

    public CompanyDTO createCompany(CompanyDTO dto) {
        Company company = Company.builder()
                .name(dto.getName())
                .logo(dto.getLogo())
                .website(dto.getWebsite())
                .description(dto.getDescription())
                .industry(dto.getIndustry())
                .location(dto.getLocation())
                .bond(dto.getBond())
                .minCgpa(dto.getMinCgpa())
                .minTenth(dto.getMinTenth())
                .minTwelfth(dto.getMinTwelfth())
                .eligibleBranches(dto.getEligibleBranches())
                .build();
        return toDTO(companyRepository.save(company));
    }

    public CompanyDTO updateCompany(Long id, CompanyDTO dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setName(dto.getName());
        company.setLogo(dto.getLogo());
        company.setWebsite(dto.getWebsite());
        company.setDescription(dto.getDescription());
        company.setIndustry(dto.getIndustry());
        company.setLocation(dto.getLocation());
        company.setBond(dto.getBond());
        company.setMinCgpa(dto.getMinCgpa());
        company.setMinTenth(dto.getMinTenth());
        company.setMinTwelfth(dto.getMinTwelfth());
        company.setEligibleBranches(dto.getEligibleBranches());
        return toDTO(companyRepository.save(company));
    }

    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setActive(false);
        companyRepository.save(company);
    }

    private CompanyDTO toDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setLogo(company.getLogo());
        dto.setWebsite(company.getWebsite());
        dto.setDescription(company.getDescription());
        dto.setIndustry(company.getIndustry());
        dto.setLocation(company.getLocation());
        dto.setBond(company.getBond());
        dto.setMinCgpa(company.getMinCgpa());
        dto.setMinTenth(company.getMinTenth());
        dto.setMinTwelfth(company.getMinTwelfth());
        dto.setEligibleBranches(company.getEligibleBranches());
        dto.setActive(company.isActive());
        return dto;
    }

   
}

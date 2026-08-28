package com.placement.tracker.controller;

import com.placement.tracker.dto.CompanyDTO;
import com.placement.tracker.dto.OpeningRoleDTO;
import com.placement.tracker.service.CompanyService;
import com.placement.tracker.service.OpeningRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:4200")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private OpeningRoleService openingRoleService;

    @GetMapping
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/openings")
    public ResponseEntity<List<OpeningRoleDTO>> getAllOpenings() {
        return ResponseEntity.ok(openingRoleService.getAllOpenings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompanyDTO>> searchCompanies(@RequestParam String name) {
        return ResponseEntity.ok(companyService.searchCompanies(name));
    }

    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<CompanyDTO>> getByIndustry(@PathVariable String industry) {
        return ResponseEntity.ok(companyService.getCompaniesByIndustry(industry));
    }

    @PostMapping("/admin")
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO dto) {
        return ResponseEntity.ok(companyService.createCompany(dto));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable Long id, @RequestBody CompanyDTO dto) {
        return ResponseEntity.ok(companyService.updateCompany(id, dto));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(Map.of("message", "Company deleted successfully"));
    }

    @GetMapping("/{companyId}/openings")
    public ResponseEntity<List<OpeningRoleDTO>> getOpeningsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(openingRoleService.getOpeningsByCompany(companyId));
    }

    @PostMapping("/{companyId}/openings")
    public ResponseEntity<OpeningRoleDTO> createOpenRole(
            @PathVariable Long companyId,
            @RequestBody OpeningRoleDTO dto) {
        return ResponseEntity.ok(openingRoleService.createOpeningRole(companyId, dto));
    }

    @PostMapping("/{companyId}/createRole")
    public ResponseEntity<OpeningRoleDTO> createOpenRoleLegacy(
            @PathVariable Long companyId,
            @RequestBody OpeningRoleDTO dto) {
        return ResponseEntity.ok(openingRoleService.createOpeningRole(companyId, dto));
    }
}

package com.placement.tracker.controller;

import com.placement.tracker.dto.EligibilityResult;
import com.placement.tracker.service.EligibilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eligibility")
@CrossOrigin(origins = "http://localhost:4200")
public class EligibilityController {

    @Autowired
    private EligibilityService eligibilityService;

    @GetMapping("/check/{studentId}")
    public ResponseEntity<List<EligibilityResult>> checkEligibility(@PathVariable Long studentId) {
        return ResponseEntity.ok(eligibilityService.checkEligibility(studentId));
    }

    @GetMapping("/check/{studentId}/company/{companyId}")
    public ResponseEntity<EligibilityResult> checkCompanyEligibility(
            @PathVariable Long studentId, @PathVariable Long companyId) {
        return ResponseEntity.ok(eligibilityService.checkCompanyEligibility(studentId, companyId));
    }
}

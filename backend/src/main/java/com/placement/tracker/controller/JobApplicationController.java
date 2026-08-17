package com.placement.tracker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placement.tracker.dto.AppliedJobResponse;
import com.placement.tracker.dto.JobApplicationRequest;
import com.placement.tracker.entity.JobApplications;
import com.placement.tracker.service.JobApplicationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping("/{applicationId}")
    public ResponseEntity<JobApplications> getApplication( @PathVariable Long applicationId) {
        return ResponseEntity.ok(jobApplicationService.getApplicationById(applicationId));
    }

    @PostMapping("/company/{companyId}")
    public ResponseEntity<Map<String, Object>> apply(
            @PathVariable("companyId") Long companyId,
            @RequestBody JobApplicationRequest request) {

        jobApplicationService.apply(
                request.getStudentId(),
                companyId
        );

        return ResponseEntity.ok( Map.of(
                    "success", true,
                    "companyId", companyId,
                    "msg", "Application submitted successfully."));
    }

    @GetMapping("/applied-jobs/{studentId}")
    public List<AppliedJobResponse> appliedJobs( 
        @PathVariable("studentId") Long studentId){

        return jobApplicationService.getAppliedJobs(studentId);
    }
}

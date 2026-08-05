package com.placement.tracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placement.tracker.dto.JobApplicationRequest;
import com.placement.tracker.service.JobApplicationService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {
    private final JobApplicationService jobApplicationService;
    @Autowired
   @PostMapping("/{companyId}")
    public ResponseEntity<String> apply(
        @PathVariable Long companyId,
        @RequestBody JobApplicationRequest request) {

        jobApplicationService.apply(
            request.getStudentId(),
            companyId);

    return ResponseEntity.ok("Application submitted successfully.");
}
}
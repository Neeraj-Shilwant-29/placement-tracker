package com.placement.tracker.controller;

import com.placement.tracker.entity.MockInterview;
import com.placement.tracker.service.MockInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mock-interviews")
@CrossOrigin(origins = "http://localhost:4200")
public class MockInterviewController {

    @Autowired
    private MockInterviewService interviewService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<MockInterview>> getStudentInterviews(@PathVariable Long studentId) {
        return ResponseEntity.ok(interviewService.getStudentInterviews(studentId));
    }

    @PostMapping("/student/{studentId}")
    public ResponseEntity<MockInterview> addInterview(@RequestBody MockInterview interview, @PathVariable Long studentId) {
        return ResponseEntity.ok(interviewService.addInterview(interview, studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MockInterview> updateInterview(@PathVariable Long id, @RequestBody MockInterview interview) {
        return ResponseEntity.ok(interviewService.updateInterview(id, interview));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok("Interview deleted successfully");
    }
}

package com.placement.tracker.controller;

import com.placement.tracker.dto.ProgressDashboard;
import com.placement.tracker.entity.Student;
import com.placement.tracker.service.DashboardService;
import com.placement.tracker.service.AptitudeService;
import com.placement.tracker.service.CodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AptitudeService aptitudeService;

    @Autowired
    private CodingService codingService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ProgressDashboard> getStudentDashboard(@PathVariable Long studentId) {
        return ResponseEntity.ok(dashboardService.getStudentDashboard(studentId));
    }

    @GetMapping("/student/{studentId}/profile")
    public ResponseEntity<Student> getStudentProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(dashboardService.getStudentById(studentId));
    }

    @PutMapping("/student/{studentId}/profile")
    public ResponseEntity<Student> updateStudentProfile(@PathVariable Long studentId, @RequestBody Student student) {
        return ResponseEntity.ok(dashboardService.updateStudent(studentId, student));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", dashboardService.getTotalStudents());
        stats.put("totalAptitudeQuestions", aptitudeService.getTotalQuestions());
        stats.put("totalCodingQuestions", codingService.getTotalQuestions());
        return ResponseEntity.ok(stats);
    }
}

package com.placement.tracker.controller;

import com.placement.tracker.dto.AptitudeTestRequest;
import com.placement.tracker.dto.AptitudeTestSubmission;
import com.placement.tracker.entity.AptitudeQuestion;
import com.placement.tracker.entity.AptitudeResult;
import com.placement.tracker.service.AptitudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aptitude")
@CrossOrigin(origins = "http://localhost:4200")
public class AptitudeController {

    @Autowired
    private AptitudeService aptitudeService;

    @GetMapping("/questions")
    public ResponseEntity<List<AptitudeQuestion>> getQuestions(
            @RequestParam String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "10") int count) {
        AptitudeTestRequest request = new AptitudeTestRequest(category, difficulty, count);
        return ResponseEntity.ok(aptitudeService.getQuestions(request));
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitTest(
            @RequestBody AptitudeTestSubmission submission,
            @RequestParam Long studentId) {
        return ResponseEntity.ok(aptitudeService.submitTest(submission, studentId));
    }

    @GetMapping("/results/{studentId}")
    public ResponseEntity<List<AptitudeResult>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(aptitudeService.getStudentResults(studentId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Long> getTotalQuestions() {
        return ResponseEntity.ok(aptitudeService.getTotalQuestions());
    }

    // Admin endpoints
    @PostMapping("/admin/questions")
    public ResponseEntity<AptitudeQuestion> addQuestion(@RequestBody AptitudeQuestion question) {
        return ResponseEntity.ok(aptitudeService.addQuestion(question));
    }

    @PutMapping("/admin/questions/{id}")
    public ResponseEntity<AptitudeQuestion> updateQuestion(@PathVariable Long id, @RequestBody AptitudeQuestion question) {
        return ResponseEntity.ok(aptitudeService.updateQuestion(id, question));
    }

    @DeleteMapping("/admin/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        aptitudeService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    @GetMapping("/admin/questions")
    public ResponseEntity<List<AptitudeQuestion>> getAllQuestions() {
        return ResponseEntity.ok(aptitudeService.getAllQuestions());
    }
}

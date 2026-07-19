package com.placement.tracker.controller;

import com.placement.tracker.entity.CodingQuestion;
import com.placement.tracker.service.CodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coding")
@CrossOrigin(origins = "http://localhost:4200")
public class CodingController {

    @Autowired
    private CodingService codingService;

    @GetMapping("/questions")
    public ResponseEntity<List<CodingQuestion>> getAllQuestions() {
        return ResponseEntity.ok(codingService.getAllQuestions());
    }

    @GetMapping("/questions/category/{category}")
    public ResponseEntity<List<CodingQuestion>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(codingService.getQuestionsByCategory(category));
    }

    @GetMapping("/questions/difficulty/{difficulty}")
    public ResponseEntity<List<CodingQuestion>> getByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(codingService.getQuestionsByDifficulty(difficulty));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<CodingQuestion> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(codingService.getQuestionById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Long> getTotalQuestions() {
        return ResponseEntity.ok(codingService.getTotalQuestions());
    }

    // Admin endpoints
    @PostMapping("/admin/questions")
    public ResponseEntity<CodingQuestion> addQuestion(@RequestBody CodingQuestion question) {
        return ResponseEntity.ok(codingService.addQuestion(question));
    }

    @PutMapping("/admin/questions/{id}")
    public ResponseEntity<CodingQuestion> updateQuestion(@PathVariable Long id, @RequestBody CodingQuestion question) {
        return ResponseEntity.ok(codingService.updateQuestion(id, question));
    }

    @DeleteMapping("/admin/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        codingService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }
}

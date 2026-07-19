package com.placement.tracker.service;

import com.placement.tracker.entity.CodingQuestion;
import com.placement.tracker.repository.CodingQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CodingService {

    @Autowired
    private CodingQuestionRepository questionRepository;

    public List<CodingQuestion> getAllQuestions() {
        return questionRepository.findByActiveTrue();
    }

    public List<CodingQuestion> getQuestionsByCategory(String category) {
        return questionRepository.findByCategoryAndActiveTrue(category);
    }

    public List<CodingQuestion> getQuestionsByDifficulty(String difficulty) {
        return questionRepository.findByDifficultyAndActiveTrue(difficulty);
    }

    public CodingQuestion getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public long getTotalQuestions() {
        return questionRepository.countByActiveTrue();
    }

    // Admin methods
    public CodingQuestion addQuestion(CodingQuestion question) {
        return questionRepository.save(question);
    }

    public CodingQuestion updateQuestion(Long id, CodingQuestion updated) {
        CodingQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setTitle(updated.getTitle());
        question.setDescription(updated.getDescription());
        question.setDifficulty(updated.getDifficulty());
        question.setCategory(updated.getCategory());
        question.setSampleInput(updated.getSampleInput());
        question.setSampleOutput(updated.getSampleOutput());
        question.setConstraints(updated.getConstraints());
        question.setSolution(updated.getSolution());
        question.setLanguage(updated.getLanguage());
        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        CodingQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setActive(false);
        questionRepository.save(question);
    }
}

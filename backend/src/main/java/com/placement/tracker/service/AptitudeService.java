package com.placement.tracker.service;

import com.placement.tracker.dto.AptitudeTestRequest;
import com.placement.tracker.dto.AptitudeTestSubmission;
import com.placement.tracker.entity.AptitudeQuestion;
import com.placement.tracker.entity.AptitudeResult;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.AptitudeQuestionRepository;
import com.placement.tracker.repository.AptitudeResultRepository;
import com.placement.tracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AptitudeService {

    @Autowired
    private AptitudeQuestionRepository questionRepository;

    @Autowired
    private AptitudeResultRepository resultRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<AptitudeQuestion> getQuestions(AptitudeTestRequest request) {
        List<AptitudeQuestion> questions;
        if (request.getDifficulty() != null && !request.getDifficulty().isEmpty()) {
            questions = questionRepository.findByCategoryAndDifficultyAndActiveTrue(
                    request.getCategory(), request.getDifficulty());
        } else {
            questions = questionRepository.findByCategoryAndActiveTrue(request.getCategory());
        }
        Collections.shuffle(questions);
        return questions.stream().limit(request.getQuestionCount()).collect(Collectors.toList());
    }

    public Map<String, Object> submitTest(AptitudeTestSubmission submission, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        int correct = 0;
        int total = submission.getAnswers().size();

        for (AptitudeTestSubmission.Answer answer : submission.getAnswers()) {
            AptitudeQuestion question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            if (question.getCorrectAnswer().equalsIgnoreCase(answer.getSelectedAnswer())) {
                correct++;
            }
        }

        int marks = correct * 10;

        AptitudeResult result = AptitudeResult.builder()
                .student(student)
                .category(submission.getCategory())
                .totalQuestions(total)
                .correctAnswers(correct)
                .marksObtained(marks)
                .timeTakenSeconds(submission.getTimeTakenSeconds())
                .difficulty(submission.getDifficulty())
                .build();

        resultRepository.save(result);

        Map<String, Object> response = new HashMap<>();
        response.put("totalQuestions", total);
        response.put("correctAnswers", correct);
        response.put("marksObtained", marks);
        response.put("timeTaken", submission.getTimeTakenSeconds());
        return response;
    }

    public List<AptitudeResult> getStudentResults(Long studentId) {
        return resultRepository.findByStudentIdOrderByAttemptedAtDesc(studentId);
    }

    public long getTotalQuestions() {
        return questionRepository.countByActiveTrue();
    }

    // Admin methods
    public AptitudeQuestion addQuestion(AptitudeQuestion question) {
        return questionRepository.save(question);
    }

    public AptitudeQuestion updateQuestion(Long id, AptitudeQuestion updated) {
        AptitudeQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setQuestion(updated.getQuestion());
        question.setOptionA(updated.getOptionA());
        question.setOptionB(updated.getOptionB());
        question.setOptionC(updated.getOptionC());
        question.setOptionD(updated.getOptionD());
        question.setCorrectAnswer(updated.getCorrectAnswer());
        question.setCategory(updated.getCategory());
        question.setDifficulty(updated.getDifficulty());
        question.setExplanation(updated.getExplanation());
        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        AptitudeQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setActive(false);
        questionRepository.save(question);
    }

    public List<AptitudeQuestion> getAllQuestions() {
        return questionRepository.findByActiveTrue();
    }
}

package com.placement.tracker.service;

import com.placement.tracker.entity.MockInterview;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.MockInterviewRepository;
import com.placement.tracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MockInterviewService {

    @Autowired
    private MockInterviewRepository interviewRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<MockInterview> getStudentInterviews(Long studentId) {
        return interviewRepository.findByStudentIdOrderByInterviewDateDesc(studentId);
    }

    public MockInterview addInterview(MockInterview interview, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        interview.setStudent(student);

        int overall = (int) ((interview.getTechnicalScore() + interview.getAptitudeScore() +
                interview.getCommunicationScore()) / 3.0);
        interview.setOverallScore(overall);

        return interviewRepository.save(interview);
    }

    public MockInterview updateInterview(Long id, MockInterview updated) {
        MockInterview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setTechnicalScore(updated.getTechnicalScore());
        interview.setAptitudeScore(updated.getAptitudeScore());
        interview.setCommunicationScore(updated.getCommunicationScore());
        interview.setFeedback(updated.getFeedback());
        interview.setInterviewerName(updated.getInterviewerName());
        interview.setStatus(updated.getStatus());

        int overall = (int) ((updated.getTechnicalScore() + updated.getAptitudeScore() +
                updated.getCommunicationScore()) / 3.0);
        interview.setOverallScore(overall);

        return interviewRepository.save(interview);
    }

    public void deleteInterview(Long id) {
        interviewRepository.deleteById(id);
    }

    public long getInterviewCount(Long studentId) {
        return interviewRepository.getInterviewCountByStudentId(studentId);
    }

    public Double getAverageScore(Long studentId) {
        return interviewRepository.getAverageScoreByStudentId(studentId);
    }
}

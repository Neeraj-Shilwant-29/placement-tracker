package com.placement.tracker.service;

import com.placement.tracker.dto.ProgressDashboard;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AptitudeQuestionRepository aptitudeQuestionRepository;

    @Autowired
    private AptitudeResultRepository aptitudeResultRepository;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @Autowired
    private MockInterviewRepository mockInterviewRepository;

    public ProgressDashboard getStudentDashboard(Long studentId) {
        ProgressDashboard dashboard = new ProgressDashboard();
        dashboard.setTotalCompanies(companyRepository.count());
        dashboard.setTotalAptitudeQuestions(aptitudeQuestionRepository.countByActiveTrue());
        dashboard.setTotalCodingQuestions(codingQuestionRepository.countByActiveTrue());
        dashboard.setAptitudeTestsCompleted(aptitudeResultRepository.getTestCountByStudentId(studentId));
        dashboard.setAverageAptitudeScore(aptitudeResultRepository.getAverageMarksByStudentId(studentId));
        dashboard.setMockInterviewsCompleted(mockInterviewRepository.getInterviewCountByStudentId(studentId));
        dashboard.setAverageInterviewScore(mockInterviewRepository.getAverageScoreByStudentId(studentId));
        return dashboard;
    }

    public long getTotalStudents() {
        return studentRepository.count();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student updateStudent(Long id, Student updated) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setFullName(updated.getFullName());
        student.setPhone(updated.getPhone());
        student.setCollege(updated.getCollege());
        student.setBranch(updated.getBranch());
        student.setCgpa(updated.getCgpa());
        return studentRepository.save(student);
    }
}

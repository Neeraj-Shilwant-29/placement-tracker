package com.placement.tracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mock_interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockInterview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String interviewType;

    @Column(nullable = false)
    private int technicalScore;

    @Column(nullable = false)
    private int aptitudeScore;

    @Column(nullable = false)
    private int communicationScore;

    @Column(nullable = false)
    private int overallScore;

    private String feedback;
    private String interviewerName;

    @Column(nullable = false)
    private String status;

    private String company;

    @Column(updatable = false)
    private LocalDateTime interviewDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        interviewDate = LocalDateTime.now();
        createdAt = LocalDateTime.now();
    }
}

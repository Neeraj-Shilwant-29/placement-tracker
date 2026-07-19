package com.placement.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDashboard {
    private long totalCompanies;
    private long totalAptitudeQuestions;
    private long totalCodingQuestions;
    private long aptitudeTestsCompleted;
    private Double averageAptitudeScore;
    private long mockInterviewsCompleted;
    private Double averageInterviewScore;
}

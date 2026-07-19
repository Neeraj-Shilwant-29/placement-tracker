package com.placement.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeTestSubmission {
    private String category;
    private String difficulty;
    private List<Answer> answers;
    private int timeTakenSeconds;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Answer {
        private Long questionId;
        private String selectedAnswer;
    }
}

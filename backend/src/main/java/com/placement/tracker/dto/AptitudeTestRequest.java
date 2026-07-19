package com.placement.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeTestRequest {
    private String category;
    private String difficulty;
    private int questionCount;
}

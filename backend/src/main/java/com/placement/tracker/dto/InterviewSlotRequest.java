package com.placement.tracker.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewSlotRequest {
    private Long interviewerId;
    private String interviewerName;
    private String interviewerEmail;
    private String interviewType;
    private String company;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}

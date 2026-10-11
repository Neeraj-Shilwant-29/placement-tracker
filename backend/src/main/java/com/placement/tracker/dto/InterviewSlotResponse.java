package com.placement.tracker.dto;

import com.placement.tracker.entity.InterviewSlot;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class InterviewSlotResponse {
    private Long id;
    private Long interviewerId;
    private String interviewerName;
    private String interviewType;
    private String company;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Long bookedBy;
    private String bookedByName;
    private String googleMeetLink;

    public static InterviewSlotResponse from(InterviewSlot slot) {
        return InterviewSlotResponse.builder()
                .id(slot.getId())
                .interviewerId(slot.getInterviewerId())
                .interviewerName(slot.getInterviewerName())
                .interviewType(slot.getInterviewType())
                .company(slot.getCompany())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus())
                .bookedBy(slot.getBookedBy() != null ? slot.getBookedBy().getId() : null)
                .bookedByName(slot.getBookedBy() != null ? slot.getBookedBy().getFullName() : null)
                .googleMeetLink(slot.getGoogleMeetLink())
                .build();
    }
}

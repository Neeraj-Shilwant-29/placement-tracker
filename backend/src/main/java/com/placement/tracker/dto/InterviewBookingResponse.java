package com.placement.tracker.dto;

import com.placement.tracker.entity.InterviewBooking;
import com.placement.tracker.entity.InterviewSlot;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class InterviewBookingResponse {
    private Long id;
    private Long slotId;
    private String status;
    private String interviewType;
    private String company;
    private String interviewerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String googleEventId;
    private String googleMeetLink;
    private LocalDateTime bookedAt;

    public static InterviewBookingResponse from(InterviewBooking booking) {
        InterviewSlot slot = booking.getSlot();
        return InterviewBookingResponse.builder()
                .id(booking.getId())
                .slotId(slot.getId())
                .status(booking.getStatus())
                .interviewType(slot.getInterviewType())
                .company(slot.getCompany())
                .interviewerName(slot.getInterviewerName())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .googleEventId(booking.getGoogleEventId())
                .googleMeetLink(booking.getGoogleMeetLink())
                .bookedAt(booking.getBookedAt())
                .build();
    }
}

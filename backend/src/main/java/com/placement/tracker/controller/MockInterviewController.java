package com.placement.tracker.controller;

import com.placement.tracker.dto.InterviewBookingRequest;
import com.placement.tracker.dto.InterviewBookingResponse;
import com.placement.tracker.dto.InterviewSlotRequest;
import com.placement.tracker.dto.InterviewSlotResponse;
import com.placement.tracker.dto.InterviewStatusRequest;
import com.placement.tracker.entity.MockInterview;
import com.placement.tracker.service.MockInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mock-interviews")
@CrossOrigin(origins = "http://localhost:4200")
public class MockInterviewController {

    @Autowired
    private MockInterviewService interviewService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<MockInterview>> getStudentInterviews(@PathVariable Long studentId) {
        return ResponseEntity.ok(interviewService.getStudentInterviews(studentId));
    }

    @PostMapping("/student/{studentId}")
    public ResponseEntity<MockInterview> addInterview(@RequestBody MockInterview interview, @PathVariable Long studentId) {
        return ResponseEntity.ok(interviewService.addInterview(interview, studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MockInterview> updateInterview(@PathVariable Long id, @RequestBody MockInterview interview) {
        return ResponseEntity.ok(interviewService.updateInterview(id, interview));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok("Interview deleted successfully");
    }

    @GetMapping("/slots")
    public ResponseEntity<List<InterviewSlotResponse>> getSlots(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(interviewService.getSlots(startDate, endDate));
    }

    @GetMapping("/bookings/me")
    public ResponseEntity<List<InterviewBookingResponse>> getMyBookings(Principal principal) {
        return ResponseEntity.ok(interviewService.getMyBookings(principal.getName()));
    }

    @PostMapping("/bookings")
    public ResponseEntity<InterviewBookingResponse> bookSlot(
            @RequestBody InterviewBookingRequest request,
            Principal principal) {
        return ResponseEntity.ok(interviewService.bookSlot(request.getSlotId(), principal.getName()));
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<InterviewBookingResponse> cancelBooking(
            @PathVariable Long bookingId,
            Principal principal) {
        return ResponseEntity.ok(interviewService.cancelBooking(bookingId, principal.getName()));
    }

    @PostMapping("/bookings/{bookingId}/reschedule")
    public ResponseEntity<InterviewBookingResponse> rescheduleBooking(
            @PathVariable Long bookingId,
            @RequestBody InterviewBookingRequest request,
            Principal principal) {
        return ResponseEntity.ok(interviewService.rescheduleBooking(bookingId, request.getSlotId(), principal.getName()));
    }

    @GetMapping("/admin/slots")
    public ResponseEntity<List<InterviewSlotResponse>> getAdminSlots(@RequestParam LocalDate date) {
        return ResponseEntity.ok(interviewService.getAdminSlots(date));
    }

    @PostMapping("/admin/slots")
    public ResponseEntity<InterviewSlotResponse> createAdminSlot(@RequestBody InterviewSlotRequest request) {
        return ResponseEntity.ok(interviewService.createSlot(request));
    }

    @PutMapping("/admin/slots/{slotId}")
    public ResponseEntity<InterviewSlotResponse> updateAdminSlot(
            @PathVariable Long slotId,
            @RequestBody InterviewSlotRequest request) {
        return ResponseEntity.ok(interviewService.updateSlot(slotId, request));
    }

    @PostMapping("/admin/slots/{slotId}/cancel")
    public ResponseEntity<InterviewSlotResponse> cancelAdminSlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(interviewService.cancelSlot(slotId));
    }

    @PatchMapping("/admin/slots/{slotId}/status")
    public ResponseEntity<InterviewSlotResponse> updateAdminSlotStatus(
            @PathVariable Long slotId,
            @RequestBody InterviewStatusRequest request) {
        return ResponseEntity.ok(interviewService.updateSlotStatus(slotId, request.getStatus()));
    }
}

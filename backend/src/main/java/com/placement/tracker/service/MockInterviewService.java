package com.placement.tracker.service;

import com.placement.tracker.dto.InterviewBookingResponse;
import com.placement.tracker.dto.InterviewSlotRequest;
import com.placement.tracker.dto.InterviewSlotResponse;
import com.placement.tracker.entity.InterviewBooking;
import com.placement.tracker.entity.InterviewSlot;
import com.placement.tracker.entity.MockInterview;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.InterviewBookingRepository;
import com.placement.tracker.repository.InterviewSlotRepository;
import com.placement.tracker.repository.MockInterviewRepository;
import com.placement.tracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MockInterviewService {
    private static final String AVAILABLE = "AVAILABLE";
    private static final String BOOKED = "BOOKED";
    private static final String CANCELLED = "CANCELLED";
    private static final String COMPLETED = "COMPLETED";
    private static final String NO_SHOW = "NO_SHOW";
    private static final String CONFIRMED = "CONFIRMED";

    @Autowired
    private MockInterviewRepository interviewRepository;

    @Autowired
    private InterviewSlotRepository slotRepository;

    @Autowired
    private InterviewBookingRepository bookingRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GoogleCalendarService googleCalendarService;

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
        interview.setInterviewType(updated.getInterviewType());
        interview.setTechnicalScore(updated.getTechnicalScore());
        interview.setAptitudeScore(updated.getAptitudeScore());
        interview.setCommunicationScore(updated.getCommunicationScore());
        interview.setFeedback(updated.getFeedback());
        interview.setInterviewerName(updated.getInterviewerName());
        interview.setStatus(updated.getStatus());
        interview.setCompany(updated.getCompany());

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

    public List<InterviewSlotResponse> getSlots(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        return slotRepository.findByStartTimeBetweenOrderByStartTimeAsc(start, end).stream()
                .map(InterviewSlotResponse::from)
                .collect(Collectors.toList());
    }

    public List<InterviewSlotResponse> getAdminSlots(LocalDate date) {
        return getSlots(date, date);
    }

    @Transactional
    public InterviewSlotResponse createSlot(InterviewSlotRequest request) {
        validateSlotRequest(request);
        ensureInterviewerHasNoOverlap(null, request);

        InterviewSlot slot = InterviewSlot.builder()
                .interviewerId(request.getInterviewerId())
                .interviewerName(request.getInterviewerName().trim())
                .interviewerEmail(trimToNull(request.getInterviewerEmail()))
                .interviewType(defaultText(request.getInterviewType(), "Technical Mock Interview"))
                .company(trimToNull(request.getCompany()))
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(normalizeStatus(defaultText(request.getStatus(), AVAILABLE)))
                .build();

        return InterviewSlotResponse.from(slotRepository.save(slot));
    }

    @Transactional
    public InterviewSlotResponse updateSlot(Long slotId, InterviewSlotRequest request) {
        InterviewSlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> notFound("Interview slot not found"));

        if (BOOKED.equals(slot.getStatus())) {
            throw badRequest("Booked slots cannot be edited. Cancel or reschedule the booking first.");
        }

        validateSlotRequest(request);
        ensureInterviewerHasNoOverlap(slotId, request);

        slot.setInterviewerId(request.getInterviewerId());
        slot.setInterviewerName(request.getInterviewerName().trim());
        slot.setInterviewerEmail(trimToNull(request.getInterviewerEmail()));
        slot.setInterviewType(defaultText(request.getInterviewType(), "Technical Mock Interview"));
        slot.setCompany(trimToNull(request.getCompany()));
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setStatus(normalizeStatus(defaultText(request.getStatus(), AVAILABLE)));

        return InterviewSlotResponse.from(slotRepository.save(slot));
    }

    @Transactional
    public InterviewSlotResponse cancelSlot(Long slotId) {
        InterviewSlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> notFound("Interview slot not found"));

        slot.setStatus(CANCELLED);
        bookingRepository.findFirstBySlotIdAndStatus(slotId, CONFIRMED).ifPresent(booking -> {
            booking.setStatus(CANCELLED);
            bookingRepository.save(booking);
        });

        return InterviewSlotResponse.from(slotRepository.save(slot));
    }

    @Transactional
    public InterviewSlotResponse updateSlotStatus(Long slotId, String status) {
        InterviewSlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> notFound("Interview slot not found"));
        String normalized = normalizeStatus(status);

        if ((COMPLETED.equals(normalized) || NO_SHOW.equals(normalized)) && !BOOKED.equals(slot.getStatus())) {
            throw badRequest("Only booked interviews can be marked as " + normalized + ".");
        }

        slot.setStatus(normalized);
        bookingRepository.findFirstBySlotIdAndStatus(slotId, CONFIRMED).ifPresent(booking -> {
            if (COMPLETED.equals(normalized) || NO_SHOW.equals(normalized) || CANCELLED.equals(normalized)) {
                booking.setStatus(normalized);
                bookingRepository.save(booking);
            }
        });

        return InterviewSlotResponse.from(slotRepository.save(slot));
    }

    public List<InterviewBookingResponse> getMyBookings(String email) {
        Student student = getStudentByEmail(email);
        return bookingRepository.findByStudentIdOrderBySlotStartTimeAsc(student.getId()).stream()
                .map(InterviewBookingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewBookingResponse bookSlot(Long slotId, String email) {
        if (slotId == null) {
            throw badRequest("Slot id is required.");
        }
        Student student = getStudentByEmail(email);
        InterviewSlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> notFound("Interview slot not found"));

        ensureSlotCanBeBooked(slot);
        ensureStudentHasNoOverlap(student.getId(), null, slot);

        GoogleCalendarService.GoogleMeetEvent meetEvent = googleCalendarService.createMeetEvent(slot, student);
        slot.setStatus(BOOKED);
        slot.setBookedBy(student);
        slot.setGoogleEventId(meetEvent.eventId());
        slot.setGoogleMeetLink(meetEvent.meetLink());

        InterviewBooking booking = InterviewBooking.builder()
                .slot(slot)
                .student(student)
                .status(CONFIRMED)
                .googleEventId(meetEvent.eventId())
                .googleMeetLink(meetEvent.meetLink())
                .build();

        slotRepository.save(slot);
        return InterviewBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public InterviewBookingResponse cancelBooking(Long bookingId, String email) {
        Student student = getStudentByEmail(email);
        InterviewBooking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> notFound("Interview booking not found"));

        ensureBookingBelongsToStudent(booking, student);
        if (!CONFIRMED.equals(booking.getStatus())) {
            throw badRequest("Only confirmed bookings can be cancelled.");
        }

        InterviewSlot slot = slotRepository.findByIdForUpdate(booking.getSlot().getId())
                .orElseThrow(() -> notFound("Interview slot not found"));
        googleCalendarService.deleteEvent(booking.getGoogleEventId());
        booking.setStatus(CANCELLED);
        slot.setStatus(AVAILABLE);
        slot.setBookedBy(null);
        slot.setGoogleEventId(null);
        slot.setGoogleMeetLink(null);

        slotRepository.save(slot);
        return InterviewBookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public InterviewBookingResponse rescheduleBooking(Long bookingId, Long newSlotId, String email) {
        if (newSlotId == null) {
            throw badRequest("New slot id is required.");
        }
        Student student = getStudentByEmail(email);
        InterviewBooking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> notFound("Interview booking not found"));

        ensureBookingBelongsToStudent(booking, student);
        if (!CONFIRMED.equals(booking.getStatus())) {
            throw badRequest("Only confirmed bookings can be rescheduled.");
        }

        InterviewSlot oldSlot = slotRepository.findByIdForUpdate(booking.getSlot().getId())
                .orElseThrow(() -> notFound("Current interview slot not found"));
        InterviewSlot newSlot = slotRepository.findByIdForUpdate(newSlotId)
                .orElseThrow(() -> notFound("New interview slot not found"));

        ensureSlotCanBeBooked(newSlot);
        ensureStudentHasNoOverlap(student.getId(), booking.getId(), newSlot);

        oldSlot.setStatus(AVAILABLE);
        oldSlot.setBookedBy(null);
        oldSlot.setGoogleMeetLink(null);

        googleCalendarService.deleteEvent(booking.getGoogleEventId());
        GoogleCalendarService.GoogleMeetEvent meetEvent = googleCalendarService.createMeetEvent(newSlot, student);
        newSlot.setStatus(BOOKED);
        newSlot.setBookedBy(student);
        newSlot.setGoogleEventId(meetEvent.eventId());
        newSlot.setGoogleMeetLink(meetEvent.meetLink());

        booking.setSlot(newSlot);
        booking.setGoogleEventId(meetEvent.eventId());
        booking.setGoogleMeetLink(meetEvent.meetLink());

        slotRepository.save(oldSlot);
        slotRepository.save(newSlot);
        return InterviewBookingResponse.from(bookingRepository.save(booking));
    }

    private void validateSlotRequest(InterviewSlotRequest request) {
        if (request.getInterviewerName() == null || request.getInterviewerName().isBlank()) {
            throw badRequest("Interviewer name is required.");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw badRequest("Start time and end time are required.");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw badRequest("End time must be after start time.");
        }
        normalizeStatus(defaultText(request.getStatus(), AVAILABLE));
    }

    private void ensureInterviewerHasNoOverlap(Long slotId, InterviewSlotRequest request) {
        long conflicts = slotRepository.countOverlappingInterviewerSlots(
                slotId == null ? -1L : slotId,
                request.getInterviewerId(),
                request.getInterviewerName().trim(),
                request.getStartTime(),
                request.getEndTime());

        if (conflicts > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This interviewer already has a slot at an overlapping time.");
        }
    }

    private void ensureSlotCanBeBooked(InterviewSlot slot) {
        if (!AVAILABLE.equals(slot.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This interview slot has already been booked by another user.");
        }
        if (!slot.getStartTime().isAfter(LocalDateTime.now())) {
            throw badRequest("Past interview slots cannot be booked.");
        }
    }

    private void ensureStudentHasNoOverlap(Long studentId, Long excludeBookingId, InterviewSlot slot) {
        long conflicts = bookingRepository.countOverlappingConfirmedBookings(
                studentId,
                excludeBookingId,
                slot.getStartTime(),
                slot.getEndTime());

        if (conflicts > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have another interview at an overlapping time.");
        }
    }

    private void ensureBookingBelongsToStudent(InterviewBooking booking, Student student) {
        if (!booking.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This booking does not belong to you.");
        }
    }

    private Student getStudentByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> notFound("Student not found"));
    }

    private String normalizeStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        Set<String> allowed = Set.of(AVAILABLE, BOOKED, CANCELLED, COMPLETED, NO_SHOW);
        if (!allowed.contains(normalized)) {
            throw badRequest("Unsupported interview slot status.");
        }
        return normalized;
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}

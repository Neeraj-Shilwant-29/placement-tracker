package com.placement.tracker.service;

import com.placement.tracker.entity.InterviewSlot;
import com.placement.tracker.entity.Student;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
public class GoogleCalendarService {

    @Value("${google.calendar.access-token:}")
    private String accessToken;

    @Value("${google.calendar.calendar-id:primary}")
    private String calendarId;

    @Value("${google.calendar.time-zone:Asia/Kolkata}")
    private String timeZone;

    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleMeetEvent createMeetEvent(InterviewSlot slot, Student student) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Google Calendar access token is not configured. Set GOOGLE_CALENDAR_ACCESS_TOKEN to create Meet links.");
        }

        String url = UriComponentsBuilder
                .fromUriString("https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events")
                .queryParam("conferenceDataVersion", "1")
                .queryParam("sendUpdates", "all")
                .buildAndExpand(calendarId)
                .toUriString();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("summary", defaultText(slot.getInterviewType(), "Mock Interview"));
        body.put("description", "Placement mock interview"
                + (slot.getCompany() == null ? "" : " for " + slot.getCompany()));
        body.put("start", Map.of(
                "dateTime", slot.getStartTime().toString(),
                "timeZone", timeZone));
        body.put("end", Map.of(
                "dateTime", slot.getEndTime().toString(),
                "timeZone", timeZone));
        body.put("attendees", buildAttendees(slot, student));
        body.put("conferenceData", Map.of(
                "createRequest", Map.of(
                        "requestId", UUID.randomUUID().toString(),
                        "conferenceSolutionKey", Map.of("type", "hangoutsMeet"))));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class);

            Map<?, ?> event = response.getBody();
            if (event == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Google Calendar returned an empty response.");
            }

            String eventId = asString(event.get("id"));
            String meetLink = extractMeetLink(event);
            if ((meetLink == null || meetLink.isBlank()) && eventId != null) {
                meetLink = waitForMeetLink(eventId, headers);
            }
            if (meetLink == null || meetLink.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Google Calendar did not return a Meet link.");
            }

            return new GoogleMeetEvent(eventId, meetLink);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to create Google Meet link from Google Calendar.",
                    ex);
        }
    }

    private String waitForMeetLink(String eventId, HttpHeaders headers) {
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                Thread.sleep(1000);
                String url = UriComponentsBuilder
                        .fromUriString("https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}")
                        .queryParam("conferenceDataVersion", "1")
                        .buildAndExpand(calendarId, eventId)
                        .toUriString();

                ResponseEntity<Map> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Map.class);
                String meetLink = extractMeetLink(response.getBody());
                if (meetLink != null && !meetLink.isBlank()) {
                    return meetLink;
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                return null;
            } catch (RestClientException ignored) {
                return null;
            }
        }
        return null;
    }

    public void deleteEvent(String googleEventId) {
        if (googleEventId == null || googleEventId.isBlank() || accessToken == null || accessToken.isBlank()) {
            return;
        }

        String url = UriComponentsBuilder
                .fromUriString("https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}")
                .queryParam("sendUpdates", "all")
                .buildAndExpand(calendarId, googleEventId)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
        } catch (RestClientException ignored) {
            // Local cancellation should still complete if Google cleanup fails.
        }
    }

    private List<Map<String, String>> buildAttendees(InterviewSlot slot, Student student) {
        List<Map<String, String>> attendees = new ArrayList<>();
        attendees.add(Map.of("email", student.getEmail()));
        if (slot.getInterviewerEmail() != null && !slot.getInterviewerEmail().isBlank()) {
            attendees.add(Map.of("email", slot.getInterviewerEmail()));
        }
        return attendees;
    }

    private String extractMeetLink(Map<?, ?> event) {
        String hangoutLink = asString(event.get("hangoutLink"));
        if (hangoutLink != null && !hangoutLink.isBlank()) {
            return hangoutLink;
        }

        Object conferenceDataObject = event.get("conferenceData");
        if (!(conferenceDataObject instanceof Map<?, ?> conferenceData)) {
            return null;
        }

        Object entryPointsObject = conferenceData.get("entryPoints");
        if (!(entryPointsObject instanceof List<?> entryPoints)) {
            return null;
        }

        for (Object entryPointObject : entryPoints) {
            if (entryPointObject instanceof Map<?, ?> entryPoint
                    && "video".equals(asString(entryPoint.get("entryPointType")))) {
                return asString(entryPoint.get("uri"));
            }
        }
        return null;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    public record GoogleMeetEvent(String eventId, String meetLink) {
    }
}

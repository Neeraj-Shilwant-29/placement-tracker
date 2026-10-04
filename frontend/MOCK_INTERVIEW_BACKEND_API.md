# Mock Interview Booking API Contract

The Angular page now expects the backend to expose calendar/booking endpoints under:

`/api/mock-interviews`

The existing authentication interceptor already sends the logged-in user's JWT as:

`Authorization: Bearer <token>`

## 1. Get slots

### Request

`GET /api/mock-interviews/slots?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Response

```json
[
  {
    "id": 101,
    "interviewerName": "Amit Sharma",
    "interviewType": "Technical",
    "company": "Placement Team",
    "startTime": "2026-10-15T10:00:00+05:30",
    "endTime": "2026-10-15T10:30:00+05:30",
    "status": "AVAILABLE"
  }
]
```

Allowed slot statuses:

- AVAILABLE
- BOOKED
- CANCELLED
- COMPLETED
- NO_SHOW

## 2. Get the logged-in student's bookings

`GET /api/mock-interviews/bookings/me`

Response:

```json
[
  {
    "id": 123,
    "slotId": 101,
    "status": "CONFIRMED",
    "interviewType": "Technical",
    "interviewerName": "Amit Sharma",
    "startTime": "2026-10-15T10:00:00+05:30",
    "endTime": "2026-10-15T10:30:00+05:30",
    "googleEventId": "abc123",
    "googleMeetLink": "https://meet.google.com/example"
  }
]
```

The backend should identify the student from the authenticated JWT. Do not trust a `studentId` supplied by the browser.

## 3. Book a slot

`POST /api/mock-interviews/bookings`

Request:

```json
{
  "slotId": 101
}
```

Response:

```json
{
  "id": 123,
  "slotId": 101,
  "status": "CONFIRMED",
  "interviewerName": "Amit Sharma",
  "startTime": "2026-10-15T10:00:00+05:30",
  "endTime": "2026-10-15T10:30:00+05:30",
  "googleEventId": "abc123",
  "googleMeetLink": "https://meet.google.com/example"
}
```

### Double booking

The backend MUST make booking atomic.

If two users book the same slot at nearly the same time, exactly one request must succeed.

The losing request should return:

**HTTP 409 Conflict**

```json
{
  "message": "This interview slot has already been booked by another user."
}
```

Do not implement this as a frontend-only check.

## 4. Cancel

`POST /api/mock-interviews/bookings/{bookingId}/cancel`

Expected behavior:

- Verify the booking belongs to the authenticated student.
- Verify it is cancellable.
- Cancel/update the corresponding Google Calendar event.
- Apply the project's business rule for making the slot available again.
- Return the updated booking or a success response.

## 5. Reschedule

`POST /api/mock-interviews/bookings/{bookingId}/reschedule`

Request:

```json
{
  "slotId": 205
}
```

Expected behavior:

- Verify the original booking belongs to the authenticated student.
- Verify the new slot is AVAILABLE.
- Prevent overlapping bookings.
- Atomically move the booking to the new slot.
- Update/recreate the Google Calendar event.
- Return the new Google Meet URL if it changes.
- Return HTTP 409 if another user takes the new slot first.

## 6. Google Calendar / Meet

Google credentials and OAuth tokens belong on the backend, never in Angular.

When a booking is created, the backend should create a Google Calendar event with:

- Student as attendee
- Interviewer as attendee when applicable
- Correct start/end time and timezone
- Google Meet conference data

Persist:

- `googleEventId`
- `googleMeetLink`

Return the Meet URL to Angular.

## 7. Timezone

Prefer storing timestamps in UTC in the database and returning timezone-aware ISO 8601 timestamps to the frontend.

Examples:

`2026-10-15T04:30:00Z`

or

`2026-10-15T10:00:00+05:30`

Do not return ambiguous timestamps such as `2026-10-15T10:00:00` unless the backend has a documented timezone convention.

## 8. Student overlap rule

The backend should reject a booking when the same student already has another confirmed interview whose time overlaps the requested slot.

For overlapping ranges:

`newStart < existingEnd && newEnd > existingStart`

return HTTP 409 with a useful message.

## 9. Interviewer overlap rule

The backend should prevent an interviewer from having overlapping available/booked slots.

## 10. Frontend file changes

The frontend implementation is in:

- `src/app/components/mock-interview/mock-interview.component.ts`
- `src/app/components/mock-interview/mock-interview.component.html`
- `src/app/components/mock-interview/mock-interview.component.scss`
- `src/app/services/mock-interview.service.ts`

The existing interview-record CRUD methods were intentionally retained for compatibility.

## 11. Admin slot management

The frontend now includes an admin Mock Interview page at:

`/admin/mock-interview`

The admin UI expects these endpoints under `/api/mock-interviews`:

### Get admin slots

`GET /api/mock-interviews/admin/slots?date=YYYY-MM-DD`

Returns slots for the selected day. Each slot may include `bookedByName`, `bookedBy`, and `googleMeetLink` when applicable.

### Create slot

`POST /api/mock-interviews/admin/slots`

Request example:

```json
{
  "interviewerId": 5,
  "interviewerName": "Amit Sharma",
  "interviewerEmail": "amit@example.com",
  "interviewType": "Technical Mock Interview",
  "company": "Placement Team",
  "startTime": "2026-10-15T10:00",
  "endTime": "2026-10-15T10:30",
  "status": "AVAILABLE"
}
```

### Update slot

`PUT /api/mock-interviews/admin/slots/{slotId}`

Use the same slot fields as the create request. The backend should reject time conflicts with HTTP 409.

### Cancel slot

`POST /api/mock-interviews/admin/slots/{slotId}/cancel`

If the slot is already booked, the backend should also apply the appropriate Google Calendar cancellation/notification rule and return a clear result.

### Update slot status

`PATCH /api/mock-interviews/admin/slots/{slotId}/status`

Request:

```json
{ "status": "COMPLETED" }
```

Supported statuses:

- AVAILABLE
- BOOKED
- CANCELLED
- COMPLETED
- NO_SHOW

The admin UI supports:

- Create slot
- Edit slot
- Cancel slot
- View booked student
- View interviewer
- Mark COMPLETED / NO_SHOW
- View Google Meet link
- Filter by status


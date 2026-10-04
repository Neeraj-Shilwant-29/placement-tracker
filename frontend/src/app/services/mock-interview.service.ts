import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InterviewSlot {
  id: number;
  interviewerId?: number;
  interviewerName?: string;
  interviewType?: string;
  company?: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | string;
  bookedBy?: number | null;
  bookedByName?: string | null;
  googleMeetLink?: string | null;
}

export interface InterviewBooking {
  id: number;
  slotId: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | string;
  interviewType?: string;
  company?: string;
  interviewerName?: string;
  startTime: string;
  endTime: string;
  googleEventId?: string | null;
  googleMeetLink?: string | null;
  bookedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MockInterviewService {
  private apiUrl = `${environment.apiBaseUrl}/mock-interviews`;

  constructor(private http: HttpClient) {}

  // Existing interview-record APIs are kept for compatibility.
  getStudentInterviews(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/student/${studentId}`);
  }

  addInterview(interview: any, studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/${studentId}`, interview);
  }

  updateInterview(id: number, interview: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, interview);
  }

  deleteInterview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Calendar booking APIs.
  getSlots(startDate: string, endDate: string): Observable<InterviewSlot[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<InterviewSlot[]>(
      `${this.apiUrl}/slots`,
      { params }
    );
  }

  getMyBookings(): Observable<InterviewBooking[]> {
    return this.http.get<InterviewBooking[]>(
      `${this.apiUrl}/bookings/me`
    );
  }

  bookSlot(slotId: number): Observable<InterviewBooking> {
    return this.http.post<InterviewBooking>(
      `${this.apiUrl}/bookings`,
      { slotId }
    );
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/bookings/${bookingId}/cancel`,
      {}
    );
  }

  rescheduleBooking(
    bookingId: number,
    slotId: number
  ): Observable<InterviewBooking> {
    return this.http.post<InterviewBooking>(
      `${this.apiUrl}/bookings/${bookingId}/reschedule`,
      { slotId }
    );
  }

  // Admin slot-management APIs.
  getAdminSlots(date: string): Observable<InterviewSlot[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<InterviewSlot[]>(`${this.apiUrl}/admin/slots`, { params });
  }

  createAdminSlot(payload: {
    interviewerId?: number | null;
    interviewerName: string;
    interviewerEmail?: string;
    interviewType?: string;
    company?: string;
    startTime: string;
    endTime: string;
    status?: string;
  }): Observable<InterviewSlot> {
    return this.http.post<InterviewSlot>(`${this.apiUrl}/admin/slots`, payload);
  }

  updateAdminSlot(id: number, payload: any): Observable<InterviewSlot> {
    return this.http.put<InterviewSlot>(`${this.apiUrl}/admin/slots/${id}`, payload);
  }

  cancelAdminSlot(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/slots/${id}/cancel`, {});
  }

  updateAdminSlotStatus(id: number, status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'): Observable<InterviewSlot> {
    return this.http.patch<InterviewSlot>(`${this.apiUrl}/admin/slots/${id}/status`, { status });
  }

}

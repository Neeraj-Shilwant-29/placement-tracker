import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MockInterviewService {
  private apiUrl = `${environment.apiBaseUrl}/mock-interviews`;

  constructor(private http: HttpClient) {}

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
}

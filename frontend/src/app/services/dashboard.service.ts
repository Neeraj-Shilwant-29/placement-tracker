import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStudentDashboard(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}`);
  }

  getStudentProfile(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}/profile`);
  }

  updateStudentProfile(studentId: number, student: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/student/${studentId}/profile`, student);
  }

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }
}

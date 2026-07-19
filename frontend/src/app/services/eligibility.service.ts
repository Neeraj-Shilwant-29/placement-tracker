import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EligibilityService {
  private apiUrl = `${environment.apiBaseUrl}/eligibility`;

  constructor(private http: HttpClient) {}

  checkEligibility(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/check/${studentId}`);
  }

  checkCompanyEligibility(studentId: number, companyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check/${studentId}/company/${companyId}`);
  }
}

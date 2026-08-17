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

  applyByCompanyId(companyId: number,studentId:number): Observable<any>{
  return this.http.post<any>(
      `${environment?.apiBaseUrl}/applications/company/${companyId}`,
      {
        studentId: studentId
      }
    ); 
  }

  getAppliedJobsData(studentId:number){
    return this.http.get<any>(`${environment?.apiBaseUrl}/applications/applied-jobs/${studentId}`);

  }
}

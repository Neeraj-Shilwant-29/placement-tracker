import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private apiUrl = `${environment.apiBaseUrl}/companies`;

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCompanyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  searchCompanies(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?name=${name}`);
  }

  getCompaniesByIndustry(industry: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/industry/${industry}`);
  }

  createCompany(company: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin`, company);
  }

  updateCompany(id: number, company: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}`, company);
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`);
  }
}

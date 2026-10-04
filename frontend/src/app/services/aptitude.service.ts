import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AptitudeService {
  private apiUrl = `${environment.apiBaseUrl}/aptitude`;

  constructor(private http: HttpClient) {}

  getQuestions(category: string, difficulty: string, count: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/questions?category=${category}&difficulty=${difficulty}&count=${count}`);
  }

  submitTest(submission: any, studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit?studentId=${studentId}`, submission);
  }

  getResults(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/results/${studentId}`);
  }

  addQuestion(question: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/questions`, question);
  }

  updateQuestion(id: number, question: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/questions/${id}`, question);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/questions/${id}`);
  }

  getAllQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/questions`);
  }
}

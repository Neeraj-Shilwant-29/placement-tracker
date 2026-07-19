import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CodingService {
  private apiUrl = `${environment.apiBaseUrl}/coding`;

  constructor(private http: HttpClient) {}

  getAllQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/questions`);
  }

  getQuestionsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/questions/category/${category}`);
  }

  getQuestionsByDifficulty(difficulty: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/questions/difficulty/${difficulty}`);
  }

  getQuestionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/questions/${id}`);
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
}

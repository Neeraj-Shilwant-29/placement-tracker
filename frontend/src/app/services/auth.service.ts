import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiBaseUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {

    const user = sessionStorage.getItem('currentUser');

    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }

  }

  login(email: string, password: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(

      tap((response: any) => {

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('currentUser', JSON.stringify(response));

        this.currentUserSubject.next(response);

      })

    );

  }

  register(data: any): Observable<any> {

    return this.http.post(`${this.apiUrl}/register`, data).pipe(

      tap((response: any) => {

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('currentUser', JSON.stringify(response));

        this.currentUserSubject.next(response);

      })

    );

  }

  adminLogin(email: string, password: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/admin/login`, { email, password }).pipe(

      tap((response: any) => {

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('currentUser', JSON.stringify(response));

        this.currentUserSubject.next(response);

      })

    );

  }

  logout(): void {

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');

    this.currentUserSubject.next(null);

  }

  getToken(): string | null {

    return sessionStorage.getItem('token');

  }

  isLoggedIn(): boolean {

    return !!this.getToken();

  }

  isAdmin(): boolean {

    const user = this.currentUserSubject.value;

    return user && user.role === 'ADMIN';

  }

  isStudent(): boolean {

    const user = this.currentUserSubject.value;

    return user && user.role === 'STUDENT';

  }

  getCurrentUser(): any {

    return this.currentUserSubject.value;

  }

}
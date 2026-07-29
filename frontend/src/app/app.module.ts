 import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { CompanyDatabaseComponent } from './components/company-database/company-database.component';
import { AptitudeTestComponent } from './components/aptitude-test/aptitude-test.component';
import { CodingPracticeComponent } from './components/coding-practice/coding-practice.component';
import { MockInterviewComponent } from './components/mock-interview/mock-interview.component';
import { EligibilityCheckerComponent } from './components/eligibility-checker/eligibility-checker.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'student/dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'student/companies', component: CompanyDatabaseComponent, canActivate: [AuthGuard] },
  { path: 'student/aptitude', component: AptitudeTestComponent, canActivate: [AuthGuard] },
  { path: 'student/coding', component: CodingPracticeComponent, canActivate: [AuthGuard] },
  { path: 'student/mock-interview', component: MockInterviewComponent, canActivate: [AuthGuard] },
  { path: 'student/eligibility', component: EligibilityCheckerComponent, canActivate: [AuthGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    StudentDashboardComponent,
    CompanyDatabaseComponent,
    AptitudeTestComponent,
    CodingPracticeComponent,
    MockInterviewComponent,
    EligibilityCheckerComponent,
    AdminLoginComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

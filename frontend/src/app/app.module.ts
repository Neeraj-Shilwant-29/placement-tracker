import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { StudentLayoutComponent } from './components/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { CompanyDatabaseComponent } from './components/company-database/company-database.component';
import { AptitudeTestComponent } from './components/aptitude-test/aptitude-test.component';
import { CodingPracticeComponent } from './components/coding-practice/coding-practice.component';
import { MockInterviewComponent } from './components/mock-interview/mock-interview.component';
import { EligibilityCheckerComponent } from './components/eligibility-checker/eligibility-checker.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminOverviewComponent } from './components/admin-overview/admin-overview.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminAptitudeComponent } from './components/admin-aptitude/admin-aptitude.component';
import { AdminCodingComponent } from './components/admin-coding/admin-coding.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'companies', component: CompanyDatabaseComponent },
      { path: 'aptitude', component: AptitudeTestComponent },
      { path: 'coding', component: CodingPracticeComponent },
      { path: 'mock-interview', component: MockInterviewComponent },
      { path: 'eligibility', component: EligibilityCheckerComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: AdminOverviewComponent },
      { path: 'companies', component: AdminCompaniesComponent },
      { path: 'aptitude', component: AdminAptitudeComponent },
      { path: 'coding', component: AdminCodingComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    StudentLayoutComponent,
    StudentDashboardComponent,
    CompanyDatabaseComponent,
    AptitudeTestComponent,
    CodingPracticeComponent,
    MockInterviewComponent,
    EligibilityCheckerComponent,
    ProfileComponent,
    AdminLoginComponent,
    AdminLayoutComponent,
    AdminOverviewComponent,
    AdminCompaniesComponent,
    AdminAptitudeComponent,
    AdminCodingComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AgGridModule
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

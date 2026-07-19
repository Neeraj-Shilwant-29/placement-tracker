import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MockInterviewService } from '../../services/mock-interview.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mock-interview',
  templateUrl: './mock-interview.component.html',
  styleUrls: ['./mock-interview.component.scss']
})
export class MockInterviewComponent implements OnInit {
  interviews: any[] = [];
  showForm = false;
  newInterview: any = {
    interviewType: 'Technical',
    technicalScore: 0,
    aptitudeScore: 0,
    communicationScore: 0,
    status: 'Completed',
    feedback: '',
    interviewerName: '',
    company: ''
  };
  user: any;

  constructor(
    private interviewService: MockInterviewService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    if (this.user?.id) {
      this.interviewService.getStudentInterviews(this.user.id).subscribe({
        next: (data) => this.interviews = data,
        error: (err) => console.error(err)
      });
    }
  }

  saveInterview(): void {
    this.interviewService.addInterview(this.newInterview, this.user.id).subscribe({
      next: () => {
        this.loadInterviews();
        this.showForm = false;
        this.resetForm();
      },
      error: (err) => console.error(err)
    });
  }

  deleteInterview(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.interviewService.deleteInterview(id).subscribe({
        next: () => this.loadInterviews(),
        error: (err) => console.error(err)
      });
    }
  }

  resetForm(): void {
    this.newInterview = {
      interviewType: 'Technical',
      technicalScore: 0,
      aptitudeScore: 0,
      communicationScore: 0,
      status: 'Completed',
      feedback: '',
      interviewerName: '',
      company: ''
    };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'linear-gradient(135deg, #10B981, #059669)';
    if (score >= 60) return 'linear-gradient(135deg, #3B82F6, #2563EB)';
    if (score >= 40) return 'linear-gradient(135deg, #F59E0B, #D97706)';
    return 'linear-gradient(135deg, #EF4444, #DC2626)';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

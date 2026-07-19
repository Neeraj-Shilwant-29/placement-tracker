import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EligibilityService } from '../../services/eligibility.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-eligibility-checker',
  templateUrl: './eligibility-checker.component.html',
  styleUrls: ['./eligibility-checker.component.scss']
})
export class EligibilityCheckerComponent implements OnInit {
  results: any[] = [];
  loading = false;
  user: any;

  constructor(
    private eligibilityService: EligibilityService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.checkEligibility();
  }

  checkEligibility(): void {
    this.loading = true;
    this.eligibilityService.checkEligibility(this.user.id).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

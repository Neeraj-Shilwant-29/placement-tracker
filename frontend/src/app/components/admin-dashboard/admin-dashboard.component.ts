import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { CompanyService } from '../../services/company.service';
import { AptitudeService } from '../../services/aptitude.service';
import { CodingService } from '../../services/coding.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'dashboard';
  stats: any;
  companies: any[] = [];
  aptitudeQuestions: any[] = [];
  codingQuestions: any[] = [];

  showCompanyForm = false;
  showAptitudeForm = false;
  showCodingForm = false;

  editingCompany: any = null;
  eligibleBranchesInput = '';

  companyForm: any = { name: '', industry: '', location: '', minCgpa: 0, website: '', description: '', eligibleBranches: [] };
  aptitudeForm: any = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', category: 'Quantitative', difficulty: 'Easy', explanation: '' };
  codingForm: any = { title: '', description: '', category: '', difficulty: 'Easy', sampleInput: '', sampleOutput: '', constraints: '' };

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private companyService: CompanyService,
    private aptitudeService: AptitudeService,
    private codingService: CodingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadCompanies();
    this.loadAptitudeQuestions();
    this.loadCodingQuestions();
  }

  loadStats(): void {
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error(err)
    });
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => this.companies = data,
      error: (err) => console.error(err)
    });
  }

  loadAptitudeQuestions(): void {
    this.aptitudeService.getAllQuestions().subscribe({
      next: (data) => this.aptitudeQuestions = data,
      error: (err) => console.error(err)
    });
  }

  loadCodingQuestions(): void {
    this.codingService.getAllQuestions().subscribe({
      next: (data) => this.codingQuestions = data,
      error: (err) => console.error(err)
    });
  }

  saveCompany(): void {
    this.companyForm.eligibleBranches = this.eligibleBranchesInput.split(',').map((s: string) => s.trim());
    if (this.editingCompany) {
      this.companyService.updateCompany(this.editingCompany.id, this.companyForm).subscribe({
        next: () => { this.loadCompanies(); this.resetCompanyForm(); },
        error: (err) => console.error(err)
      });
    } else {
      this.companyService.createCompany(this.companyForm).subscribe({
        next: () => { this.loadCompanies(); this.resetCompanyForm(); },
        error: (err) => console.error(err)
      });
    }
  }

  editCompany(company: any): void {
    this.editingCompany = company;
    this.companyForm = { ...company };
    this.eligibleBranchesInput = company.eligibleBranches?.join(', ') || '';
    this.showCompanyForm = true;
  }

  deleteCompany(id: number): void {
    if (confirm('Delete this company?')) {
      this.companyService.deleteCompany(id).subscribe({
        next: () => this.loadCompanies(),
        error: (err) => console.error(err)
      });
    }
  }

  resetCompanyForm(): void {
    this.showCompanyForm = false;
    this.editingCompany = null;
    this.companyForm = { name: '', industry: '', location: '', minCgpa: 0, website: '', description: '', eligibleBranches: [] };
    this.eligibleBranchesInput = '';
  }

  saveAptitudeQuestion(): void {
    this.aptitudeService.addQuestion(this.aptitudeForm).subscribe({
      next: () => { this.loadAptitudeQuestions(); this.showAptitudeForm = false; this.aptitudeForm = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', category: 'Quantitative', difficulty: 'Easy', explanation: '' }; },
      error: (err) => console.error(err)
    });
  }

  deleteAptitudeQuestion(id: number): void {
    if (confirm('Delete this question?')) {
      this.aptitudeService.deleteQuestion(id).subscribe({
        next: () => this.loadAptitudeQuestions(),
        error: (err) => console.error(err)
      });
    }
  }

  saveCodingQuestion(): void {
    this.codingService.addQuestion(this.codingForm).subscribe({
      next: () => { this.loadCodingQuestions(); this.showCodingForm = false; this.codingForm = { title: '', description: '', category: '', difficulty: 'Easy', sampleInput: '', sampleOutput: '', constraints: '' }; },
      error: (err) => console.error(err)
    });
  }

  deleteCodingQuestion(id: number): void {
    if (confirm('Delete this question?')) {
      this.codingService.deleteQuestion(id).subscribe({
        next: () => this.loadCodingQuestions(),
        error: (err) => console.error(err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

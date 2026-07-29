import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-database',
  templateUrl: './company-database.component.html',
  styleUrls: ['./company-database.component.scss']
})
export class CompanyDatabaseComponent implements OnInit {

  companies: any[] = [];
  allCompanies: any[] = [];
  searchTerm = '';
  filterIndustry = '';

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data: any[]) => {
        this.companies = data;
        this.allCompanies = data;
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  search(): void {
    if (this.searchTerm) {
      this.companies = this.allCompanies.filter(company =>
        company.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.companies = [...this.allCompanies];
    }

    this.filterByIndustry();
  }

  filterByIndustry(): void {
    let filtered = this.searchTerm
      ? this.allCompanies.filter(company =>
          company.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : [...this.allCompanies];

    if (this.filterIndustry) {
      filtered = filtered.filter(
        company => company.industry === this.filterIndustry
      );
    }

    this.companies = filtered;
  }

  // Navigate to Company Details Page
  viewDetails(id: number): void {
    this.router.navigate(['/company', id]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
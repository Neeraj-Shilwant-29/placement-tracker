import { Component, OnInit } from '@angular/core';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit {
  companies: any[] = [];
  showForm = false;
  editingCompany: any = null;
  eligibleBranchesInput = '';

  // Success message
  successMessage = '';

  companyForm: any = {
    name: '',
    industry: '',
    location: '',
    packageOffered: '',
    minCgpa: 0,
    website: '',
    description: '',
    eligibleBranches: []
  };

  gridApi!: GridApi;

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      flex: 2,
      cellStyle: { fontWeight: '600' }
    },
    {
      headerName: 'Industry',
      field: 'industry',
      flex: 1
    },
    {
      headerName: 'Location',
      field: 'location',
      flex: 1
    },
    {
      headerName: 'Package',
      field: 'packageOffered',
      flex: 1,
      cellRenderer: (params: any) =>
        params.value
          ? `<span class="badge bg-success">${params.value}</span>`
          : ''
    },
    {
      headerName: 'Min CGPA',
      field: 'minCgpa',
      flex: 1
    },
    {
      headerName: 'Actions',
      field: 'id',
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: () => `
        <div class="action-btns">
          <button class="btn btn-sm btn-outline-primary ag-action-btn" data-action="edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger ag-action-btn" data-action="delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>`
    }
  ];

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(event: any): void {
    const target = event.event?.target as HTMLElement;
    const actionBtn = target.closest('[data-action]') as HTMLElement;

    if (!actionBtn) return;

    const action = actionBtn.dataset['action'];

    if (action === 'edit') {
      this.editCompany(event.data);
    }

    if (action === 'delete') {
      this.deleteCompany(event.data.id);
    }
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (data) => (this.companies = data),
      error: (err) => console.error(err)
    });
  }

  saveCompany(): void {
    this.companyForm.eligibleBranches = this.eligibleBranchesInput
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s);

    if (this.editingCompany) {
      this.companyService
        .updateCompany(this.editingCompany.id, this.companyForm)
        .subscribe({
          next: () => {
            this.loadCompanies();
            this.resetForm();

            this.successMessage = 'Company updated successfully!';

            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (err) => {
            console.error(err);
            alert('Failed to update company.');
          }
        });
    } else {
      this.companyService.createCompany(this.companyForm).subscribe({
        next: () => {
          this.loadCompanies();
          this.resetForm();

          this.successMessage = 'Company added successfully!';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to add company.');
        }
      });
    }
  }

  editCompany(company: any): void {
    this.editingCompany = company;
    this.companyForm = { ...company };
    this.eligibleBranchesInput =
      company.eligibleBranches?.join(', ') || '';
    this.showForm = true;
  }

  deleteCompany(id: number): void {
    if (confirm('Delete this company?')) {
      this.companyService.deleteCompany(id).subscribe({
        next: () => {
          this.loadCompanies();

          this.successMessage = 'Company deleted successfully!';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => console.error(err)
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.editingCompany = null;

    this.companyForm = {
      name: '',
      industry: '',
      location: '',
      packageOffered: '',
      minCgpa: 0,
      website: '',
      description: '',
      eligibleBranches: []
    };

    this.eligibleBranchesInput = '';
  }
}
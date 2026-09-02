import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EligibilityService } from '../../services/eligibility.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-eligibility-checker',
  templateUrl: './eligibility-checker.component.html',
  styleUrls: ['./eligibility-checker.component.scss']
})
export class EligibilityCheckerComponent implements OnInit {
  openingRolesList: any[] = [];
  appliedJobs: any[] = [];
  loading = false;
  activeTab: 'jobs' | 'applied' = 'jobs';
  user: any;

  constructor(
    private eligibilityService: EligibilityService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.appliedJobsFN();
  }

  private checkEligibility(): void {
    this.loading = true;
    const appliedRolesIds = this.appliedJobs?.map(job=>job.companyId);
    this.eligibilityService.checkEligibility(this.user?.id).subscribe({
      next: (data) => {
        this.openingRolesList = data.filter(res=> !appliedRolesIds.includes(res?.companyId
        ?.id));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  public applyByCompanyId(companyId: any, openingRoleId: any) {
     this.eligibilityService.applyByCompanyId(companyId, openingRoleId, this.user?.id).subscribe({
      next: (response) => {
        if(response?.success){
            for(const cmp of this.openingRolesList){
              if(response?.companyId === cmp?.company?.id){
                cmp.status = "APPLIED";
                break;
              }
            }
          }
        this.cd.markForCheck();

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  public appliedJobsFN(){
    this.eligibilityService.getAppliedJobsData(this.user?.id).subscribe({
      next: (data) => {
        this.appliedJobs = data;
        this.checkEligibility();
        this.loading = false;
      },
      error: (err) => {
        this.checkEligibility();
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

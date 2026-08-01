import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  profile: any;
  profileForm!: FormGroup;
  loading = true;
  saving = false;
  editMode = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private fb: FormBuilder
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      college: [''],
      branch: [''],
      cgpa: [0, [Validators.min(0), Validators.max(10)]]
    });
  }

  loadProfile(): void {
    if (this.user?.id) {
      this.dashboardService.getStudentProfile(this.user.id).subscribe({
        next: (data) => {
          this.profile = data;
          this.profileForm.patchValue({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            college: data.college,
            branch: data.branch,
            cgpa: data.cgpa
          });
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Failed to load profile';
          this.loading = false;
        }
      });
    }
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.successMsg = '';
    this.errorMsg = '';
    if (!this.editMode) {
      this.profileForm.patchValue({
        fullName: this.profile.fullName,
        phone: this.profile.phone,
        college: this.profile.college,
        branch: this.profile.branch,
        cgpa: this.profile.cgpa
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const formData = this.profileForm.getRawValue();
    this.dashboardService.updateStudentProfile(this.user.id, formData).subscribe({
      next: (data) => {
        this.profile = data;
        this.editMode = false;
        this.saving = false;
        this.successMsg = 'Profile updated successfully!';
        const currentUser = this.authService.getCurrentUser();
        currentUser.fullName = data.fullName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      },
      error: () => {
        this.errorMsg = 'Failed to update profile. Please try again.';
        this.saving = false;
      }
    });
  }

  getInitial(): string {
    return (this.profile?.fullName || 'S').charAt(0).toUpperCase();
  }
}

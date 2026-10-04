import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      college: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/)]],
      branch: ['',Validators.required],
      cgpa: ['', [Validators.required, Validators.pattern(/^(?:\d+)(?:\.\d+)?$/), Validators.min(0), Validators.max(10)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/student/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
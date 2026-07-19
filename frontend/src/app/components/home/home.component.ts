import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isStudent()) {
      this.router.navigate(['/student/dashboard']);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}

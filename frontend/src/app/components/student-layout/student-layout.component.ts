import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss']
})
export class StudentLayoutComponent {
  user: any;
  sidebarCollapsed = false;
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFirstName(): string {
    return (this.user?.fullName || 'Student').split(' ')[0];
  }

  getInitial(): string {
    return this.getFirstName().charAt(0).toUpperCase();
  }
}

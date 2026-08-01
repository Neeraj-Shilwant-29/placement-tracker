import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
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
    this.router.navigate(['/admin/login']);
  }

  getFirstName(): string {
    return (this.user?.fullName || 'Admin').split(' ')[0];
  }

  getInitial(): string {
    return this.getFirstName().charAt(0).toUpperCase();
  }
}

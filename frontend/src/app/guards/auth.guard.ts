import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const url = route.url[0]?.path || '';

    if (url === 'admin' && !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (url === 'student' && !this.authService.isStudent()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

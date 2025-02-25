import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isCollapsed = false

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout(); // Elimina el token
    this.router.navigate(['/login']); // Redirige al login
  }
}

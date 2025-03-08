import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isCollapsed = false;
  isMenuOpen = false;
  currentYear: number = new Date().getFullYear();
  selectedMenu: String | null = null;
  docenteId: number = 1

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMenuOp(menu: string, isOpen: boolean): void {
    this.selectedMenu = isOpen ? menu : null;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-button') && !target.closest('.menu-dropdown')) {
      this.isMenuOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

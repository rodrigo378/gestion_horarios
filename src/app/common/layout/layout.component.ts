import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;
  isMenuOpen = false;
  currentYear: number = new Date().getFullYear();
  selectedMenu: String | null = null;
  docenteId: number = 1;
  permisosMap: { [codigo: string]: boolean } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getPermisos();
  
    const storedMenu = localStorage.getItem('selectedMenu');
    if (storedMenu) {
      this.selectedMenu = storedMenu;
    }
  }
  

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMenuOp(menu: string, isOpen: boolean): void {
    this.selectedMenu = isOpen ? menu : null;
  
    // Guardar el último menú seleccionado en localStorage
    if (isOpen) {
      localStorage.setItem('selectedMenu', menu);
    } else {
      localStorage.removeItem('selectedMenu');
    }
  }  

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('#user-menu-button') &&
      !target.closest('.menu-dropdown')
    ) {
      this.isMenuOpen = false;
    }
  }

  getPermisos() {
    this.userService.getPermisoMe().subscribe((data) => {
      console.log('Permisos desde backend:', data);

      this.permisosMap = {}; // Limpia antes de cargar

      data.forEach((permiso: any) => {
        const codigo = permiso.item?.codigo;
        if (codigo) {
          this.permisosMap[codigo] = true;
        }
      });

      console.log('Permisos cargados en permisosMap:', this.permisosMap);
    });
  }

  hasPermiso(codigo: string): boolean {
    return !!this.permisosMap[codigo];
  }

  logout() {
    localStorage.removeItem('selectedMenu'); // ✅ limpiar menú activo
    this.authService.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: err => {
        console.error('Error al cerrar sesión', err);
        window.location.href = '/login';
      }
    });
  }  
  
}

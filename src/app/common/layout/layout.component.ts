import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { filter, Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';

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
  docenteId: number = 1;
  permisosMap: { [codigo: string]: boolean } = {};

  private routerSubscription!: Subscription;
  selectedMenu: String | null = null;
  item: String | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    public alertService: AlertService
  ) {}

  ngOnInit(): void {
    console.log('v2');

    this.getPermisos();
    this.seleccionItem();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.seleccionItem();
      });
  }

  seleccionItem() {
    const partes = this.router.url.split('?')[0].split('/').slice(1);
    this.selectedMenu = partes[0];

    const aliasItemMap: { [key: string]: string } = {
      asignarhorario: 'turno',
      calendario_docente: 'docente',
      calendario_aula: 'aula',
      calender_turno: 'turno',
    };

    const rawItem = partes[1];
    this.item = aliasItemMap[rawItem] ?? rawItem;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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
      this.permisosMap = {};

      data.forEach((permiso: any) => {
        const codigo = permiso.item?.codigo;
        if (codigo) {
          this.permisosMap[codigo] = true;
        }
      });
    });
  }

  hasPermiso(codigo: string): boolean {
    return !!this.permisosMap[codigo];
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res: any) => {
        window.location.href = '/login';
      },
      error: (err) => {
        console.error('Error al cerrar sesión', err);
        window.location.href = '/login';
      },
    });
  }
}

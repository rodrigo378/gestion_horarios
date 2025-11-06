// src/app/layout/layout.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AlertService } from '../../services_2/alert.service';
import { IamMenuModule, IamMenuService } from '../../services/iam_menu.service';

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

  /** control dinámico */
  selectedMenu: string | null = null; // primer segmento: 'coa' | 'admin' | ...
  item: string | null = null; // segundo segmento (con alias)

  modules: IamMenuModule[] = [];
  loadingMenu = false;

  private routerSubscription!: Subscription;

  constructor(
    private router: Router,
    private iamMenu: IamMenuService,
    public alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadMenu();
    this.seleccionItem();
    this.routerSubscription = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.seleccionItem());
  }

  private loadMenu() {
    this.loadingMenu = true;
    this.iamMenu.getFullMenu().subscribe({
      next: (mods) => {
        // ordena módulos por "order" y los deja listos para pintar
        this.modules = [...mods].sort(
          (a, b) => (a.order ?? 99999) - (b.order ?? 99999)
        );
      },
      error: (err) => {
        console.error('Error menú:', err);
        this.alertService.error('No se pudo cargar el menú');
      },
      complete: () => (this.loadingMenu = false),
    });
  }

  /** Normaliza ruta a segmentos */
  private parseUrl(url: string) {
    const parts = url.split('?')[0].split('/').slice(1); // sin "/"
    return {
      seg1: parts[0] ?? null,
      seg2: parts[1] ?? '',
      full: `/${parts.join('/')}`,
    };
  }

  /** Alias de tus rutas viejas → nuevas claves de item */
  private readonly aliasItemMap: Record<string, string> = {
    asignarhorario: 'turno',
    calendario_docente: 'docente',
    calendario_aula: 'aula',
    calender_turno: 'turno',
  };

  /** Selecciona menú e item activos según URL */
  seleccionItem() {
    const { seg1, seg2, full } = this.parseUrl(this.router.url);
    this.selectedMenu = seg1;

    const rawItem = seg2 || '';
    this.item = this.aliasItemMap[rawItem] ?? rawItem;

    // Si el primer segmento es nulo (ej. /welcome), intenta deducir módulo por path completo
    if (!this.selectedMenu) {
      const found = this.findModuleByPath(full);
      if (found) this.selectedMenu = found;
    }
  }

  /** Encuentra el módulo (key) que contiene el path actual (util para /welcome, etc.) */
  private findModuleByPath(path: string): string | null {
    for (const mod of this.modules) {
      for (const g of mod.groups || []) {
        for (const it of g.children || []) {
          const p = (it.path || it.key || '').toString();
          if (p && path.startsWith(p))
            return (p.split('/')[1] || null) as string | null;
        }
      }
    }
    return null;
  }

  /** Abre el grupo si alguno de sus hijos coincide con la URL actual */
  // isGroupOpen(g: any): boolean {
  //   const current = this.router.url.split('?')[0];
  //   return (g?.children || []).some((it: any) => {
  //     const p = (it.path || it.key || '').toString();
  //     return p && current.startsWith(p);
  //   });
  // }
  /** Abre solo el grupo del módulo actual (sin activar otros como TI) */
  isGroupOpen(g: any): boolean {
    const current = this.router.url.split('?')[0];
    const [, seg1, seg2, seg3] = current.split('/');

    return (g?.children || []).some((it: any) => {
      const p = (it.path || it.key || '').toString();
      if (!p) return false;

      const itemSegs = p.split('/').slice(1);
      if (itemSegs.length < 2) return false;

      const itemSeg1 = itemSegs[0];
      const itemSeg2 = itemSegs[1];
      const alias = this.aliasItemMap[seg2 || ''];

      // ✅ Coincide solo si el grupo pertenece al mismo módulo (ej. 'coa')
      if (seg1 !== itemSeg1) return false;

      // ✅ Caso especial: /coa/asignar/:id abre el grupo que contiene /coa/asignarhorario
      const esRutaAsignarConId =
        seg1 === 'coa' &&
        seg2 === 'asignar' &&
        !!seg3 &&
        (itemSeg2 === 'asignarhorario' || itemSeg2 === 'turno');

      const coincideNormal =
        current.startsWith(p) || seg2 === itemSeg2 || alias === itemSeg2;

      return coincideNormal || esRutaAsignarConId;
    });
  }

  /** Marca el item activo (usa path completo, y alias para compatibilidad) */
  // isItemActive(it: any): boolean {
  //   const current = this.router.url.split('?')[0];
  //   const p = (it.path || it.key || '').toString();
  //   if (!p) return false;
  //   // activo si match exacto o si coincide segmento 2 via alias
  //   if (current === p) return true;

  //   // /coa/turno vs /coa/asignarhorario (alias 'turno')
  //   const [, seg1, seg2] = current.split('/');
  //   const itemSegs = p.split('/').slice(1);
  //   if (itemSegs.length >= 2) {
  //     const itemSeg2 = itemSegs[1];
  //     const alias = this.aliasItemMap[seg2 || ''];
  //     return seg1 === itemSegs[0] && (seg2 === itemSeg2 || alias === itemSeg2);
  //   }
  //   return false;
  // }
  /** Marca el item activo (usa path completo, alias y rutas con ID) */
  /** Marca el ítem activo solo si pertenece al grupo actualmente abierto */
  isItemActive(it: any): boolean {
    const current = this.router.url.split('?')[0];
    const p = (it.path || it.key || '').toString();
    if (!p) return false;

    const [, seg1, seg2, seg3] = current.split('/');
    const itemSegs = p.split('/').slice(1);
    if (itemSegs.length < 2) return false;

    const itemSeg1 = itemSegs[0];
    const itemSeg2 = itemSegs[1];
    const alias = this.aliasItemMap[seg2 || ''];

    // ✅ Coincide solo si pertenece al mismo módulo (por ejemplo 'coa')
    if (seg1 !== itemSeg1) return false;

    // ✅ Detecta alias o rutas con parámetros dinámicos (como /coa/asignar/2341)
    const esRutaAsignarConId =
      seg1 === 'coa' &&
      seg2 === 'asignar' &&
      !!seg3 &&
      (itemSeg2 === 'asignarhorario' || itemSeg2 === 'turno');

    // Coincidencia normal o por alias
    const coincideNormal = seg2 === itemSeg2 || alias === itemSeg2;

    // Solo es activo si coincide y el grupo del módulo está abierto
    return coincideNormal || esRutaAsignarConId;
  }

  /** Mapear 'IdcardOutlined' → 'idcard' (ng-zorro) */
  getNzIconType(icon?: string): string {
    if (!icon) return 'appstore';
    // Quita sufijo 'Outlined', 'Filled', 'TwoTone' y pasa a kebab/camel simple en minúsculas
    const cleaned = icon.replace(/(Outlined|Filled|TwoTone)$/i, '');
    return cleaned.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); // Idcard -> idcard
  }

  /** Dropdown usuario */
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

  logout() {
    fetch(`localhost/core/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => (window.location.href = '/login'));
  }

  /** trackBy performance */
  trackByKey(_: number, obj: any) {
    return obj?.key || obj?.path || obj?.label || _;
  }
}

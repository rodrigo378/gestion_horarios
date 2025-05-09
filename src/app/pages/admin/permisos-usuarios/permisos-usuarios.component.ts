import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Modulo } from '../../../interfaces/Modulo';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-permisos-usuarios',
  standalone: false,
  templateUrl: './permisos-usuarios.component.html',
  styleUrl: './permisos-usuarios.component.css',
})
export class PermisosUsuariosComponent implements OnInit {
  modulos: Modulo[] = [];
  email: string = '';
  userPermisos: any[] = [];
  boolPermisos: boolean = false;
  user!: any;

  constructor(
    private userService: UserService,
    public alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.getModulos();
  }

  getModulos() {
    this.userService.getModulos().subscribe((data) => {
      this.modulos = data;
    });
  }

  buscarPermisos() {
    this.alertService.iniciarSolicitud();

    this.userService.getPermisosTo(this.email).subscribe({
      next: (res: any) => {
        this.userPermisos = res.permisos;
        this.user = res.user;
        this.boolPermisos = true;
        this.alertService.finalizarSolicitud();
      },
      error: (err: HttpErrorResponse) => {
        console.log('err => ', err);
        this.boolPermisos = false;
        this.alertService.finalizarSolicitud();
        this.alertService.error('Este Email no existe');
      },
    });
  }

  isChecked(itemId: number): boolean {
    const permiso = this.userPermisos.find((p) => p.itemId === itemId);
    return permiso?.estado === 'A';
  }

  togglePermiso(itemId: number, checked: boolean) {
    const index = this.userPermisos.findIndex((p) => p.itemId === itemId);

    if (index !== -1) {
      this.userPermisos[index].estado = checked ? 'A' : 'I';
    } else {
      this.userPermisos.push({ itemId, estado: checked ? 'A' : 'I' });
    }
  }

  guardarPermisos() {
    if (!this.email.trim()) {
      this.alertService.error('Por favor ingrese un correo válido.');
      return;
    }

    const permisosSeleccionados = this.userPermisos.filter(
      (p) => p.estado === 'A'
    );

    const itemsId = permisosSeleccionados.map((pe) => pe.itemId); // 🔧 corrección

    this.userService.actualizarPermisos(this.user.id, itemsId).subscribe({
      next: (res: any) => {
        this.alertService.success('Permisos actualizados correctamente');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar permisos =>', err);
        this.alertService.error('Error al actualizar los permisos');
      },
    });
  }
}

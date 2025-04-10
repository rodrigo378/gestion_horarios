import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User, Usernew } from '../../../interfaces/User';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-listar-usuarios',
  standalone: false,
  templateUrl: './listar-usuarios.component.html',
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent  implements OnInit {
  itemsPorPagina = 5;
  paginaActual = 1;
  modalAbierto = false;
  loading = true;
  error: string | null = null;

  // Reemplazamos el array estático por uno que se llenará desde el servicio
  usuarios: Usernew[] = [];
  usuariosFiltrados: Usernew[] = [];
  filtroBusqueda = '';

  usuario = {
    nombre: '',
    apellidos: '',
    email: '',
    grado: '',
    estado: 'A', // 'A' para activo, que es el valor del JSON original
    contrasena: ''
  };

  constructor(
    private location: Location,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getUserInfo().subscribe({
      next: (data: Usernew[]) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la lista de usuarios';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Métodos de paginación
  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }
  
  get usuariosPaginados(): Usernew[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  // Métodos del modal
  abrirModal(): void {
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardarUsuario(): void {
    console.log('Usuario guardado: ', this.usuario);
    this.cerrarModal();
    // Aquí podrías agregar la llamada al servicio para guardar el usuario
  }

  cancel(): void {
    this.location.back();
  }

  // Método de filtrado
  filtrarUsuarios(): void {
    if (!this.filtroBusqueda) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    const busqueda = this.filtroBusqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      return (
        (usuario.nombre?.toLowerCase().includes(busqueda) ||
        (usuario.apellido?.toLowerCase().includes(busqueda)) ||
        (usuario.email.toLowerCase().includes(busqueda)) ||
        (usuario.grado?.toLowerCase().includes(busqueda)) ||
        (usuario.estado.toLowerCase().includes(busqueda))
      ));
    });
    this.paginaActual = 1; // Resetear a la primera página al filtrar
  }

  // Método para mostrar el estado de forma legible
  mostrarEstado(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }
}

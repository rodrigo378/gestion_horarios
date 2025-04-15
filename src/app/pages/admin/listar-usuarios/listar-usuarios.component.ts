import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Usernew } from '../../../interfaces/User';
import { UserService } from '../../../services/user.service';
import { AlertService } from '../../../services/alert.service';

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

  usuario: any = {
    id: null,
    nombre: '',
    apellidos: '',
    genero: 'M',
    email: '',
    grado: '',
    estado: 'A',
    password: ''
  };
  
  constructor(
    private location: Location,
    private userService: UserService,
    private alerService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.obtenerUsuarioPorId(0)
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

  editarUsuario(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.usuario = {
          id: data.id,
          nombre: data.nombre,
          apellidos: data.apellido,
          email: data.email,
          genero: data.genero,
          grado: data.grado,
          estado: data.estado,
          password: ''
        };
        this.abrirModal();
      },
      error: (err) => {
        console.error('❌ Error al obtener usuario:', err);
      }
    });
  }
  
  obtenerUsuarioPorId(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (usuario) => {
        console.log('Usuario obtenido:', usuario);
      },
      error: (err) => {
        console.error('Error al obtener usuario por ID:', err);
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

  abrirModal(): void {
    if (!this.usuario.id) {
      this.usuario = {
        id: null,
        nombre: '',
        apellidos: '',
        genero: 'M',
        email: '',
        grado: '',
        estado: 'A',
        password: ''
      };
    }
    this.modalAbierto = true;
  }
    

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardarUsuario(): void {
    const usuarioData = {
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellidos,
      genero: this.usuario.genero,
      grado: this.usuario.grado,
      email: this.usuario.email,
      estado: this.usuario.estado,
      password: this.usuario.password
    };
  
    if (this.usuario.id) {
      // EDITAR
      this.userService.updateUser({ ...usuarioData, id: this.usuario.id }).subscribe({
        next: () => {
          this.alerService.success('✅ Usuario actualizado correctamente');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('❌ Error al actualizar:', err);
          this.alerService.error(err);
        }
      });
    } else {
      // CREAR
      this.userService.createUser(usuarioData).subscribe({
        next: () => {
          this.alerService.success('✅ Usuario creado correctamente');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('❌ Error al crear usuario:', err);
          this.alerService.error(err);
        }
      });
    }
  }
  

  traducirMensaje(msg: string): string {
    if (msg.includes('should not be empty')) {
      const campo = msg.split(' ')[0];
      return `El campo ${campo} es obligatorio.`;
    }
  
    if (msg.toLowerCase().includes('correo')) {
      return msg.replace('correo', 'El correo');
    }
  
    // Otros ejemplos específicos
    if (msg.includes('La contraseña debe tener')) return msg;
    if (msg.includes('El correo no es válido')) return msg;
  
    return msg; // Si no se reconoce, se muestra tal cual
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

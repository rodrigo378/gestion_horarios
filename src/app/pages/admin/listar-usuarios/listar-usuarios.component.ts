import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-listar-usuarios',
  standalone: false,
  templateUrl: './listar-usuarios.component.html',
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent {

  itemsPorPagina = 5;
  paginaActual = 1;

  modalAbierto = false;

  usuarios = [
    { nombre: 'John Michael', email: 'john@example.com', grado: 'Manager', estado: 'activo', tipo: 'Organization' },
    { nombre: 'Alexa Liras', email: 'alexa@example.com', grado: 'Designer', estado: 'inactivo', tipo: 'Marketing' },
    { nombre: 'Carlos Gómez', email: 'carlos@example.com', grado: 'Supervisor', estado: 'activo', tipo: 'Finance' },
    { nombre: 'María López', email: 'maria@example.com', grado: 'Usuario', estado: 'inactivo', tipo: 'HR' },
    { nombre: 'Michael Levi', email: 'michael@example.com', grado: 'Designer', estado: 'activo', tipo: 'Developer' },
    { nombre: 'Juan Pérez', email: 'juan@example.com', grado: 'Admin', estado: 'activo', tipo: 'CEO' },
    { nombre: 'Ana Torres', email: 'ana@example.com', grado: 'Gerente', estado: 'inactivo', tipo: 'Ventas' },
    { nombre: 'Pedro Ramirez', email: 'pedro@example.com', grado: 'Lider', estado: 'activo', tipo: 'Producción' },
    { nombre: 'Luis Mendoza', email: 'luis@example.com', grado: 'Asistente', estado: 'activo', tipo: 'Soporte' },
    { nombre: 'Diana Rojas', email: 'diana@example.com', grado: 'Coordinador', estado: 'inactivo', tipo: 'Marketing' },
  ];

  usuario = {
    nombre: '',
    apellidos: '',
    email: '',
    grado: '',
    estado: 'activo',
    contrasena: ''
  };

  constructor(
    private location: Location,
  ){}

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
  
  get totalPaginas() {
    return Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
  }
  
  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarUsuario(){
    console.log('usuario guardado: ', this.usuario),
    this.cerrarModal();
  }

  cancel(){
    this.location.back();
  }

  usuariosFiltrados = [...this.usuarios];
  filtroBusqueda: string = ''; 

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.grado.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      usuario.estado.toLowerCase().includes(this.filtroBusqueda.toLowerCase())
    );
  }

}

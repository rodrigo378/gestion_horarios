import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  showLoadingScreen(message: string = 'Cargando datos...'): void {
    Swal.fire({
      title: message,
      html: `<div style="font-size:15px;color:#4b5563;">Por favor, espera un momento.</div>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      backdrop: true,
    });
  }

  // success(message: string = 'Se actualizó'): void {
  //   Swal.fire({
  //     toast: true,
  //     position: 'top-end',
  //     icon: 'success',
  //     title: message,
  //     showConfirmButton: false,
  //     timer: 2000,
  //     timerProgressBar: true,
  //   });
  // }
  // ==========================
  // 🔄 GUARDADO DE HORARIOS
  // ==========================
  showSaving(): void {
    Swal.fire({
      title: 'Guardando horarios...',
      html: `<div style="font-size:15px;color:#4b5563;">Por favor, espera mientras se procesan los cambios.</div>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      backdrop: true,
    });
  }

  saveSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: '¡Horarios guardados!',
      text: 'Los horarios fueron registrados correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
    });
  }

  success(title: string, text: string): void {
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
      customClass: {
        container: 'swal-container-top',
      },
    });
  }
  // success(message: string, title: string = '¡Éxito!') {
  //   Swal.fire({
  //     title: title,
  //     text: message,
  //     icon: 'success',
  //     confirmButtonText: 'OK',
  //   });
  // }

  saveError(error?: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: `Ocurrió un error . Intenta nuevamente.
      ${error}`,
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#dc2626',
    });
  }

  // ==========================
  // ❌ ELIMINAR TODOS
  // ==========================
  confirmDeleteAll(): Promise<boolean> {
    return Swal.fire({
      title: '¿Eliminar todos los horarios?',
      html: `<p style="font-size:15px;">Esta acción eliminará <b>todos los horarios del turno</b> y no se podrá deshacer.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      backdrop: true,
    }).then((result) => result.isConfirmed);
  }

  deletingAll(): void {
    Swal.fire({
      title: 'Eliminando horarios...',
      html: `<div style="font-size:15px;color:#4b5563;">Por favor espera mientras se eliminan los horarios asignados.</div>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  deleteAllSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: 'Horarios eliminados',
      text: 'Todos los horarios del turno fueron eliminados correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
    });
  }

  deleteAllError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: 'No se pudieron eliminar los horarios. Intenta nuevamente.',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#dc2626',
    });
  }

  // ==========================
  // 🗑️ ELIMINAR UNO
  // ==========================
  confirmDeleteOne(): Promise<boolean> {
    return Swal.fire({
      title: '¿Eliminar horario?',
      html: `<p style="font-size:15px;">Este horario será <b>eliminado permanentemente</b> y no se podrá recuperar.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      backdrop: true,
    }).then((result) => result.isConfirmed);
  }

  deletingOne(): void {
    Swal.fire({
      title: 'Eliminando horario...',
      html: `<div style="font-size:15px;color:#4b5563;">Por favor espera mientras se elimina el horario seleccionado.</div>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  deleteOneSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: 'Horario eliminado',
      text: 'El horario fue eliminado correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
    });
  }

  deleteOneError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: 'No se pudo eliminar el horario. Intenta nuevamente.',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#dc2626',
    });
  }

  // ==========================
  // ✏️ ACTUALIZAR
  // ==========================
  updateSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: 'Horario actualizado',
      text: 'El horario fue modificado correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
    });
  }

  updateError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error al actualizar',
      text: 'Ocurrió un error al intentar actualizar el horario.',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#dc2626',
    });
  }

  // ==========================
  // 🚫 SALIDA DURANTE GUARDADO
  // ==========================
  confirmLeaveWhileSaving(): Promise<boolean> {
    return Swal.fire({
      title: 'Guardado en progreso',
      text: 'Aún se están guardando cambios. ¿Deseas salir de todos modos?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Salir de todos modos',
      cancelButtonText: 'Esperar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    }).then((result) => result.isConfirmed);
  }

  // ==========================
  // 🔄 CIERRE GLOBAL
  // ==========================
  close(): void {
    Swal.close();
  }
  // ==========================
  // ⚠️ ADVERTENCIAS (MODAL)
  // ==========================
  warn(
    title: string = 'Atención',
    text: string = 'Revisa la información ingresada.'
  ): void {
    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b', // amarillo
      backdrop: true,
    });
  }

  // ==========================
  // 🗓️ TURNOS
  // ==========================
  createTurnoSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: 'Turno creado',
      text: 'El turno fue registrado correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
    });
  }

  createTurnoError(
    message: string = 'Ocurrió un error al registrar el turno.'
  ): void {
    Swal.fire({
      icon: 'error',
      title: 'Error al crear el turno',
      text: message,
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#dc2626',
    });
  }

  // Llama cuando comienza una solicitud
  iniciarSolicitud(): void {
    this.loadingSubject.next(true);
  }

  // Llama cuando termina una solicitud
  finalizarSolicitud(): void {
    this.loadingSubject.next(false);
  }

  // ❌ Alerta de error
  error(message: string, title: string = 'Oops...!') {
    Swal.fire({
      title: title,
      html: message, // <--- acepta HTML
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  warning(message: string, title: string = 'Campos obligatorios') {
    return Swal.fire({
      title: title,
      html: `<div style="text-align: left;">
                  <ul style="padding-left: 20px; text-align: left; font-size: 20px;">
                    ${message
                      .split('\n')
                      .map((item) => `<li>${item}</li>`)
                      .join('')}
                  </ul>
                </div>`,
      icon: 'warning',
      confirmButtonText: 'OK',
      width: '450px',
    });
  }

  confirm(
    message: string,
    title: string = 'Confirmar acción'
  ): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    }).then((result) => result.isConfirmed);
  }
  // ==========================
  // 🧁 TOAST SUAVE (NO BLOQUEANTE)
  // ==========================

  toastSuccess(
    message: string = 'Acción completada correctamente',
    icon: 'success' | 'info' | 'warning' | 'error' = 'success',
    duration: number = 2500
  ): void {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      background: '#ffffff',
      color:
        icon === 'error'
          ? '#dc2626'
          : icon === 'warning'
          ? '#f59e0b'
          : '#16a34a',
    });
  }
}

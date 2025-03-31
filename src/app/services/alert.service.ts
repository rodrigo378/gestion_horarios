import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  // ✅ Alerta de éxito
  success(message: string, title: string = '¡Éxito!') {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  // ⚠️ Alerta de advertencia con retorno de promesa
  warning(message: string, title: string = 'Campos obligatorios') {
    return Swal.fire({
      title: title,
      html: `<div style="text-align: left;">
                <ul style="padding-left: 20px; text-align: left; font-size: 20px;">
                  ${message.split('\n').map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>`,
      icon: 'warning',
      confirmButtonText: 'OK',
      width: '450px'
    });
  } 

  // ⚠️ Alerta de erroralerta
  errorwarning(message: string, title: string = 'Oops...!') {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK'
    });
  }

    // ❌ Alerta de error
    error(message: string, title: string = 'Oops...!') {
      Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }

  // ❓ Alerta de confirmación con botón de cancelar
  confirm(message: string, title: string = 'Confirmar acción'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed);
  }

    info(message: string): void {
    Swal.fire('ℹ️ Información', message, 'info');
  }

  confirmConConflictos(htmlErrores: string): Promise<boolean> {
    return Swal.fire({
      title: '⚠️ ¡Conflictos detectados!',
      html: `<div style="text-align:left; font-size:15px;">
                <p>Se encontraron los siguientes conflictos:</p>
                <ul style="padding-left: 20px; margin-top:10px;">${htmlErrores}</ul>
                <p style="margin-top:20px;">¿Deseas guardar los horarios a pesar de los conflictos?</p>
            </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🛑 Guardar de todas formas',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33', // rojo
      cancelButtonColor: '#3085d6',
      width: '600px'
    }).then(result => result.isConfirmed);
  }
  
}

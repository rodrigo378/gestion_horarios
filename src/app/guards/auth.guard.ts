import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log("AuthGuard ejecutándose..."); // Verifica si se ejecuta

  if (authService.isAuthenticated()) {
    console.log("Usuario autenticado, acceso permitido.");
    return true;
  } else {
    console.log("Usuario no autenticado, redirigiendo al login...");
    router.navigate(['/login']);
    return false;
  }
};

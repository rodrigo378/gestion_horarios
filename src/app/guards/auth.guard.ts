import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.verificar().pipe(
    map((res) => {
      return true;
    }),
    catchError((error) => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

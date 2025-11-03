import { Injectable, NgZone } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const AUTH_EXCLUDE = [
  '/auth/login',
  '/auth/check',
  '/auth/refresh',
  '/auth/logout',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private ngZone: NgZone) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Asegura que SIEMPRE viajen las cookies HttpOnly
    const cloned = req.clone({ withCredentials: true });

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthCall = AUTH_EXCLUDE.some((p) => cloned.url.includes(p));

        if (!isAuthCall && [401, 419, 440].includes(error.status)) {
          // Opcional: llamar a /auth/logout para que el backend borre la cookie
          // (si tienes ese endpoint). Ignora errores.
          // this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe({ next: ()=>{}, error: ()=>{} });

          // Limpia caches locales (si usas algo)
          localStorage.clear();
          sessionStorage.clear();

          // Redirige al login de forma segura (dentro del zone)
          this.ngZone.run(() => this.router.navigate(['/login']));

          // Fallback duro si el Router está fuera de contexto (raro):
          setTimeout(() => {
            if (location.pathname !== '/login') location.href = '/login';
          }, 0);
        }

        return throwError(() => error);
      })
    );
  }
}

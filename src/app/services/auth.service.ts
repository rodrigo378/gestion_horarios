import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { User } from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.api}`; // backticks

  constructor(private http: HttpClient) {}

  login(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signin`, user, {
      withCredentials: true,
    });
  }

  setToken(token: string): void {
    document.cookie = `token=${token}; path=/; max-age=${
      60 * 60 * 24
    }; SameSite=Lax`; // Usar Lax o eliminar SameSite si no es necesario
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((row) => row.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  logout(): Observable<any> {
    // 🔥 Borrar cookie manualmente en el cliente (por si no es HttpOnly)
    document.cookie =
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
  
    // Llamar al backend para eliminar la cookie si es HttpOnly
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }
  
}

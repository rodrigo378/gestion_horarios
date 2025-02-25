import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { User } from '../interfaces/User';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.api}`; // backticks
  private apiUrlUbi = `${environment.api}`;

  constructor(private http: HttpClient) {}

  login(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token); // Guarda el token
  }

  getToken(): string | null {
    return localStorage.getItem('authToken'); // Obtiene el token almacenado
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    console.log("Token almacenado:", token);
    return !!token; // Devuelve true si hay token, false si no hay
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Elimina el token
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getUserData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeaders() });
  }
}

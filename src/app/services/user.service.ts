import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Modulo } from '../interfaces/Modulo';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.api}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTokenHeader() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  getPermisoMe(): Observable<{ itemId: number; estado: string }[]> {
    return this.http.get<{ itemId: number; estado: string }[]>(
      `${this.apiUrl}/permisos/me`,
      this.getTokenHeader()
    );
  }

  getPermisosTo(email: string) {
    return this.http.post(`${this.apiUrl}/permisos/to`, { email });
  }

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.apiUrl}/modulo`);
  }

  actualizarPermisos(user_id: number, items_id: number[]) {
    return this.http.post(`${this.apiUrl}/permisos`, { user_id, items_id });
  }
}

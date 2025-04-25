import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';
import { Modulo } from '../interfaces/Modulo';
import { CreateUserDTO, User, Usernew } from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.api}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPermisoMe(): Observable<{ itemId: number; estado: string }[]> {
    return this.http.get<{ itemId: number; estado: string }[]>(
      `${this.apiUrl}/admin/permisos/me`,
      { withCredentials: true }
    );
  }

  getPermisosTo(email: string) {
    return this.http.post(
      `${this.apiUrl}/admin/permisos/to`,
      { email },
      { withCredentials: true }
    );
  }

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.apiUrl}/admin/modulo`);
  }

  actualizarPermisos(user_id: number, items_id: number[]) {
    return this.http.post(`${this.apiUrl}/admin/permisos`, {
      user_id,
      items_id,
    }, { withCredentials: true });
  }

  getUserInfo(): Observable<Usernew[]> {
    return this.http.get<Usernew[]>(`${this.apiUrl}/user`);
  }

  createUser(data: CreateUserDTO): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(
      `${this.apiUrl}/auth/signup`,
      data
    );
  }

  getUserById(id: number): Observable<Usernew> {
    return this.http.get<Usernew[]>(`${this.apiUrl}/user/${id}`).pipe(
      // Devuelve solo el primer elemento del array
      map((response) => response[0])
    );
  }

  updateUser(usuario: Usernew & { password: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user`, usuario);
  }
}

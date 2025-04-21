import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { User } from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.api}`;

  constructor(private http: HttpClient) {}

  login(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signin`, user, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

  verificar(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verificar`, {
      withCredentials: true,
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.api}`;

  constructor(private http: HttpClient) {}

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

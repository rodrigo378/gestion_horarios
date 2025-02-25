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
  private apiUrlUbi = `${environment.api}`;

  constructor(private http: HttpClient) {}

  login(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  setToken(token: string): void {
    document.cookie = `token=${token}; path=/; max-age=${
      60 * 60 * 24
    }; Secure; SameSite=Strict`;
  }

  getToken(): string | null {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((row) => row.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  register(user: User) {
    return this.http.post(`${this.apiUrl}/login`, { user });
  }

  logout() {
    document.cookie =
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure';
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
}

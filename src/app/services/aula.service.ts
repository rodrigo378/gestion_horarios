import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Aula } from '../interfaces/aula';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AulaService {

  private apiUrl = `${environment.api}/aula`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  getTokenHeader() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  obtenerAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(this.apiUrl);
  }
}

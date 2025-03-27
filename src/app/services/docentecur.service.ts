import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Docente } from '../interfaces/Docente';

@Injectable({
  providedIn: 'root'
})
export class DocentecurService {
  
  private apiUrl = `${environment.api}/docente`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }
  
  getTokenHeader() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  obtenerDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.apiUrl);
  }

}

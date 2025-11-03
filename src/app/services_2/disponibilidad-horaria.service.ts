import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadHorariaService {

    private apiUrl = `${environment.api}/disponibilidad`; // backticks
    private apiUrlUbi = `${environment.api}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getTokenHeader() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  createdisponibilidad(disponibilidad: any[]){
    return this.http.post(`${this.apiUrl}`, {disponibilidad}, this.getTokenHeader() );
  }

  getDisponibilidad() {
    return this.http.get(`${this.apiUrl}/user`, this.getTokenHeader());
  }
  
  updateDisponibilidad(id: number, disponibilidad: any) {
    return this.http.put(`${this.apiUrl}/${id}`, disponibilidad, this.getTokenHeader());
  }
}

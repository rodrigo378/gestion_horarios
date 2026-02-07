import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SincronizarService {
  private apiUrl = `${environment.api}/hr/sinc`;

  constructor(private http: HttpClient) {}

  sincronizarBatch(courseids: number[]) {
    return this.http.post(
      `${this.apiUrl}/batch`,
      { courseids },
      { withCredentials: true },
    );
  }
}

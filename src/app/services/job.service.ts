// job.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

export interface JobResponse {
  id: string;
  name: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  data: any;
  returnvalue: any;
  failedReason: string | null;
  timestamp?: string;
  processedOn?: string;
  finishedOn?: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = `${environment.api}/core/job`;

  constructor(private http: HttpClient) {}

  getJobById(jobId: string | number): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.apiUrl}/${jobId}`);
  }
}

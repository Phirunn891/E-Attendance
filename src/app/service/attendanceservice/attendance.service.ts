import { Injectable } from '@angular/core';
import { environment } from '../../../env/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  readonly apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) { }

  saveAttendance(records: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, { records });
  }

  getAttendanceLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/logs`);
  }

  getAttendanceDetails(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/details`, { params: { startDate, endDate } });
  }
}



import { Injectable } from '@angular/core';
import { environment } from '../../../env/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  readonly apiUrl = `${environment.apiUrl}/student`;


constructor(private http: HttpClient) { }

  getStudents(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getStudentById(id: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  importStudents(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
  addStudent(studentData: any): Observable<any> {
    return this.http.post(this.apiUrl, studentData);
  }

  updateStudent(id: number | string, studentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, studentData);
  }

  deleteStudent(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}

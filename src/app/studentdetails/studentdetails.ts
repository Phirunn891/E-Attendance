import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../service/studentservice/student.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-studentdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studentdetails.html',
  styleUrl: './studentdetails.css',
})
export class Studentdetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);

  student: any = null;
  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    const studentId = this.route.snapshot.queryParamMap.get('id');
    if (studentId) {
      this.fetchStudentDetails(studentId);
    } else {
      this.errorMessage = 'No student ID provided.';
      this.loading = false;
    }
  }

  fetchStudentDetails(id: string): void {
    this.studentService.getStudentById(id).subscribe({
      next: (response) => {
        this.student = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching student details:', err);
        this.errorMessage = 'Failed to load student details.';
        this.loading = false;
      }
    });
  }

  studentDetailsBack(): void {
    this.router.navigate(['/layout/studentinfo']);
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { AttendanceService } from '../service/attendanceservice/attendance.service';
import { StudentService } from '../service/studentservice/student.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-studentinfo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './studentinfo.html',
  styleUrl: './studentinfo.css',
})
export class Studentinfo implements OnInit {
  studentLogs = signal<any[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(false);
  errorMessage: string = '';

  isEditMode: boolean = false;
  editingStudentId: number | null = null;
  newStudent: any = {
    studentname_kh: '',
    studentname_eng: '',
    gender: 'M',
    class_id: null
  };

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private router: Router
  ) {}

  filteredStudentLogs() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.studentLogs();
    
    return this.studentLogs().filter(log => 
      (log.studentname_kh && log.studentname_kh.toLowerCase().includes(query)) ||
      (log.studentname_eng && log.studentname_eng.toLowerCase().includes(query))
    );
  }

  viewStudentDetails(student_id: number): void {
    this.router.navigate(['/layout/studentdetails'], { queryParams: { id: student_id } });
  }

  ngOnInit(): void {
    this.fetchAttendanceLogs();
  }

  fetchAttendanceLogs(): void {
    this.loading.set(true);
    this.errorMessage = '';
    
    this.attendanceService.getAttendanceLogs().subscribe({
      next: (response) => {
        if (response && response.statusCode === 200) {
          this.studentLogs.set(response.data || []);
        } else {
          this.errorMessage = response?.message || 'Unexpected response format from server.';
        }
        setTimeout(() => {
          this.loading.set(false);
        }, 500);
      },
      error: (err) => {
        console.error('Error fetching attendance logs:', err);
        this.errorMessage = 'Failed to connect to the server.';
        this.loading.set(false);
      }
    });
  }

  editStudent(log: any) {
    this.isEditMode = true;
    this.editingStudentId = log.student_id;
    this.newStudent = {
      studentname_kh: log.studentname_kh,
      studentname_eng: log.studentname_eng,
      gender: log.gender,
      class_id: log.class_id
    };
  }

  deleteStudent(id: number) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: (res) => {
          alert('Student deleted successfully!');
          this.fetchAttendanceLogs();
        },
        error: (err) => {
          console.error('Error deleting student', err);
          alert('Failed to delete student.');
        }
      });
    }
  }

  saveStudent() {
    if (!this.newStudent.studentname_kh && !this.newStudent.studentname_eng) {
      alert('Please enter student name.');
      return;
    }

    if (this.isEditMode && this.editingStudentId) {
      this.studentService.updateStudent(this.editingStudentId, this.newStudent).subscribe({
        next: (res) => {
          alert('Student updated successfully!');
          this.fetchAttendanceLogs();
          this.resetNewStudent();
        },
        error: (err) => {
          console.error('Error updating student', err);
          alert('Failed to update student.');
        }
      });
    } else {
      this.studentService.addStudent(this.newStudent).subscribe({
        next: (res) => {
          alert(res.message || 'Student added successfully!');
          this.fetchAttendanceLogs();
          this.resetNewStudent();
        },
        error: (err) => {
          console.error('Error adding student', err);
          alert(err.error?.message || 'Failed to add student.');
        }
      });
    }
  }

  openRegisterModal() {
    this.isEditMode = false;
    this.resetNewStudent();
  }

  resetNewStudent() {
    this.newStudent = {
      studentname_kh: '',
      studentname_eng: '',
      gender: 'M',
      class_id: null
    };
  }

  exportToPDF(): void {
    const data = this.studentLogs();
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.text('Student Attendance Logs', 14, 15);
    
    const headers = [['No', 'Name KH', 'Name ENG', 'Gender', 'Class', 'Present', 'Absent']];
    const body = data.map((log, index) => [
      index + 1,
      log.studentname_kh,
      log.studentname_eng,
      log.gender,
      log.class_id || 'N/A',
      log.totalPresent,
      log.totalAbsent
    ]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 20,
      headStyles: { fillColor: [0, 166, 81] },
      theme: 'grid'
    });

    doc.save(`StudentLogs_${new Date().getTime()}.pdf`);
  }

  async exportToExcel(): Promise<void> {
    const data = this.studentLogs();
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // 1. Fetch logo and add to worksheet
    try {
      const response = await fetch('/image/logo.png');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      const logoId = workbook.addImage({
        buffer: arrayBuffer,
        extension: 'png',
      });

      worksheet.addImage(logoId, {
        tl: { col: 0.5, row: 0.2 },
        ext: { width: 80, height: 80 }
      });
    } catch (err) {
      console.error('Failed to load logo:', err);
    }

    worksheet.mergeCells('B2:F3');
    const titleCell = worksheet.getCell('B2');
    titleCell.value = 'វិទ្យាស្ថានសុីតិក';
    titleCell.font = { name: 'Dangrek', size: 24, bold: true, color: { argb: 'FF00A651' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const headerRowValues = ['No', 'StudentName', 'Gender', 'TotalA', 'TotalP', 'Status', 'Class'];
    const spacerRow = worksheet.addRow([]);
    const actualHeaderRow = worksheet.addRow(headerRowValues);
    
    actualHeaderRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A651' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let grandTotalA = 0;
    let grandTotalP = 0;

    data.forEach((log, index) => {
      const totalA = Number(log.totalAbsent) || 0;
      const totalP = Number(log.totalPresent) || 0;
      grandTotalA += totalA;
      grandTotalP += totalP;

      const row = worksheet.addRow([
        index + 1,
        log.studentname_kh || log.studentname_eng,
        log.gender || 'N/A',
        totalA,
        totalP,
        'RS',
        log.class_id || 'N/A'
      ]);

      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });

    const totalRow = worksheet.addRow(['', 'Total', '', grandTotalA, grandTotalP, '', '']);
    totalRow.getCell(2).font = { bold: true, color: { argb: 'FF00A651' } };
    
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 5) {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }
    });

    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 10;

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `AttendanceReport_${new Date().getTime()}.xlsx`);
  }
}

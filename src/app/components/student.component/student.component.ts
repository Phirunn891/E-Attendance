import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../service/studentservice/student.service';
import * as XLSX from 'xlsx';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../service/attendanceservice/attendance.service';
import { TelegramService } from '../../service/telegramservice/telegram.service';

@Component({
  selector: 'app-student.component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css',
})
export class StudentComponent implements OnInit {
  studentList: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  attendanceSheet: any[] = [];
  searchQuery: string = '';

  newStudent: any = {
    studentname_kh: '',
    studentname_eng: '',
    gender: 'M', 
    class_id: null
  };

  private scheduleMap: { [key: string]: string[] } = {
    'Monday': ['SM', '2D', 'O I'],
    'Tuesday': ['IS', 'WEB', 'Java'],
    'Wednesday': ['O I','SA', 'SM'],
    'Thursday': ['WEB', 'SA', 'MIS'],
    'Friday': ['MIS', 'IS', 'NET'],
    'Saturday': ['NET', 'Java', '2D'],
    'Sunday': []
  };

  constructor(
    private studentservice: StudentService,
    private attendanceService: AttendanceService,
    private telegramService: TelegramService
  ) {}

  ngOnInit(): void {
    this.getStudents();
    this.generateSchedule();
  }


  getStudents() {
    this.studentservice.getStudents().subscribe((res) => {
      this.studentList = res.data.map((student: any) => ({
        ...student,
        name_kh: student.studentname_kh,
        name_eng: student.studentname_eng,
        attendance: {} // Initialize with empty object
      }));
      this.loadAttendanceData(); // Load attendance after students are fetched
    });
  }


  refresh() {
    this.getStudents();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.importStudents(file);
    }
  }

  importStudents(file: File): void {
    this.studentservice.importStudents(file).subscribe({
      next: (res) => {
        alert(res.message || 'Import successful!');
        this.getStudents();
      },
      error: (err) => {
        console.error('Import failed', err);
        alert(err.error?.message || 'Failed to import students. Please check your file format.');
      },
    });
  }

  exportToExcel(): void {
    if (!this.studentList || this.studentList.length === 0) {
      alert('No data to export!');
      return;
    }

    // Map data to match table headers
    const exportData = this.studentList.map((student, index) => ({
      '#': index + 1,
      'Student Name KH': student.studentname_kh,
      'Student Name ENG': student.studentname_eng,
      GENDER: student.gender,
      Class: student.class_id,
      Status: 'Present', 
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'Student_List.xlsx');
  }

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  }

  generateSchedule() {
    this.attendanceSheet = [];
    const selected = new Date(this.selectedDate);
    const monday = this.getMonday(selected);
    
    // Update selectedDate to Monday 
    this.selectedDate = monday.toISOString().split('T')[0];

    for (let i = 0; i < 6; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const daySubjects = this.scheduleMap[dayName] || [];

        this.attendanceSheet.push({
            date: dateStr,
            displayDate: currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            subjects: daySubjects
        });
    }
    this.loadAttendanceData(); // Load attendance for the new week
  }


  get filteredStudentList() {
    if (!this.searchQuery) {
      return this.studentList;
    }
    const query = this.searchQuery.toLowerCase();
    return this.studentList.filter(student => 
      (student.studentname_kh && student.studentname_kh.toLowerCase().includes(query)) ||
      (student.studentname_eng && student.studentname_eng.toLowerCase().includes(query))
    );
  }

  previousWeek() {
    const current = new Date(this.selectedDate);
    current.setDate(current.getDate() - 7);
    this.selectedDate = current.toISOString().split('T')[0];
    this.generateSchedule();
  }

  nextWeek() {
    const current = new Date(this.selectedDate);
    current.setDate(current.getDate() + 7);
    this.selectedDate = current.toISOString().split('T')[0];
    this.generateSchedule();
  }

  toggleAttendance(student: any, date: string, subject: string) {
    const key = `${date}-${subject}`;

    if (!student.attendance[key]) {
      student.attendance[key] = 'present';
    } else if (student.attendance[key] === 'present') {
      student.attendance[key] = 'absent';
    } else {
      student.attendance[key] = null;
    }
  }

  getStatusClass(student: any, date: string, subject: string) {
    const key = `${date}-${subject}`;
    if (student.attendance[key] === 'present') return 'present';
    if (student.attendance[key] === 'absent') return 'absent';
    return '';
  }

  saveStudent() {
    if (!this.newStudent.studentname_kh && !this.newStudent.studentname_eng) {
      alert('Please enter student name.');
      return;
    }

    this.studentservice.addStudent(this.newStudent).subscribe({
      next: (res) => {
        alert(res.message || 'Student added successfully!');
        this.getStudents();
        this.resetNewStudent();
        // Modal will be closed via data-bs-dismiss on the button if we want, 
        // but it's better to handle it here if possible or let the user close it.
        // For simplicity, I'll rely on the alert and manual close or add dismiss.
      },
      error: (err) => {
        console.error('Error adding student', err);
        alert(err.error?.message || 'Failed to add student.');
      }
    });
  }

  resetNewStudent() {
    this.newStudent = {
      studentname_kh: '',
      studentname_eng: '',
      gender: 'M',
      class_id: null
    };
  }

  getStatusIcon(student: any, date: string, subject: string) {
    const key = `${date}-${subject}`;
    if (student.attendance[key] === 'present') return '✓';
    if (student.attendance[key] === 'absent') return '✗';
    return '';
  }

  saveAttendance() {
    const records: any[] = [];
    const subjectMap: { [key: string]: number } = {
      'SM': 1, '2D': 2, 'O I': 3, 'IS': 4, 'WEB': 5, 'Java': 6, 'SA': 7, 'MIS': 8, 'NET': 9
    };

    this.studentList.forEach(student => {
      Object.entries(student.attendance).forEach(([key, status]) => {
        if (status) {
          const parts = key.split('-');
          const subject = parts.pop()!;
          const date = parts.join('-');
          records.push({
            student_id: student.student_id,
            subject_id: subjectMap[subject] || 1, // Default or map
            teacher_id: 1, // Default teacher
            att_date: date,
            status: status === 'present' ? 1 : 0
          });
        }
      });
    });

    if (records.length === 0) {
      alert('No attendance records to save.');
      return;
    }

    this.attendanceService.saveAttendance(records).subscribe({
      next: (res) => {
        alert(res.message || 'Attendance saved successfully!');
        this.loadAttendanceData(); // Refresh to confirm save
      },
      error: (err) => {
        console.error('Error saving attendance', err);
        alert(err.error?.message || 'Failed to save attendance.');
      }
    });
  }

  loadAttendanceData() {
    if (this.attendanceSheet.length === 0 || this.studentList.length === 0) return;

    const startDate = this.attendanceSheet[0].date;
    const endDate = this.attendanceSheet[this.attendanceSheet.length - 1].date;

    this.attendanceService.getAttendanceDetails(startDate, endDate).subscribe({
      next: (res) => {
        const records = res.data;
        
        // Reset attendance mapping for the fetched range
        this.studentList.forEach(student => {
            // We should only clear keys within this range if we want to be safe, 
            // but for simplicity we reload what we got.
            // Actually, best to just merge.
            records.forEach((record: any) => {
                if (record.student_id === student.student_id) {
                    const date = record.att_date.split('T')[0];
                    const subject = record.subject_name;
                    const key = `${date}-${subject}`;
                    student.attendance[key] = record.status === 1 ? 'present' : 'absent';
                }
            });
        });
      },
      error: (err) => {
        console.error('Error loading attendance details', err);
      }
    });
  }

  sendTelegramAlert() {
    if (this.studentList.length === 0) {
      alert('No student data to send.');
      return;
    }

    const dateStr = new Date(this.selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let message = `<b>📊 Attendance Report</b>\n`;
    message += `📅 <b>Date:</b> ${dateStr}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;

    let absentCount = 0;
    let presentCount = 0;

    // We check the first subject of the selected date for a quick summary
    // Or we can list all students and their general status if it's a "Daily Log"
    this.studentList.forEach(student => {
      // Find any absence in the currently displayed sheet
      let hasAbsence = false;
      this.attendanceSheet.forEach(day => {
        day.subjects.forEach((sub: string) => {
          const key = `${day.date}-${sub}`;
          if (student.attendance[key] === 'absent') {
            hasAbsence = true;
          }
          if (student.attendance[key] === 'present') {
            presentCount++;
          }
        });
      });

      if (hasAbsence) {
        message += `❌ <b>${student.studentname_eng}</b> (Absent)\n`;
        absentCount++;
      }
    });

    if (absentCount === 0) {
      message += `✅ All students are present!\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👥 Total Students: ${this.studentList.length}\n`;
    message += `🚫 Total Absences: ${absentCount}`;

    this.telegramService.sendMessage(message).subscribe({
      next: (res) => {
        alert('Telegram alert sent successfully!');
      },
      error: (err) => {
        console.error('Telegram error', err);
        alert('Failed to send Telegram alert.');
      }
    });
  }
}

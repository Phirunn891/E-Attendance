import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../service/authservice/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  message: string = '';
  isError: boolean = false;
  loading: boolean = false;

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    return newPassword && confirmPassword && newPassword.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.message = '';
      
      const passwords = this.passwordForm.value as any;
      
      this.authService.changePassword(passwords).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.message = 'Password updated successfully!';
          this.isError = false;
          this.passwordForm.reset();
        },
        error: (err: any) => {
          this.loading = false;
          this.message = err.error?.message || 'Failed to update password.';
          this.isError = true;
        }
      });
    }
  }
}

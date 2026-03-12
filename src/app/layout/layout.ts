import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";
import { AuthService } from '../service/authservice/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}         

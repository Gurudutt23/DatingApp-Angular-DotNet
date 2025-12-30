import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  username = '';
  password = '';
  
  // UI States
  message = '';
  isError = false;
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  register(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Reset UI state before new attempt
    this.message = '';

    // --- CLIENT-SIDE VALIDATION ---
    if (!this.username.trim()) {
      return this.showAlert('Username is required.', true);
    }
    
    if (this.username.length < 3) {
      return this.showAlert('Username must be at least 3 characters.', true);
    }

    if (!this.password) {
      return this.showAlert('Password is required.', true);
    }

    if (this.password.length < 6) {
      return this.showAlert('Password must be at least 6 characters.', true);
    }

    this.isLoading = true;

    this.http.post(
      'http://localhost:5000/api/account/register',
      { username: this.username, password: this.password },
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('Account created! Redirecting...', false);
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: err => {
        this.isLoading = false;
        // Server error (e.g., Username Taken)
        this.showAlert(err.error || 'Connection error. Please try again.', true);
      }
    });
  }

  showAlert(msg: string, isError: boolean) {
    this.message = msg;
    this.isError = isError;

    // Auto-hide errors after 4 seconds
    if (isError) {
      setTimeout(() => {
        if (this.message === msg) this.message = '';
      }, 4000);
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
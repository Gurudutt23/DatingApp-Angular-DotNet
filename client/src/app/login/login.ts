import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';
  
  // States for Toast and Spinner
  message = '';
  isError = false;
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.message = '';
    this.isError = false;

    // 1. Basic Empty Check
    if (!this.username.trim() || !this.password) {
      this.showAlert('Username and password are required', true);
      return;
    }

    // 2. Email Format Check (Stops the "Wait" freeze before it starts)
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!emailPattern.test(this.username.toLowerCase())) {
      this.showAlert('Please enter a valid email address', true);
      return; 
    }

    this.loading = true;

    this.http.post<any>('http://localhost:5000/api/account/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', this.username);

        this.http.get('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${res.token}` }
        }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.loading = false; 
            if (err.status === 404) {
              this.showAlert('Complete your profile to continue', false);
              setTimeout(() => this.router.navigate(['/profile']), 1500);
            } else {
              this.showAlert('Authorization error', true);
            }
          }
        });
      },
      error: (err) => {
        this.loading = false; // STOP SPINNER ON WRONG EMAIL/PASS
        if (err.status === 401) {
          this.showAlert('Invalid credentials', true);
        } else {
          this.showAlert('Server error. Try again.', true);
        }
      }
    });
  }

  showAlert(msg: string, isError: boolean) {
    this.message = msg;
    this.isError = isError;
    if (isError) {
      setTimeout(() => {
        if (this.message === msg) this.message = '';
      }, 4000);
    }
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
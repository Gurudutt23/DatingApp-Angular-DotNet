import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Save token after login
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Get token (used by interceptor)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
  }
}

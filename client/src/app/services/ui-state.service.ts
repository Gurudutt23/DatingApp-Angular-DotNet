import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {

  // Controls whether profile edit mode is active
  showEditProfile = signal(false);

  constructor(private router: Router) {}

  // 🔥 Call this from Dashboard
  goToProfileEdit() {
    this.showEditProfile.set(true);
    this.router.navigate(['/profile']);
  }

  // Optional: reset after leaving profile
  clearProfileEdit() {
    this.showEditProfile.set(false);
  }
}

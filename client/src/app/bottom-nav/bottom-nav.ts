import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.html'
})
export class BottomNavComponent {

  constructor(private router: Router) {}

  go(tab: string) {
    this.router.navigate(['/dashboard'], {
      queryParams: { tab }
    });
  }

  goChats() {
    this.router.navigate(['/chats']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  get showNav(): boolean {
    return !!localStorage.getItem('token');
  }
}

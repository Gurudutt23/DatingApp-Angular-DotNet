import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent {

  showMenu = false;
  currentRoute = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.showMenu = false;
      });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get username(): string {
    return localStorage.getItem('username') || 'User';
  }

  get showNavbar(): boolean {
    return this.isLoggedIn &&
      !this.currentRoute.startsWith('/login') &&
      !this.currentRoute.startsWith('/register');
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  editProfile() {
    this.showMenu = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.clear();
    this.showMenu = false;
    this.router.navigateByUrl('/login');
  }

  // 🔥 CLOSE DROPDOWN ON OUTSIDE CLICK
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-navbar')) {
      this.showMenu = false;
    }
  }
}

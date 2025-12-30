import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './navbar/navbar'; // adjust path if needed
import { BottomNavComponent } from './bottom-nav/bottom-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    BottomNavComponent 
  ],
  templateUrl: './app.html'
})
export class AppComponent {

  // 🔥 THIS WAS MISSING
  showNavbar = true;

constructor(private router: Router) {

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {

      const url = event.urlAfterRedirects;

      // 🔐 Auth pages → NO NAVBAR
      if (url.startsWith('/login') || url.startsWith('/register')) {
        this.showNavbar = false;
      } 
      // 🏠 Everything else → SHOW NAVBAR
      else {
        this.showNavbar = true;
      }
    });
}

}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const profileGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get('http://localhost:5000/api/profile/me').pipe(
    map(() => {
      // ✅ profile exists
      return true;
    }),
    catchError(err => {
      if (err.status === 404) {
        // ❗ logged in but no profile
        router.navigate(['/profile']);
      } else {
        // auth error / token invalid
        router.navigate(['/login']);
      }
      return of(false);
    })
  );
};

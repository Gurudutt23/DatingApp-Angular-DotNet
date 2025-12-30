import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  // ✅ Attach token if exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(err => {

      // 🔥 GLOBAL 401 HANDLER
      if (err.status === 401) {

        // 1️⃣ Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // 2️⃣ Redirect to login
        router.navigateByUrl('/login');
      }

      return throwError(() => err);
    })
  );
};

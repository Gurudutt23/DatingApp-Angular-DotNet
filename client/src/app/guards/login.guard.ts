import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    // Already logged in → dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

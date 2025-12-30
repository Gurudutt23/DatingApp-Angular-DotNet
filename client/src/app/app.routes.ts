import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { ProfileComponent } from './profile/profile';
import { ChatComponent } from './chat/chat';
import { authGuard } from './guards/auth.guard';
import { profileGuard } from './guards/profile.guard';
import { loginGuard } from './guards/login.guard';
  import { ChatListComponent } from './chat-list/chat-list';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    component: Login,
    canActivate: [loginGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [loginGuard]
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },

{
  path: 'dashboard',
  component: Dashboard,
  canActivate: [authGuard, profileGuard]
}

,

  // 🔥 CHAT ROUTE (NEW)
  {
    path: 'chat/:id',
    component: ChatComponent,
    canActivate: [authGuard] // only logged-in users
  },
{
  path: 'chats',
  component: ChatListComponent,
  canActivate: [authGuard]
}

];

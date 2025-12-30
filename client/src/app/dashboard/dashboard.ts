import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router,ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {

  // ================= UI =================
  activeSection:
    | 'discover'
    | 'likes'
    | 'liked'
    | 'matches'
    | 'profile'
    = 'discover';

  // ================= DATA =================
  users = signal<any[]>([]);
  likedUsers = signal<any[]>([]);
  likesReceived = signal<any[]>([]);
  matches = signal<any[]>([]);
  matchedIds = signal<number[]>([]);
currentImageIndex: Record<number, number> = {};

  currentUser = localStorage.getItem('username');
  API = 'http://localhost:5000';

 constructor(
  private http: HttpClient,
  private router: Router,
  private route: ActivatedRoute
) {
  this.route.queryParams.subscribe(params => {
    const tab = params['tab'];

    this.activeSection =
      tab === 'likes' ||
      tab === 'liked' ||
      tab === 'matches' ||
      tab === 'profile'
        ? tab
        : 'discover';
  });

  this.loadLikesGiven();
  this.loadLikesReceived();
  this.loadMatches();
}


  // ================= NAV =================
  changeSection(section: 'discover' | 'likes' | 'liked' | 'matches' | 'profile') {
    this.activeSection = section;
  }

  // ================= DISCOVER =================
  loadUsers() {
    const likedIds = this.likedUsers().map(u => u.id);

    this.http.get<any[]>(`${this.API}/api/users`)
      .subscribe(res => {
        this.users.set(
          res.filter(
            u =>
              u.username !== this.currentUser &&
              !likedIds.includes(u.id)
          )
        );
      });
  }

  likeUser(user: any) {
    this.http.post(`${this.API}/api/likes/${user.id}`, {})
      .subscribe(() => {
        this.users.set(this.users().filter(u => u.id !== user.id));
        this.likedUsers.set([...this.likedUsers(), user]);
      });
  }

  isLiked(id: number): boolean {
    return this.likedUsers().some(u => u.id === id);
  }

  // ================= LIKES GIVEN =================
  loadLikesGiven() {
    this.http.get<any[]>(`${this.API}/api/likes/given`)
      .subscribe({
        next: res => {
          const ids = res.map(x => x.likedUserId);

          if (ids.length === 0) {
            this.likedUsers.set([]);
            this.loadUsers();
            return;
          }

          this.http.post<any[]>(`${this.API}/api/users/by-ids`, ids)
            .subscribe(users => {
              this.likedUsers.set(users);
              this.loadUsers();
            });
        },
        error: () => {
          this.likedUsers.set([]);
          this.loadUsers();
        }
      });
  }

  // ================= LIKES RECEIVED =================
  loadLikesReceived() {
    this.http.get<any[]>(`${this.API}/api/likes/received`)
      .subscribe(res => {
        const likerIds = res.map(x => x.likerUserId)
          .filter(id => !this.matchedIds().includes(id));

        if (likerIds.length === 0) {
          this.likesReceived.set([]);
          return;
        }

        this.http.post<any[]>(`${this.API}/api/users/by-ids`, likerIds)
          .subscribe(users => this.likesReceived.set(users));
      });
  }

likeBack(user: any) {

  const currentUserId = Number(
    localStorage.getItem('userId')
  );

  // 🔐 HARD GUARD (ABSOLUTE)
  if (!user?.id || user.id === currentUserId) {
    console.warn('Blocked invalid likeBack:', user);
    return;
  }

  this.http.post(`${this.API}/api/likes/${user.id}`, {})
    .subscribe({
      next: () => {

        // ✅ Remove from Likes Received instantly
        this.likesReceived.set(
          this.likesReceived().filter(u => u.id !== user.id)
        );

        // ✅ Add to liked users (optional consistency)
        if (!this.likedUsers().some(u => u.id === user.id)) {
          this.likedUsers.set([...this.likedUsers(), user]);
        }

        // ✅ Add to matchedIds immediately
        if (!this.matchedIds().includes(user.id)) {
          this.matchedIds.set([...this.matchedIds(), user.id]);
        }

        // ✅ Reload matches list
        this.loadMatches();

        alert(`🎉 It's a match with ${user.username}!`);
      },
      error: err => {
        console.error('Like back failed:', err);
      }
    });
}

getImage(user: any): string | null {
  if (!user.photos || user.photos.length === 0) return null;

  const index = this.currentImageIndex[user.id] ?? 0;
  return user.photos[index]?.url ?? null;
}

nextImage(user: any) {
  if (!user.photos || user.photos.length <= 1) return;

  const current = this.currentImageIndex[user.id] ?? 0;
  this.currentImageIndex[user.id] =
    (current + 1) % user.photos.length;
}

prevImage(user: any) {
  if (!user.photos || user.photos.length <= 1) return;

  const current = this.currentImageIndex[user.id] ?? 0;
  this.currentImageIndex[user.id] =
    (current - 1 + user.photos.length) % user.photos.length;
}

  // ================= MATCHES =================
  loadMatches() {
    this.http.get<any[]>(`${this.API}/api/likes/matches`)
      .subscribe(res => {
        const ids = res.map(x => x.id);
        this.matchedIds.set(ids);

        if (ids.length === 0) {
          this.matches.set([]);
          return;
        }

        this.http.post<any[]>(`${this.API}/api/users/by-ids`, ids)
          .subscribe(users => this.matches.set(users));
      });
  }

  // 🔥 CHAT NAVIGATION (THIS WAS MISSING)
  openChat(userId: number) {
    this.router.navigate(['/chat', userId]);
  }

  // ================= PROFILE =================
  editProfile() {
    this.router.navigate(['/profile']);
  }
}

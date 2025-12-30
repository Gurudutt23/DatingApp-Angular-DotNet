import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html'
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  messages = signal<any[]>([]);
  newMessage = signal('');
  sending = signal(false);

  matchedUserId!: number;
  currentUserId!: number;
  matchedUser: any = null;
  API = 'http://localhost:5000';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.matchedUserId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUserId = this.getUserIdFromToken();
    if (this.matchedUserId) {
      this.loadMatchedUser();
      this.loadMessages();
    }
  }

  loadMatchedUser(): void {
    this.http.get<any>(`${this.API}/api/users/${this.matchedUserId}`).subscribe(user => this.matchedUser = user);
  }

  loadMessages(): void {
    this.http.get<any[]>(`${this.API}/api/messages/${this.matchedUserId}`).subscribe(res => {
      const mapped = res.map(m => ({
        ...m,
        isMine: Number(m.senderId) === this.currentUserId
      }));
      this.messages.set(mapped);
      this.scrollToBottom();
    });
  }

  sendMessage(): void {
  const text = this.newMessage().trim();
  if (this.sending() || !text) return;

  this.sending.set(true);
  
  const optimisticMessage = {
    id: Date.now(),
    content: text,
    senderId: this.currentUserId,
    isMine: true,
    messageSent: new Date() // Add this to show the correct local time instantly
  };

  this.messages.update(prev => [...prev, optimisticMessage]);
  this.newMessage.set('');
  this.scrollToBottom();

  this.http.post(`${this.API}/api/messages/${this.matchedUserId}`, { content: text })
    .subscribe({
      next: () => {
        this.sending.set(false);
        // Important: After sending, you might want to reload to get the DB timestamp
        // this.loadMessages(); 
      },
      error: () => this.sending.set(false)
    });
}
  goBack() { this.router.navigate(['/chats']); }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private getUserIdFromToken(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.nameid);
  }
}
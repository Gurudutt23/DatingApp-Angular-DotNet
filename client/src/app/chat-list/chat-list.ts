import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list.html'
})
export class ChatListComponent implements OnInit {
  chats = signal<any[]>([]);
  API = 'http://localhost:5000';
  
  // Add this to fix the error
  activeSection: string = 'chats'; 

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadChats();
  }

  loadChats() {
    this.http
      .get<any[]>(`${this.API}/api/messages/conversations`)
      .subscribe(res => this.chats.set(res));
  }

  openChat(userId: number) {
    this.router.navigate(['/chat', userId]);
  }

  // Add this to handle going back to the dashboard
  goToDiscover() {
    this.router.navigate(['/dashboard'], { queryParams: { tab: 'discover' } });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  baseUrl = 'http://localhost:5000/api/profile/';

  constructor(private http: HttpClient) {}

  profileExists() {
    return this.http.get<boolean>(this.baseUrl + 'exists');
  }
}

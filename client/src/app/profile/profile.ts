import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface PhotoPreview {
  file: File;
  url: string; // Base64 string for immediate UI display
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  // Profile Data
  age: number | null = null;
  city = '';
  bio = '';

  // Gallery Management
  photos: any[] = []; // Existing photos from Backend
  newGalleryPreviews: PhotoPreview[] = []; // Local previews for new uploads

  private api = 'http://localhost:5000/api/profile';
  private apiBase = 'http://localhost:5000';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  // ==========================================
  // 1. LOAD PROFILE (Existing Data)
  // ==========================================
  loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get<any>(`${this.api}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.age = res.userProfile?.age ?? null;
        this.city = res.userProfile?.city ?? '';
        this.bio = res.userProfile?.bio ?? '';

        // Map existing photos with full URL
        this.photos = (res.photos ?? []).map((p: any) => ({
          ...p,
          url: this.apiBase + p.url
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn("Profile not found or first-time user", err);
      }
    });
  }

  // ==========================================
  // 2. IMAGE SELECTION (Immediate UI Preview)
  // ==========================================
  onGalleryChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // Validate max 6 images total (Existing + Local Previews)
    if (files.length + this.photos.length + this.newGalleryPreviews.length > 6) {
      alert('Maximum 6 images allowed total');
      return;
    }

    // Process each file for local preview
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newGalleryPreviews.push({
          file: file,
          url: e.target.result // This is the Base64 URL that shows in <img> instantly
        });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    input.value = ''; // Reset input so same file can be picked again
  }

  // Remove a local preview before it's saved to DB
  removeLocalPreview(index: number) {
    this.newGalleryPreviews.splice(index, 1);
  }

  // ==========================================
  // 3. SAVE PROFILE (Atomic Save)
  // ==========================================
 saveProfile() {
  const formData = new FormData();
  formData.append('Age', this.age ? this.age.toString() : '0');
  formData.append('City', this.city);
  formData.append('Bio', this.bio);

  // Check if we have new local previews to upload
  if (this.newGalleryPreviews.length > 0) {
    
    // Determine if we need to set a Main Image 
    // (If user already has photos, we don't force the first new one to be main)
    const hasMainInDb = this.photos.some(p => p.isMain);

    if (!hasMainInDb) {
      // First preview becomes the Main 'Image'
      formData.append('Image', this.newGalleryPreviews[0].file);
      
      // The rest go into the 'Images' list
      for (let i = 1; i < this.newGalleryPreviews.length; i++) {
        formData.append('Images', this.newGalleryPreviews[i].file);
      }
    } else {
      // User already has a main photo, put all new ones in the 'Images' list
      this.newGalleryPreviews.forEach(p => {
        formData.append('Images', p.file);
      });
    }
  }

  this.http.post(this.api, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).subscribe({
    next: () => {
      this.newGalleryPreviews = []; // Clear previews
      this.router.navigate(['/dashboard']);
    },
    error: (err) => alert("Error: " + err.error)
  });
}
  // ==========================
  // 4. PHOTO ACTIONS (DB)
  // ==========================
  setMainPhoto(photoId: number) {
    this.http.put(`${this.api}/images/${photoId}/set-main`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(() => this.loadProfile());
  }

  deletePhoto(photoId: number) {
    if (!confirm('Delete this photo?')) return;
    this.http.delete(`${this.api}/images/${photoId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(() => this.loadProfile());
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(email: string, password: string) {
    return firstValueFrom(
      this.http.post<{ user: UserProfile }>('/api/v1/auth/login', {
        email,
        password,
      })
    );
  }

  logout() {
    return firstValueFrom(
      this.http.post<{ success: boolean }>('/api/v1/auth/logout', {})
    );
  }

  me() {
    return firstValueFrom(this.http.get<UserProfile>('/api/v1/auth/me'));
  }
}

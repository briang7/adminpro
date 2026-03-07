import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLayoutComponent } from '../../components/layout/app-layout.component';
import { RouteMeta } from '@analogjs/router';
import { authGuard } from '../../guards/auth.guard';
import { firstValueFrom } from 'rxjs';

export const routeMeta: RouteMeta = {
  canActivate: [authGuard],
};

interface Role {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  createdAt: string;
  lastLogin: string | null;
}

@Component({
  standalone: true,
  imports: [AppLayoutComponent, FormsModule],
  template: `
    <app-layout>
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="flex items-center gap-4">
          <button
            (click)="goBack()"
            class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            &larr; Back
          </button>
          <h1 class="text-2xl font-bold">Edit User</h1>
        </div>

        @if (loading()) {
          <div class="text-slate-400">Loading...</div>
        } @else if (user()) {
          <form (ngSubmit)="saveUser()" class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                [(ngModel)]="form.name" name="name" required
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                [(ngModel)]="form.email" name="email" type="email" required
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select
                [(ngModel)]="form.roleId" name="roleId"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option [ngValue]="null">No role</option>
                @for (role of roles(); track role.id) {
                  <option [ngValue]="role.id">{{ role.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">New Password (leave blank to keep current)</label>
              <input
                [(ngModel)]="form.password" name="password" type="password"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password..."
              />
            </div>

            <div class="text-sm text-slate-500 space-y-1">
              <p>Created: {{ user()!.createdAt | date }}</p>
              <p>Last Login: {{ user()!.lastLogin ? (user()!.lastLogin | date) : 'Never' }}</p>
            </div>

            @if (error()) {
              <p class="text-red-400 text-sm">{{ error() }}</p>
            }
            @if (success()) {
              <p class="text-green-400 text-sm">User updated successfully</p>
            }

            <div class="flex gap-3 pt-2">
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                (click)="goBack()"
                class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        } @else {
          <div class="text-red-400">User not found</div>
        }
      </div>
    </app-layout>
  `,
})
export default class UserEditPage implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  user = signal<UserData | null>(null);
  roles = signal<Role[]>([]);
  error = signal('');
  success = signal(false);

  form = { name: '', email: '', roleId: null as number | null, password: '' };

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    await Promise.all([this.loadUser(Number(id)), this.loadRoles()]);
    this.loading.set(false);
  }

  async loadUser(id: number): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ rows: UserData[] }>(`/api/v1/users?page=1&pageSize=1&search=`)
      );
      // Fetch user list and find by id; or we could add a single-user route
      // For simplicity, get all users and filter
      const allRes = await firstValueFrom(
        this.http.get<{ rows: UserData[] }>(`/api/v1/users?page=1&pageSize=200`)
      );
      const found = allRes.rows.find((u) => u.id === id);
      if (found) {
        this.user.set(found);
        this.form.name = found.name;
        this.form.email = found.email;
        this.form.roleId = found.roleId;
        this.form.password = '';
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    }
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.http.get<Role[]>('/api/v1/roles'));
      this.roles.set(roles);
    } catch (e) {
      console.error('Failed to load roles:', e);
    }
  }

  async saveUser(): Promise<void> {
    this.error.set('');
    this.success.set(false);
    const id = this.user()?.id;
    if (!id) return;

    const body: Record<string, any> = {
      name: this.form.name,
      email: this.form.email,
      roleId: this.form.roleId,
    };
    if (this.form.password) {
      body['password'] = this.form.password;
    }

    try {
      await firstValueFrom(this.http.put(`/api/v1/users/${id}`, body));
      this.success.set(true);
      this.form.password = '';
    } catch (err: any) {
      this.error.set(err?.error?.statusMessage || 'Failed to update user');
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}

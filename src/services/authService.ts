import { supabase } from '../lib/supabaseClient';
import { User, UserRole, LoginCredentials, CreateUserData } from '../types/user';

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<User> {
    // This assumes you have a 'users' table with a password column
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .eq('isActive', true)
      .single();

    if (error || !data) {
      throw new Error('Invalid username or password');
    }

    // TODO: verify password hash if stored securely
    this.currentUser = data as User;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  }

  async createUser(userData: CreateUserData, createdBy: string): Promise<User> {
    // Duplicate check
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${userData.username},email.eq.${userData.email}`);

    if (fetchError) throw fetchError;
    if (existing && existing.length > 0) {
      throw new Error('Username or email already exists');
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          department: userData.department,
          roleId: userData.roleId,
          createdBy,
          isActive: true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ isActive: false })
      .eq('id', userId);

    if (error) throw error;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('isActive', true);

    if (error) throw error;
    return data as User[];
  }

  async getAllRoles(): Promise<UserRole[]> {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) throw error;
    return data as UserRole[];
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    return user.permissions?.some(p => p.resource === resource && p.action === action) ?? false;
  }

  canManageUsers(user: User): boolean {
    return this.hasPermission(user, 'users', 'write');
  }
}

export const authService = new AuthService();

import { User, UserRole, Permission, LoginCredentials, CreateUserData } from '../types/user';

// Mock data for demonstration
const mockPermissions: Permission[] = [
  { id: 'p1', name: 'View Dashboard', description: 'Access to main dashboard', resource: 'dashboard', action: 'read' },
  { id: 'p2', name: 'Manage Incidents', description: 'Create and update incidents', resource: 'incidents', action: 'write' },
  { id: 'p3', name: 'View Reports', description: 'Access to security reports', resource: 'reports', action: 'read' },
  { id: 'p4', name: 'Manage Users', description: 'Create and manage user accounts', resource: 'users', action: 'write' },
  { id: 'p5', name: 'System Configuration', description: 'Configure system settings', resource: 'system', action: 'write' },
  { id: 'p6', name: 'Block IPs', description: 'Block and unblock IP addresses', resource: 'network', action: 'execute' },
  { id: 'p7', name: 'View Alerts', description: 'View security alerts', resource: 'alerts', action: 'read' },
  { id: 'p8', name: 'Acknowledge Alerts', description: 'Acknowledge and resolve alerts', resource: 'alerts', action: 'write' }
];

const mockRoles: UserRole[] = [
  {
    id: 'r1',
    name: 'Security Administrator',
    description: 'Full system access and user management',
    level: 1,
    permissions: mockPermissions
  },
  {
    id: 'r2',
    name: 'Security Manager',
    description: 'Manage incidents and view reports',
    level: 2,
    permissions: mockPermissions.filter(p => !['p4', 'p5'].includes(p.id))
  },
  {
    id: 'r3',
    name: 'Security Analyst',
    description: 'Analyze threats and manage alerts',
    level: 3,
    permissions: mockPermissions.filter(p => ['p1', 'p2', 'p3', 'p6', 'p7', 'p8'].includes(p.id))
  },
  {
    id: 'r4',
    name: 'Security Viewer',
    description: 'Read-only access to security data',
    level: 4,
    permissions: mockPermissions.filter(p => ['p1', 'p3', 'p7'].includes(p.id))
  }
];

const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@company.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: mockRoles[0],
    department: 'IT Security',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    permissions: mockRoles[0].permissions
  },
  {
    id: 'u2',
    username: 'manager',
    email: 'manager@company.com',
    firstName: 'Security',
    lastName: 'Manager',
    role: mockRoles[1],
    department: 'IT Security',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    createdBy: 'u1',
    permissions: mockRoles[1].permissions
  },
  {
    id: 'u3',
    username: 'analyst',
    email: 'analyst@company.com',
    firstName: 'Security',
    lastName: 'Analyst',
    role: mockRoles[2],
    department: 'SOC',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    createdBy: 'u1',
    permissions: mockRoles[2].permissions
  }
];

class AuthService {
  private users: User[] = [...mockUsers];
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.users.find(u => 
      u.username === credentials.username && 
      u.isActive
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // In a real app, you would verify the password hash
    // For demo, accept any password for existing users
    user.lastLogin = new Date();
    this.currentUser = user;
    
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if username already exists
    if (this.users.some(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (this.users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const role = mockRoles.find(r => r.id === userData.roleId);
    if (!role) {
      throw new Error('Invalid role selected');
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role,
      department: userData.department,
      isActive: true,
      createdAt: new Date(),
      createdBy,
      permissions: role.permissions
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // If role is being updated, update permissions too
    if (updates.role) {
      updates.permissions = updates.role.permissions;
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(userId: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Don't actually delete, just deactivate
    this.users[userIndex].isActive = false;
  }

  getAllUsers(): User[] {
    return this.users.filter(u => u.isActive);
  }

  getAllRoles(): UserRole[] {
    return mockRoles;
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    return user.permissions.some(p => p.resource === resource && p.action === action);
  }

  canManageUsers(user: User): boolean {
    return this.hasPermission(user, 'users', 'write');
  }
}

export const authService = new AuthService();
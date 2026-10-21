export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  creditsBalance: number;
  avatarUrl?: string;
  createdAtUtc: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

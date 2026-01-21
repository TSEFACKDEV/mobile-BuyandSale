// Types pour l'authentification et les utilisateurs

// 🎫 TOKENS
export interface Token {
  type: 'Bearer';
  AccessToken: string;
}

// 👥 RÔLES ET PERMISSIONS
export interface Permission {
  id: string;
  permissionKey: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  assignedAt: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermission[];
}

export interface UserRole {
  id: string;
  roleId: string;
  userId: string;
  assignedAt: string;
  assignedBy?: string;
  role: Role;
}

// 👤 UTILISATEUR COMPLET (après connexion)
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  isVerified: boolean;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  avatar?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  lastConnexion?: string;
  token?: Token; // Optionnel pour les utilisateurs dans l'admin
  roles: UserRole[];
  permissions?: Permission[];
  permissionKeys?: string[];
  _count?: {
    products: number;
    reviewsReceived?: number;
  };
  // Pour les vendeurs publics (enrichi par le backend)
  reviewsReceived?: Array<{ rating: number }>;
  products?: Array<{
    id: string;
    name: string;
    images: string[];
    price: number;
  }>;
}

export interface UserLoginForm {
  identifiant: string; // Email ou téléphone
  password: string;
}

export interface OtpVerificationForm {
  otp: string;
  userId: string;
}

export interface UserRegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
  method?: 'SMS' | 'EMAIL';
  contact?: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  newPassword: string;
}

export interface ProfileResponse {
  user: AuthUser;
}

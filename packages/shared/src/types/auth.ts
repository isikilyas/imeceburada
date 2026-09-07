import { UserRole } from "./enums";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface RegisterCandidateInput {
  email: string;
  password: string;
  fullName: string;
  city: string;
  district?: string;
  phone: string;
}

export interface RegisterCompanyInput {
  email: string;
  password: string;
  companyName: string;
  sector?: string;
  city: string;
  district?: string;
  phone: string;
}

export interface RegisterSupplierInput {
  email: string;
  password: string;
  companyName: string;
  city: string;
  district?: string;
  supplyCategories?: string[];
  phone: string;
}

export interface RegisterSubcontractorInput {
  email: string;
  password: string;
  companyName: string;
  city: string;
  district?: string;
  tradeCategories: string[];
  description?: string;
  phone: string;
}

export interface LoginInput {
  /** E-posta ya da telefon numarası olabilir. */
  identifier: string;
  password: string;
}

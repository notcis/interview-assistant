export enum ProviderName {
  google = "google",
  github = "github",
  credentials = "credentials",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string | null;
  createdAt: Date;
  resetPasswordToken: string | null;
  resetPasswordExpire: Date | null;
}

export interface ProfilePicture {
  id: string;
  urlId: string | null;
  url: string | null;
  userId: string;
}

export interface AuthProvider {
  provider: ProviderName;
  providerId: string;
  userId: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  created: Date;
  status: string;
  startDate: Date;
  currentPeriodEnd: Date;
  nextPaymentAttempt: Date;
  userId: string;
}

export interface UserWithDetails extends User {
  ProfilePicture: { urlId: string | null; url: string | null };
  authProvider: { provider: ProviderName; providerId: string }[];
}

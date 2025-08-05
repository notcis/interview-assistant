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
}

export interface ProfilePicture {
  id: string;
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
  customer: string;
  created: Date;
  status: string;
  startDate: Date;
  currentPeriodEnd: Date;
  nextPaymentAttempt: Date;
  userId: string;
}

export interface UserWithDetails extends User {
  image?: string;
  ProfilePicture: { id: string; url: string | null };
  authProvider: { provider: ProviderName; providerId: string };
}

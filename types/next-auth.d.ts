import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      authProvider: { provider: ProviderName; providerId: string }[];
      ProfilePicture: { urlId: string | null; url: string | null };
    } & DefaultSession["user"];
  }
}

declare module "nodemailer";

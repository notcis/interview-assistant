import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      authProvider: { provider: ProviderName; providerId: string }[];
    } & DefaultSession["user"];
  }
}

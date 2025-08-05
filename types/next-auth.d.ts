/* import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      ProfilePicture: {
        id: string;
        url: string | null;
      };
      authProvider: {
        provider: string;
        providerId: string;
      };
    } & DefaultSession["user"];
  }
} */

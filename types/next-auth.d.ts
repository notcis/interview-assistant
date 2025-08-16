import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: UserWithDetails & DefaultSession["user"];
  }
}

declare module "nodemailer";

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      role: string;
      subscribed: string;
      profilepicture: string;
    } & DefaultSession["user"];
  }
}

declare module "nodemailer";

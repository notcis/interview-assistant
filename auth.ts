import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.user = user;
      }

      return token;
    },
    async session({ session, token }: any) {
      session.user = token.user;
      delete session.user.password; // Remove password from session
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
          include: { ProfilePicture: true, authProvider: true },
        });
        if (!user) return null;

        const isValid = bcrypt.compareSync(
          credentials?.password as string,
          user.password!
        );
        if (!isValid) return null;

        return user;
      },
    }),
  ],
});

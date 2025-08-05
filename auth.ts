import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  callbacks: {
    signIn: async ({ user, account, profile }: any) => {
      if (account.provider === "credentials") {
        user.id = user.id;
      } else {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user?.email,
              name: user?.name,
              ProfilePicture: {
                create: {
                  url: profile?.image || user?.image,
                },
              },
              authProvider: {
                create: [
                  {
                    provider: account?.provider,
                    providerId: account?.providerAccountId || profile?.id,
                  },
                ],
              },
            },
          });
          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }
      }

      return true; // Allow sign-in
    },
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
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
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

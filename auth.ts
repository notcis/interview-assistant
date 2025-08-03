import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
        });
        if (!user) return null;

        const isValid = bcrypt.compareSync(
          credentials?.password as string,
          user.password!
        );
        if (!isValid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
});

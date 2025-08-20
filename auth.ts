import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    signIn: async ({ user, account, profile }: any) => {
      // If the user is signing in with credentials, we need to ensure they exist
      if (account.provider === "credentials") {
        user.id = user.id;
      }
      // For OAuth providers, we check if the user already exists
      else {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            ProfilePicture: true,
            authProvider: true,
            Subscription: true,
          },
        });

        // If the user does not exist, create a new user
        if (!existingUser) {
          // Create a new user with the provided profile information
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
        }
        // If the user exists, we check if the provider is already linked
        else {
          // Check if the provider is already linked
          const existingProvider = existingUser.authProvider.find(
            (provider: any) => provider.provider === account.provider
          );

          // If the provider is not linked, we link it
          if (!existingProvider) {
            // Create a new authProvider entry for the existing user
            await prisma.authProvider.create({
              data: {
                provider: account.provider,
                providerId: account.providerAccountId || profile?.id,
                userId: existingUser.id,
              },
            });

            // If the profile picture is not set, we create one
            if (!existingUser.ProfilePicture?.url) {
              // Create a new profile picture for the existing user
              await prisma.profilePicture.create({
                data: {
                  url: profile?.image || user?.image,
                  userId: existingUser.id,
                },
              });
            }
          }

          user.id = existingUser.id;
        }
      }

      // Return true to indicate successful sign-in
      return true;
    },
    async jwt({ token, user, trigger, session }: any) {
      // If the user is signing in for the first time, we add the user ID to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.subscribed = user.subscribed;
        token.profilepicture = user.profilepicture;
      }
      // If the user is already signed in, we fetch the user from the database
      else {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          include: {
            ProfilePicture: true,
            authProvider: true,
            Subscription: true,
          },
        });

        // If the user exists in the database, we add it to the token
        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.subscribed = dbUser.Subscription?.status;
          token.profilepicture = dbUser.ProfilePicture?.url;
        }
      }

      if (trigger === "update") {
        let updatedUser = await prisma.user.findUnique({
          where: { id: token.user.id },
          include: {
            ProfilePicture: true,
            authProvider: true,
            Subscription: true,
          },
        });

        /*   if (session.Subscription) {
          if (updatedUser) {
            updatedUser.Subscription = {
              id: session.Subscription.id as string,
              userId: updatedUser.id as string,
              status: session.Subscription.status as string,
              customerId: updatedUser.Subscription?.customerId ?? "",
              created: updatedUser.Subscription?.created ?? new Date(),
              startDate: updatedUser.Subscription?.startDate ?? new Date(),
              currentPeriodEnd:
                updatedUser.Subscription?.currentPeriodEnd ?? new Date(),
              nextPaymentAttempt:
                updatedUser.Subscription?.nextPaymentAttempt ?? null,
            };
          }
        } */

        token.id = updatedUser?.id;
        token.email = updatedUser?.email;
        token.name = updatedUser?.name;
        token.role = updatedUser?.role;
        token.subscribed = updatedUser?.Subscription?.status;
        token.profilepicture = updatedUser?.ProfilePicture?.url;
      }

      return token;
    },
    async session({ session, token }: any) {
      // If the token has a user, we add it to the session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.subscribed = token.subscribed;
        session.user.profilepicture = token.profilepicture;
      }

      return session;
    },
  },

  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        // Check if the user exists in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
          include: {
            ProfilePicture: true,
            authProvider: true,
            Subscription: true,
          },
        });

        // If the user does not exist or the password is incorrect, return null
        if (!user) return null;

        // Compare the provided password with the stored hashed password
        const isValid = bcrypt.compareSync(
          credentials?.password as string,
          user.password!
        );

        // If the password is incorrect, return null
        if (!isValid) return null;

        // If the user exists and the password is correct, return the user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscribed: user.Subscription?.status,
          profilepicture: user.ProfilePicture?.url,
        };
      },
    }),
  ],
});

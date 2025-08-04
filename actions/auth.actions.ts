"use server";

import { prisma } from "@/lib/prisma";
import { ProviderName } from "@/interface";
import { formatError } from "@/utils";
import bcrypt from "bcryptjs";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const hashPassword = bcrypt.hashSync(password, 10);

      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashPassword,
        },
      });

      await tx.authProvider.create({
        data: {
          provider: ProviderName.credentials,
          providerId: newUser.email,
          userId: newUser.id,
        },
      });
    });

    return {
      success: true,
      message: "User registered successfully",
    };
  } catch (error) {
    console.error("Error in register action:", error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

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
    await prisma.user.create({
      data: {
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        authProvider: {
          create: {
            provider: ProviderName.credentials,
            providerId: email,
          },
        },
      },
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

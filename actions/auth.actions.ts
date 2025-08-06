"use server";

import { prisma } from "@/lib/prisma";
import { ProviderName } from "@/interface";
import { formatError } from "@/utils";
import bcrypt from "bcryptjs";
import { delete_file, upload_file } from "@/utils/cloudinary";
import { auth } from "@/auth";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  //await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay for demonstration purposes

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
      message:
        formatError(error) === "User_email_key already exists"
          ? "Email already exists"
          : formatError(error),
    };
  }
};

export const updateProfile = async ({
  name,
  avatar,
}: {
  name: string;
  avatar?: string;
}) => {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const resUpload = {
      id: "",
      url: "",
    };

    if (avatar) {
      const { id: avatarId, url: avatarUrl } = await upload_file(
        avatar,
        "assistants/avatars"
      );
      resUpload.id = avatarId;
      resUpload.url = avatarUrl;
    }

    const oldAvatar = await prisma.profilePicture.findUnique({
      where: { userId: session.user.id },
      select: { urlId: true },
    });

    if (oldAvatar?.urlId) {
      await delete_file(oldAvatar.urlId);
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ProfilePicture: {
          upsert: {
            create: { url: resUpload.url, urlId: resUpload.id },
            update: { url: resUpload.url, urlId: resUpload.id },
          },
        },
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error in update profile action:", error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

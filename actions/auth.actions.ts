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
    // Get the current session
    const session = await auth();

    // Check if the user is authenticated
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // If an avatar is provided, upload it and update the user's profile picture
    if (avatar) {
      // Upload the avatar image to cloud storage
      const { id: avatarId, url: avatarUrl } = await upload_file(
        avatar,
        "assistants/avatars"
      );

      // If the user already has an avatar, delete the old one
      const oldAvatar = await prisma.profilePicture.findUnique({
        where: { userId: session.user.id },
        select: { urlId: true },
      });

      // If an old avatar exists, delete it from cloud storage
      if (oldAvatar?.urlId) {
        await delete_file(oldAvatar.urlId);
      }

      // Upsert the profile picture with the new avatar URL and ID
      await prisma.profilePicture.upsert({
        where: { userId: session.user.id },
        update: { url: avatarUrl, urlId: avatarId },
        create: {
          url: avatarUrl,
          urlId: avatarId,
          userId: session.user.id,
        },
      });
    }

    // Update the user's name in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
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

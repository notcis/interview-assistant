"use server";

import { prisma } from "@/lib/prisma";
import { ProviderName } from "@/interface";
import { formatError, getResetPasswordToken } from "@/utils";
import bcrypt from "bcryptjs";
import { delete_file, upload_file } from "@/utils/cloudinary";
import { auth } from "@/auth";
import {
  ForgotUserPasswordSchema,
  RegisterUserSchema,
  ResetUserPasswordSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema,
} from "@/utils/validations";
import { resetPasswordHTMLTemplate } from "@/utils/emailTemplate";
import sendEmail from "@/utils/sendEmail";
import crypto from "crypto";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  //await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay for demonstration purposes

  try {
    // Validate the input data using the RegisterUserSchema
    const parsedData = RegisterUserSchema.parse({ name, email, password });

    await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: bcrypt.hashSync(parsedData.password, 10),
        authProvider: {
          create: {
            provider: ProviderName.credentials,
            providerId: parsedData.email, // Using email as providerId for credentials
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

    // Validate the input data using the UpdateProfileSchema
    const parsedData = UpdateProfileSchema.parse({ name, avatar });

    // If an avatar is provided, upload it and update the user's profile picture
    if (parsedData.avatar) {
      // Upload the avatar image to cloud storage
      const { id: avatarId, url: avatarUrl } = await upload_file(
        parsedData.avatar,
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
        name: parsedData.name,
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

export const updateUserPassword = async ({
  newPassword,
  confirmPassword,
}: {
  newPassword: string;
  confirmPassword: string;
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

    // Validate the new password and confirm password
    const parsedData = UpdatePasswordSchema.parse({
      newPassword,
      confirmPassword,
    });

    // Check if the user has a credentials auth provider
    if (
      !session?.user?.authProvider.some(
        (provider: { provider: string }) =>
          provider.provider === ProviderName.credentials
      )
    ) {
      await prisma.authProvider.create({
        data: {
          provider: ProviderName.credentials,
          providerId: session.user.email!, // Using email as providerId for credentials
          userId: session.user.id,
        },
      });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(parsedData.newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error in update password action:", error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export const forgotUserPassword = async (email: string) => {
  try {
    // Validate the email using the ForgotUserPasswordSchema
    const parsedData = ForgotUserPasswordSchema.parse({ email });

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: parsedData.email },
    });

    // If the user does not exist, return an error
    if (!user?.id) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Generate a reset password token and expiration date
    const { resetToken, resetPasswordToken, resetPasswordExpire } =
      getResetPasswordToken();

    // Update the user's reset password token and expiration date in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpire: new Date(resetPasswordExpire),
      },
    });

    // Create the reset password URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/password/reset/${resetToken}`;
    // Create the reset password email message using the resetPasswordHTMLTemplate
    const message = resetPasswordHTMLTemplate(user.name, resetUrl);

    try {
      // Send the reset password email
      await sendEmail({
        email: user.email,
        subject: "Assistant Chat Password Reset Request",
        message,
      });
    } catch (error) {
      console.error("Error sending reset password email:", error);
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpire: null,
        },
      });

      return {
        success: false,
        message: "Failed to send reset password email",
      };
    }

    return {
      success: true,
      message: "Password reset email sent",
    };
  } catch (error) {
    console.error("Error in forgot password action:", error);

    return {
      success: false,
      message: formatError(error),
    };
  }
};

export const resetUserPassword = async (
  token: string,
  password: string,
  confirmPassword: string
) => {
  try {
    // Validate the input using the ResetUserPasswordSchema
    const parsedData = ResetUserPasswordSchema.parse({
      token,
      password,
      confirmPassword,
    });

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(parsedData.token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpire: {
          gte: new Date(), // Check if the token is not expired
        },
      },
    });

    // If the user does not exist or the token is invalid, return an error
    if (!user?.id) {
      return {
        success: false,
        message: "Invalid or expired reset password token",
      };
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(parsedData.password, 10);

    // Update the user's password and clear the reset token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Error in reset password action:", error);
    return {
      success: false,
      message: formatError(error),
    };
  }
};

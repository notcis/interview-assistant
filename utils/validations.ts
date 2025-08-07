import z from "zod";

export const RegisterUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  avatar: z.string().optional(),
});

export const UpdatePasswordSchema = z
  .object({
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
      });
    }
  });

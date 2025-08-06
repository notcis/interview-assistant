"use client";

import React, { useState } from "react";
import { Button, Input, Form, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";
import { useGenericSubmitHandler } from "../form/genericSubmitHandler";
import { UserWithDetails } from "@/interface";
import { updateProfile } from "@/actions/auth.actions";
import toast from "react-hot-toast";

export default function UpdateProfile() {
  const { data: session, status } = useSession() as {
    data: { user: UserWithDetails } | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  const [avatar, setAvatar] = useState("");

  const { handleSubmit, loading } = useGenericSubmitHandler(async (data) => {
    const bodyData = {
      name: data.name as string,
      avatar,
    };

    const res = await updateProfile(bodyData);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
  });

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = Array.from(e.target.files || []);
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result as string);
      }
    };

    reader.readAsDataURL(file[0]);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <h1 className="text-large font-medium">Update Profile</h1>
          <p className="text-small text-default-500">
            Enter details to update profile
          </p>
        </div>

        <Form
          className="flex flex-col gap-5"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <Input
            isRequired
            label="Name"
            name="name"
            placeholder="Enter your name"
            type="text"
            variant="bordered"
            defaultValue={session?.user?.name || ""}
          />

          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            isDisabled
            defaultValue={session?.user?.email || ""}
          />

          <div className="flex gap-1 items-center">
            <Avatar showFallback src={avatar} size="lg" radius="sm" />
            <Input
              label="Avatar"
              name="avatar"
              type="file"
              variant="bordered"
              onChange={onChange}
            />
          </div>

          <Button
            className="w-full"
            color="primary"
            type="submit"
            endContent={<Icon icon="akar-icons:arrow-right" />}
            isLoading={loading}
            isDisabled={loading}
          >
            Update
          </Button>
        </Form>
      </div>
    </div>
  );
}

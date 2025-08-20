"use client";

import React, { useTransition } from "react";

import { Button, Input, Radio, RadioGroup } from "@heroui/react";
import { Logo } from "@/config/logo";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cancelSubscription } from "@/actions/payment.action";
import toast from "react-hot-toast";

const Unsubscribe = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { data: session, status, update } = useSession();

  const handleUnsubscribe = async () => {
    startTransition(async () => {
      const res = await cancelSubscription(session?.user?.email || "");
      if (!res.success) {
        toast.error(res.message || "Failed to unsubscribe");
        return;
      }
      if (!res.subscription) {
        toast.error("Failed to unsubscribe");
        return;
      }

      await update();
      toast.success("Subscription updated successfully!");
      router.push("/");

      /*    const updateSession = await update({
        Subscription: {
          id: res.subscription.id!,
          status: res.subscription.status,
        },
      });

      if (updateSession) {
        toast.success("Subscription updated successfully!");
        router.push("/");
      } */
    });
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <Logo />
          <p className="text-xl font-medium">Unsubscribe</p>
          <p className="text-small text-default-500">
            Unsubscribe from your current plan
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <RadioGroup isDisabled label="Your Plan" defaultValue={"9.99"}>
            <Radio value="9.99">฿99.00 per month</Radio>
          </RadioGroup>

          <Input
            type="email"
            label="Email Address"
            placeholder="Email"
            variant="bordered"
            value={session?.user?.email || ""}
            isDisabled
          />

          {status === "authenticated" && (
            <Button
              className="w-full"
              color="danger"
              type="submit"
              startContent={
                <Icon icon="solar:card-recive-bold" fontSize={19} />
              }
              onPress={handleUnsubscribe}
              isLoading={isPending}
              isDisabled={isPending}
            >
              UnSubscribe
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;

"use client";

import React, { useEffect, useState, useTransition } from "react";

import { Button, Card, Input, Radio, RadioGroup } from "@heroui/react";
import { Logo } from "@/config/logo";
import { Icon } from "@iconify/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createNewSubscription } from "@/actions/payment.action";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const Subscribe = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

const CheckoutForm = () => {
  const { data: session, update } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (session?.user.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    startTransition(async () => {
      const cardElement = elements.getElement(CardElement);
      try {
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement!,
          billing_details: {
            email,
          },
        });

        if (error) {
          setError(error.message || "An unknown error occurred");
          return;
        }

        const res = await createNewSubscription(email, paymentMethod.id);

        if (!res.success) {
          setError(res.message || "Failed to create subscription");
          return;
        }

        if (!res.subscription) {
          setError("Failed to create subscription");
          return;
        }

        await update();
        toast.success("Subscription created successfully!");
        router.push("/app/dashboard");

        /*   const updateSession = await update({
          Subscription: {
            id: res.subscription.id,
            status: res.subscription.status,
          },
        });

        if (updateSession) {
          toast.success("Subscription created successfully!");
          router.push("/app/dashboard");
        } */

        // Handle successful subscription creation
      } catch (error: any) {
        setError(error.message || "An unknown error occurred");
      }
    });
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <Logo />
          <p className="text-xl font-medium">Subscribe</p>
          <p className="text-small text-default-500">
            Enter your email and card details to subscribe
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <RadioGroup isDisabled label="Your Plan" defaultValue={"99.00"}>
            <Radio value="99.00">99.00 บาทต่อเดือน</Radio>
          </RadioGroup>

          <Input
            type="email"
            label="Email Address"
            placeholder="Email"
            variant="bordered"
            value={email}
            isDisabled
          />
          <div className="my-4">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          <Button
            className="w-full"
            color="primary"
            type="submit"
            startContent={<Icon icon="solar:card-send-bold" fontSize={19} />}
            isDisabled={!stripe || isPending}
          >
            {isPending ? "Processing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Subscribe;

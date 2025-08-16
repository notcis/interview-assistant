"use server";

import { prisma } from "@/lib/prisma";
import stripe from "@/utils/Stripe";

export const createNewSubscription = async (
  email: string,
  paymentMethodId: string
) => {
  // Implementation for creating a subscription
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const customer = await stripe.customers.create({
    email,
    payment_method: paymentMethodId,
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  if (!customer) {
    return {
      success: false,
      message: "Failed to create customer",
    };
  }

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: process.env.STRIPE_PRICE_ID!, // Replace with your actual price ID
      },
    ],
    expand: ["latest_invoice.payment_intent"],
  });

  if (!subscription) {
    return {
      success: false,
      message: "Failed to create subscription",
    };
  }
  // Save subscription details to the database
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      id: subscription.id,
      customerId: customer.id,
      status: "active",
      created: new Date(subscription.created * 1000),
      startDate: new Date(subscription.start_date * 1000),
      currentPeriodEnd: (() => {
        const start = new Date(subscription.start_date * 1000);
        start.setMonth(start.getMonth() + 1);
        return start;
      })(),
    },
    create: {
      id: subscription.id,
      userId: user.id,
      customerId: customer.id,
      status: "active",
      created: new Date(subscription.created * 1000),
      startDate: new Date(subscription.start_date * 1000),
      currentPeriodEnd: (() => {
        const start = new Date(subscription.start_date * 1000);
        start.setMonth(start.getMonth() + 1);
        return start;
      })(),
    },
  });

  return {
    success: true,
    subscription,
  };
};

export const cancelSubscription = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      Subscription: true,
    },
  });

  if (!user || !user.Subscription?.id) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const subscription = await stripe.subscriptions.cancel(user.Subscription.id);

  if (!subscription) {
    return {
      success: false,
      message: "Failed to cancel subscription",
    };
  }

  return {
    success: true,
    subscription,
  };
};

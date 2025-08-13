"use server";

import stripe from "@/utils/Stripe";

export const createNewSubscription = async (
  email: string,
  paymentMethodId: string
) => {
  // Implementation for creating a subscription

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

  return {
    success: true,
    subscription,
  };
};

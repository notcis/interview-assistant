import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import stripe from "@/utils/Stripe";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headersList = await headers();
  const stripeSignature = headersList.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature!,
      process.env.STRIPE_WEBHOOK_KEY!
    );
  } catch (error) {
    console.log(error);
  }

  if (!event) {
    return new Response("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "invoice.payment_succeeded":
      /*      const invoice = event.data.object;
      const email = invoice.customer_email;
      const customer = await stripe.customers.retrieve(
        invoice.customer as string
      );

      const user = await prisma.user.findUnique({
        where: { email: email as string },
      });

      if (!user) {
        return new Response("User not found", { status: 404 });
      }
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          id: invoice.id,
          userId: user.id,
          customerId: customer.id,
          status: "active",
          created: new Date(invoice.created * 1000),
          startDate: new Date(invoice.lines.data[0].period.start * 1000),
          currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
        },
        create: {
          id: invoice.id,
          userId: user.id,
          customerId: customer.id,
          status: "active",
          created: new Date(invoice.created * 1000),
          startDate: new Date(invoice.lines.data[0].period.start * 1000),
          currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
        },
      }); */

      break;
    case "invoice.payment_failed":
      /*     const paymentFailed = event.data.object;

      const nextpaymentAttempt = paymentFailed.next_payment_attempt;
      await prisma.subscription.update({
        where: { id: paymentFailed.id as string },
        data: {
          status: "past_due",
          nextPaymentAttempt: nextpaymentAttempt
            ? new Date(nextpaymentAttempt * 1000)
            : null,
        },
      }); */
      break;
    case "customer.subscription.deleted":
      const subscriptionDelete = event.data.object;
      await prisma.subscription.update({
        where: { id: subscriptionDelete.id },
        data: { status: "canceled", nextPaymentAttempt: null },
      });
      break;

    default:
      return new Response("Unhandled event type", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}

import { db } from "@/app/lib/firebase";
import resend from "@/app/lib/resend";
import "server-only";

import Stripe from "stripe";

export async function handleStripeSubscription(
  event: Stripe.CheckoutSessionCompletedEvent
) {
  if (event.data.object.payment_status === "paid") {
    console.log("Pagamento realizado com sucesso. Liberar acesso do usuario.");
    const metadata = event.data.object.metadata;
    const userEmail =
      event.data.object.customer_email ||
      event.data.object.customer_details?.email;
    const userId = metadata?.userId;

    if (!userId) {
      console.error("User ID or email not found");
      return;
    }

    await db.collection("users").doc(userId).update({
      stripeSubscriptionId: event.data.object.subscription,
      subscriptionStatus: "active",
    });

    const { data, error } = await resend.emails.send({
      from: "Acme <brunoo.gomes11@gmail.com>",
      to: [userEmail ?? ""],
      subject: "Assinatura ativada com sucesso",
      text: "Assinatura ativada com sucesso",
    });

    if (error) {
      console.error(error);
    }

    console.log(data);
  }
}
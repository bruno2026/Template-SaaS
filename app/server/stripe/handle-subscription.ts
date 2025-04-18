import { db } from "@/app/lib/firebase";
import "server-only";

import Stripe from "stripe";

export async function handleStripeSubscription(
    event: Stripe.CheckoutSessionCompletedEvent
) {
    if (event.data.object.payment_status === "paid") {
        console.log("Pagamento realizado com sucesso. Liberar acesso do usuario");
    }

    const metadata = event.data.object.metadata;

    const userId = metadata?.userId;

    if (!userId) {
        console.error("User ID not found in metadata");
        return;
    }

    await db.collection("users").doc(userId).set({
        stripeSubscriptionId: event.data.object.subscription,
        subscriptionStatus: "active",
    }, { merge: true });
}
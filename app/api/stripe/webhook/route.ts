import stripe from "@/app/lib/stripe";
import { handleStripeCancelSubscription } from "@/app/server/stripe/handle-cancel";
import { handleStripePayment } from "@/app/server/stripe/handle-payment";
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


const secret = process.env.STRIPE_WEBHOOK_SECRET;


export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-signature");

        if (!signature || !secret) {
            return NextResponse.json(
                { error: "Missing signature or secret" },
                { status: 400 }
            );
        }

        const event = stripe.webhooks.constructEvent(body, signature, secret);

        switch (event.type) {
            case "checkout.session.completed": //pagamento realizado se status = "paid" - pode ser tanto pagamento unico quanto assinatura
                const metadata = event.data.object.metadata;

                if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
                    await handleStripePayment(event);
                }
                if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
                    await handleStripeSubscription(event);
                }
                break;
            case "checkout.session.expired": //expirou o tempo de pagamento
                console.log("Enviar um email para o usuario informando que o pagamento expirou");
                break;
            case "checkout.session.async_payment_succeeded": // boleto pago
                console.log("Enviar um email para o usuario informando que o pagamento foi confirmado");
                break;
            case "checkout.session.async_payment_failed": // boleto falhou
                console.log("Enviar um email para o usuario informando que o pagamento falhou");
                break;
            case "customer.subscription.created": // assinatura criada
                console.log("Enviar um email com mensagem de boas vindas porque acabou de criar uma assinatura");
                break;

            case "customer.subscription.deleted": // assinatura cancelada
                await handleStripeCancelSubscription(event);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ message: "Webhook received" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { error: "Webhook error" },
            { status: 500 }
        );
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";


export function useStripe() {
    const [stripe, setStripe] = useState<Stripe | null>(null);

    useEffect(() => {
        async function loadStripeAsync() {
            const stripeInstance = await loadStripe(
                process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!
            );
            setStripe(stripeInstance);
        }
        loadStripeAsync();
    }, []);

    async function createPaymentStripeCheckout(checkoutData: any) {
        if (!stripe) {
            throw new Error("Stripe has not been initialized");
        }

        try {
            const response = await fetch("/api/stripe/create-pay-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            })

            const data = await response.json();

            await stripe.redirectToCheckout({ sessionId: data.sessionId || data.id });
        } catch (error) {
            console.error("Error creating Stripe checkout session:", error);
        }
    }

    async function createSubscriptionStripeCheckout(checkoutData: any) {
        if (!stripe) {
            throw new Error("Stripe has not been initialized");
        }

        try {
            const response = await fetch("/api/stripe/create-subscription-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            })

            const data = await response.json();

            await stripe.redirectToCheckout({ sessionId: data.sessionId || data.id });

        } catch (error) {
            console.error("Error creating Stripe checkout session:", error);
        }
    }

    async function handleCreateStripePortal() {
        const response = await fetch("/api/stripe/create-portal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        window.location.href = data.url;

    }

    return {
        createPaymentStripeCheckout,
        createSubscriptionStripeCheckout,
        handleCreateStripePortal,
    };
}
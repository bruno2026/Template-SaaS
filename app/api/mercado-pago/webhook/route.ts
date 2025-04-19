/* eslint-disable @typescript-eslint/no-explicit-any */
import mpClient, { validateMercadoPagoWebhook } from "@/app/lib/mercado-pago";
import { handleMercadoPagoPayment } from "@/app/server/mercado-pago/handle-payment";
import { Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
    try {
        validateMercadoPagoWebhook(req);

        const body = await req.json();
        console.log("Webhook body recebido:", body);

        const { type, data } = body;

        switch (type) {
            case "payment": {
                if (!data?.id) {
                    console.error("Webhook payment sem data.id");
                    break;
                }
                const payment = new Payment(mpClient);
                let paymentData;
                try {
                    paymentData = await payment.get(data.id);
                } catch (err: any) {
                    // Se não encontrar, tenta novamente após 3 segundos
                    if (err?.message?.includes("resource not found")) {
                        console.warn("Pagamento não encontrado, tentando novamente em 2s:", data.id);
                        await sleep(3000);
                        try {
                            paymentData = await payment.get(data.id);
                        } catch (err2) {
                            console.error("Ainda não encontrado:", err2);
                            break;
                        }
                    } else {
                        console.error("Erro ao buscar pagamento:", err);
                        break;
                    }
                }
                if (
                    paymentData &&
                    (paymentData.status === "approved" ||
                        paymentData.date_approved !== null)
                ) {
                    await handleMercadoPagoPayment(paymentData);
                }
                break;
            }
            case "subscription_preapproval":
                break;
            default:
                console.log("Esse evento nao e suportado:", type);
                break;
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}
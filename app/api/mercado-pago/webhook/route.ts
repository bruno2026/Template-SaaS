import mpClient, { validateMercadoPagoWebhook } from "@/app/lib/mercado-pago";
import { handleMercadoPagoPayment } from "@/app/server/mercado-pago/handle-payment";
import { Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

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
                try {
                    const paymentData = await payment.get(data.id);
                    if (
                        paymentData.status === "approved" ||
                        paymentData.date_approved !== null
                    ) {
                        await handleMercadoPagoPayment(paymentData);
                    }
                } catch (err) {
                    console.error("Erro ao buscar pagamento:", err);
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
import mpClient, { validateMercadoPagoWebhook } from "@/app/lib/mercado-pago";
import { handleMercadoPagoPayment } from "@/app/server/mercado-pago/handle-payment";
import { Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    validateMercadoPagoWebhook(req);

    const body = await req.json();

    const { type, data } = body;

    //Webhook
    switch (type) {
      case "payment":
        const payment = new Payment(mpClient);
        const paymentData = await payment.get({ id: data.id });
        if (
          paymentData.status === "approved" ||
          paymentData.date_approved !== null
        ) {
          await handleMercadoPagoPayment(paymentData);
        }
        break;
      case "subscription_preapproval":
        break;

      default:
        console.log("Esse enveto não é suportado");
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
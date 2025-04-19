import mpClient from "@/app/lib/mercado-pago";
import { Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id, userEmail } = await req.json();

  try {
    const preference = new Preference(mpClient);

    const createdPreference = await preference.create({
      body: {
        external_reference: id, //Isso impacta na pontuação do Mercado Pago
        metadata: {
          id,
          userEmail,
        },
        ...(userEmail && { payer_email: userEmail }), // Adiciona o e-mail do usuário se estiver disponível
        items: [
          {
            id,
            title: "Teste",
            description: "Teste",
            quantity: 1,
            currency_id: "BRL",
            unit_price: 1,
            category_id: "Service",
          },
        ],
        // payment_methods: {
        //     installments: 12, //Número de parcelas
        //     excluded_payment_types: [
        //       { id: "bolbradesco" },
        //       { id: "pec" },
        //     ],
        //     excluded_payment_methods: [
        //         {id: "diners"},
        //         {id: "amex"},
        //         {id: "discover"},
        //         {id: "jcb"},
        //         {id: "hipercard"},
        //     ]
        // }
        auto_return: "approved",
        back_urls: {
          success: `${req.headers.get("origin")}/api/mercado-pago/success`,
          failure: `${req.headers.get("origin")}/api/mercado-pago/failure`,
          pending: `${req.headers.get("origin")}/api/mercado-pago/pending`,
        },
      },
    });

    if (!createdPreference) {
      return NextResponse.json(
        { error: "Error creating preference" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        preferenceId: createdPreference.id,
        initPoint: createdPreference.init_point,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error creating preference" },
      { status: 500 }
    );
  }
}
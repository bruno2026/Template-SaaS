import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import mpCliente from "@/app/lib/mercado-pago";

export async function POST(request: NextRequest) {
    const { testeId, userEmail } = await request.json();

    try {
        const preference = new Preference(mpCliente);

        const createPreference = await preference.create({
            body: {
                external_reference: testeId, // Isso impacta na pontuacao do Mercado Pago
                metadata: {
                    testeId, // Essa variavel é convertida para snake_case -> teste_id
                },
                ...(userEmail && { payer: { email: userEmail } }),
                items: [
                    {
                        id: "",
                        title: "",
                        description: "",
                        quantity: 1,
                        currency_id: "BRL",
                        unit_price: 1,
                    },
                ],
                payment_methods: {
                    installments: 12,
                    // excluded_payment_methods: [
                    //     {
                    //         id: "bolbradesco",
                    //     },
                    //     {
                    //         id: "pec",
                    //     }
                    // ],
                    // excluded_payment_types: [
                    //     {
                    //         id: "ticket",
                    //     },
                    //     {
                    //         id: "atm",
                    //     }
                    // ],
                },
                auto_return: "approved",
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/pending`,
                },
            },
        });

        if (!createPreference.id) {
            return NextResponse.json(
                { error: "Erro ao criar checkout com mercado pago" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            preferenceId: createPreference.id,
            initPoint: createPreference.init_point,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao criar checkout com mercado pago" },
            { status: 500 }
        );
    }
}
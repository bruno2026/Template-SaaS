import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import mpCliente from "@/app/lib/mercado-pago";

export async function POST(req: NextRequest) {
    const { testeId, userEmail } = await req.json();

    try {
        const preference = new Preference(mpCliente);

        const createPreference = await preference.create({
            body: {
                external_reference: testeId, // Isso impacta na pontuacao do Mercado Pago
                metadata: {
                    testeId, // Essa variavel é convertida para snake_case -> teste_id
                    userEmail, // Essa variavel é convertida para snake_case -> user_email
                },
                ...(userEmail && { payer: { email: userEmail } }), // tambem importante para pontuacao
                items: [
                    {
                        id: "",
                        description: "",
                        title: "",
                        quantity: 1,
                        unit_price: 1,
                        currency_id: "BRL",
                        category_id: "services",
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
                    success: `${req.headers.get("origin")}/api/mercado-pago/pending`,
                    failure: `${req.headers.get("origin")}/api/mercado-pago/pending`,
                    pending: `${req.headers.get("origin")}/api/mercado-pago/pending`,
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
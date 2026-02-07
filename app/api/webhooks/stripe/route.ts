import { HandleCheckoutSessionCompleted } from "@/lib/stripe/handleCheckoutSessionCompleted";
import { getStripe } from "@/lib/stripe/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature") as string;

    try {
        const stripe = getStripe(); // ← lazy-load happens here
        const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

        if (event.type === "checkout.session.completed") {
            HandleCheckoutSessionCompleted(event.data.object);
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("stripe webhook error", error);
        return new NextResponse("webhook error", { status: 400 });
    }
}

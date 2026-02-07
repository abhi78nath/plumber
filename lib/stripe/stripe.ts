// import Stripe from "stripe";

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: "2026-01-28.clover",
//     typescript: true
// })
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

        stripeInstance = new Stripe(key, {
            apiVersion: "2026-01-28.clover",
            typescript: true
        });
    }
    return stripeInstance;
}

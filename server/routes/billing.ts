// server/routes/billing.ts
// Fix: Use default express import to avoid type conflicts.
import express from "express";
import Stripe from "stripe";

// Lazily initialize Stripe to prevent server crash on startup
let stripe: Stripe | null = null;
const getStripeClient = (): Stripe => {
    if (!stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe secret key is not configured on the server.");
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });
    }
    return stripe;
};


const PRICE_BY_TIER: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  premium: process.env.STRIPE_PRICE_PREMIUM!,
  ultimate: process.env.STRIPE_PRICE_ULT!,
};

export const router = express.Router();

/**
 * POST /api/billing/checkout
 * body: { tierId: 'pro'|'premium'|'ultimate', returnUrl?: string, email?: string }
 */
// Fix: Use explicit express types for req and res.
router.post("/checkout", async (req: express.Request, res: express.Response) => {
  try {
    const { tierId, returnUrl = process.env.APP_BASE_URL, email } = (req.body ?? {}) as {
        tierId?: string; returnUrl?: string; email?: string;
    };

    const price = tierId ? PRICE_BY_TIER[tierId] : undefined;
    if (!price) return res.status(400).json({ ok: false, error: "Invalid tier" });

    // TODO: replace with real authed user email
    const customerEmail = email || "user@example.com";

    const stripeClient = getStripeClient();

    const session = await stripeClient.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${returnUrl}/billing/success?tier=${tierId}`,
      cancel_url: `${returnUrl}/billing/cancel`,
      customer_email: customerEmail,
      metadata: { product: "gnidoc", tierId },
    });

    return res.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("[billing] checkout error:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Checkout failed" });
  }
});

export default router;
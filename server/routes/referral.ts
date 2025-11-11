// Fix: Use default express import to avoid type conflicts.
import express from "express";

export const referral = express.Router();

/**
 * POST /api/referral/send-invite
 * body: { email: string, referralLink: string }
 */
// Fix: Use explicit express types for req and res.
referral.post("/send-invite", async (req: express.Request, res: express.Response) => {
  try {
    const { email, referralLink } = req.body;

    if (!email || !referralLink) {
      return res.status(400).json({ ok: false, error: "Missing email or referral link." });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ ok: false, error: "Invalid email format." });
    }

    // --- In a real application, you would integrate an email service here (e.g., SendGrid, Mailgun) ---
    console.log(`[Referral] SIMULATING sending invite to: ${email}`);
    console.log(`[Referral] Link: ${referralLink}`);
    // --- End simulation ---

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.json({ ok: true, message: `Invite successfully sent to ${email}!` });

  } catch (err: any) {
    console.error("[referral] send-invite error:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Failed to send invite" });
  }
});
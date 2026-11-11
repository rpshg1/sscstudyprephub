export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<{ delivered: boolean; mode: "resend" | "dev_console" | "unconfigured" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || "SSPH Support <support@sscstudyprephub.example>";

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: "Reset your SSCSTUDYPREPHUB (SSPH) password",
        html: `
          <div style="font-family: Arial, sans-serif; color: #172033; line-height: 1.5;">
            <h2 style="color: #101B33;">Reset your SSPH password</h2>
            <p>Hi ${params.name},</p>
            <p>We received a request to reset your SSCSTUDYPREPHUB password. Click the button below within 30 minutes:</p>
            <p style="margin: 24px 0;">
              <a href="${params.resetUrl}" style="background:#2563EB;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
            </p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
      cache: "no-store",
    });
    if (res.ok) {
      return { delivered: true, mode: "resend" };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `\n[SSPH DEV EMAIL] Password reset requested for ${params.to}\nReset link (expires in 30 mins): ${params.resetUrl}\n`
    );
    return { delivered: false, mode: "dev_console" };
  }

  return { delivered: false, mode: "unconfigured" };
}

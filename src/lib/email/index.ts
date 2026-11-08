import { Resend } from "resend";

export interface EmailResult {
  delivered: boolean;
  error?: string;
}

/**
 * Send a contact notification email. Returns whether the provider confirmed
 * delivery. We never claim an email was delivered unless the provider says so.
 * When RESEND_API_KEY is not configured this is a no-op.
 */
export async function sendContactNotification(args: {
  from?: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { delivered: false, error: "Email delivery is not configured." };
  }
  try {
    const resend = new Resend(apiKey);
    const from = args.from ?? "Mukti Portfolio <onboarding@resend.dev>";
    const res = await resend.emails.send({
      from,
      to: args.to,
      replyTo: args.replyTo,
      subject: args.subject,
      text: args.text,
    });
    if (res.error) {
      return { delivered: false, error: res.error.message };
    }
    return { delivered: Boolean(res.data?.id) };
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

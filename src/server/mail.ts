import nodemailer from "nodemailer";

function smtpConfig() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(
    /\s+/g,
    "",
  );
  const from =
    process.env.SMTP_FROM ||
    (user ? `LEO GROUP <${user}>` : "LEO GROUP <noreply@leogroup.local>");
  return { user, pass, from };
}

export function mailConfigured() {
  const { user, pass } = smtpConfig();
  return Boolean(user && pass);
}

async function transporter() {
  const { user, pass } = smtpConfig();
  if (!user || !pass) {
    throw new Error("Email is not configured (SMTP_USER / SMTP_PASS)");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  const { from } = smtpConfig();
  if (!mailConfigured()) {
    console.warn("[mail] skipped (not configured):", opts.subject, "→", opts.to);
    return { skipped: true as const };
  }
  const tx = await transporter();
  await tx.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  return { skipped: false as const };
}

function wrap(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#f5f5f5;font-family:Georgia,serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="letter-spacing:0.35em;font-size:12px;color:#c89b5c;margin-bottom:24px">LEO GROUP</div>
    <h1 style="font-weight:400;font-size:28px;margin:0 0 16px">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#cfcfcf">${bodyHtml}</div>
    <p style="margin-top:40px;font-size:11px;letter-spacing:0.2em;color:#777">MAISON AURUM · LEO WORLD</p>
  </div>
</body></html>`;
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const who = name?.trim() || "there";
  return sendMail({
    to,
    subject: "Welcome to LEO GROUP",
    text: `Welcome ${who},\n\nYour LEO GROUP account was created successfully.\n\nIf this wasn't you, contact us at leotechsaoworld@gmail.com.`,
    html: wrap(
      "Welcome",
      `<p>Hello ${who},</p><p>Your LEO GROUP account was created successfully. You can now sign in to track orders, wishlist and member editions.</p><p>If this wasn't you, reply to this email or contact <a href="mailto:leotechsaoworld@gmail.com" style="color:#c89b5c">leotechsaoworld@gmail.com</a>.</p>`,
    ),
  });
}

export async function sendLoginEmail(to: string) {
  const when = new Date().toUTCString();
  return sendMail({
    to,
    subject: "New sign-in to your LEO GROUP account",
    text: `Someone just signed in to your LEO GROUP account (${when} UTC).\n\nIf this was you, no action is needed.\nIf not, reset your password immediately.`,
    html: wrap(
      "New sign-in",
      `<p>Someone just signed in to your LEO GROUP account.</p><p style="color:#999">${when} UTC</p><p>If this was you, no action is needed. If not, use Forgot password on the site immediately.</p>`,
    ),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendMail({
    to,
    subject: "Reset your LEO GROUP password",
    text: `Reset your password using this link (valid 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: wrap(
      "Password reset",
      `<p>We received a request to reset your password.</p><p><a href="${resetUrl}" style="display:inline-block;margin-top:12px;padding:14px 28px;background:linear-gradient(90deg,#c89b5c,#e8c989);color:#0a0a0a;text-decoration:none;letter-spacing:0.2em;font-size:12px;font-weight:600">RESET PASSWORD</a></p><p style="margin-top:20px;color:#999">This link expires in 1 hour. If you didn't request it, ignore this email.</p>`,
    ),
  });
}

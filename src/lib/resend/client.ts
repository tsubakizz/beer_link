import { Resend } from "resend";
import nodemailer from "nodemailer";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  // APIキーが未設定の場合はnullを返す（ローカル開発用）
  if (!apiKey) {
    return null;
  }

  if (resendClient) {
    return resendClient;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export const CONTACT_FROM_EMAIL = "noreply@beer-link.com";

export function getContactEmail(): string | null {
  const email = process.env.CONTACT_EMAIL;
  // 未設定の場合はnullを返す（ローカル開発用）
  if (!email) {
    return null;
  }
  return email;
}

interface SendMailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * メール送信（本番: Resend、ローカル: SMTP/Mailpit）
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  const resend = getResendClient();

  if (resend) {
    // 本番: Resendで送信
    await resend.emails.send(options);
    return;
  }

  // ローカル: SMTP（Mailpit）で送信
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  if (smtpHost && smtpPort) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: false,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return;
  }

  // どちらも設定されていない場合はコンソールに出力
  console.log("========== 問い合わせメール（ローカル開発モード） ==========");
  console.log("To:", options.to);
  console.log("From:", options.from);
  console.log("Subject:", options.subject);
  console.log("Body:");
  console.log(options.html || options.text);
  console.log("============================================================");
}

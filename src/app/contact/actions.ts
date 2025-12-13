"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { contacts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  sendMail,
  getContactEmail,
  CONTACT_FROM_EMAIL,
} from "@/lib/resend/client";

interface SubmitContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContact(input: SubmitContactInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let submittedBy: string | null = null;

  // ログイン済みの場合、ユーザーIDを設定
  if (user) {
    // ユーザーが存在するか確認（なければ作成）
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!existingUser) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        displayName:
          user.user_metadata.display_name || user.email?.split("@")[0],
      });
    }

    submittedBy = user.id;
  }

  try {
    // DBに保存
    await db.insert(contacts).values({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      submittedBy,
      status: "pending",
    });

    // メール送信
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beer-link.com";

    // 1. 管理者宛メール
    try {
      const adminEmail = getContactEmail() || "admin@localhost";

      await sendMail({
        from: CONTACT_FROM_EMAIL,
        to: adminEmail,
        subject: `[Beer Link] 新しいお問い合わせがありました`,
        text: `新しいお問い合わせがありました。

管理画面から内容を確認してください。
${siteUrl}/admin/contacts

---
Beer Link - 知って繋がる、ビールの楽しさ
${siteUrl}

※ このメールは送信専用です。
`,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    // 2. 問い合わせ者宛メール
    try {
      const userEmailText = `${input.name} 様

この度はBeer Linkへお問い合わせいただき、ありがとうございます。

お問い合わせ内容は確認させていただきますが、個人運営のサイトのため、ご返信できない場合がございます。あらかじめご了承ください。

※ このメールに心当たりがない場合は、第三者が誤ってあなたのメールアドレスを入力した可能性があります。その場合は、このメールを無視していただいて問題ございません。

---
Beer Link - 知って繋がる、ビールの楽しさ
${siteUrl}

※ このメールは送信専用です。ご返信いただいても対応できませんのでご了承ください。
`;

      const userEmailHtml = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="color: #d97706;">お問い合わせを受け付けました</h2>

  <p>${input.name} 様</p>

  <p>この度はBeer Linkへお問い合わせいただき、ありがとうございます。</p>

  <p>お問い合わせ内容は確認させていただきますが、個人運営のサイトのため、ご返信できない場合がございます。あらかじめご了承ください。</p>

  <p style="color: #666; font-size: 14px;">※ このメールに心当たりがない場合は、第三者が誤ってあなたのメールアドレスを入力した可能性があります。その場合は、このメールを無視していただいて問題ございません。</p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="color: #666; font-size: 12px;">
    Beer Link - 知って繋がる、ビールの楽しさ<br>
    <a href="${siteUrl}" style="color: #d97706;">${siteUrl}</a><br><br>
    ※ このメールは送信専用です。ご返信いただいても対応できませんのでご了承ください。
  </p>
</div>
`;

      await sendMail({
        from: CONTACT_FROM_EMAIL,
        to: input.email,
        subject: `[Beer Link] お問い合わせを受け付けました`,
        text: userEmailText,
        html: userEmailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send user confirmation email:", emailError);
    }

    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit contact:", error);
    return { success: false, error: "送信に失敗しました" };
  }
}

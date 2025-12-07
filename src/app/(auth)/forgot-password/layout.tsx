import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "パスワードをお忘れの方",
  description: "パスワードリセット用のメールを送信します。",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

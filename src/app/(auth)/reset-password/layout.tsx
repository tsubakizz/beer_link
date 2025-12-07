import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "パスワードリセット",
  description: "新しいパスワードを設定してください。",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

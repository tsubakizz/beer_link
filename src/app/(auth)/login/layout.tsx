import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description: "beer_linkにログインして、レビュー投稿やお気に入り登録を始めましょう。",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

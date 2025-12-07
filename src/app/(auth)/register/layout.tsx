import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
  description: "beer_linkに無料登録して、クラフトビールのレビュー投稿やお気に入り登録を始めましょう。",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

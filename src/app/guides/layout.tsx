// 静的コンテンツ: 1日ごとに再検証
export const revalidate = 86400;

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

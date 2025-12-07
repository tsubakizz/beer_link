import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | beer_link",
    default: "認証 | beer_link",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

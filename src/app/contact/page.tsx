import { ContactForm } from "./ContactForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | beer_link",
  description: "beer_linkへのお問い合わせはこちらから",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* パンくずリスト */}
        <Breadcrumb items={[{ label: "お問い合わせ" }]} />

        <h1 className="text-3xl font-bold mb-2">お問い合わせ</h1>
        <p className="text-base-content/70 mb-8">
          ご質問・ご要望などお気軽にお問い合わせください。
        </p>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

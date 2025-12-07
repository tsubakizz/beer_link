import { StyleSubmitForm } from "./StyleSubmitForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビアスタイル追加 | beer_link",
  description: "新しいビアスタイルを追加できます",
};

export default function StyleSubmitPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">ビアスタイル追加</h1>
        <p className="text-base-content/70 mb-8">
          サイトに掲載されていないビアスタイルを追加できます。
        </p>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <StyleSubmitForm />
          </div>
        </div>
      </div>
    </div>
  );
}

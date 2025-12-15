import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "新規登録 | Beer Link",
  description: "Beer Linkに無料で登録して、ビールのレビューやお気に入り登録を始めましょう。",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center mb-4">新規登録</h1>

          <RegisterForm />

          <p className="text-center text-sm mt-4">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="link link-primary">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

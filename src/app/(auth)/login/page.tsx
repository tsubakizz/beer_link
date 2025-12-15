import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "ログイン | Beer Link",
  description: "Beer Linkにログインして、ビールのレビューやお気に入り登録を始めましょう。",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center mb-4">ログイン</h1>

          <LoginForm />

          <p className="text-center text-sm mt-4">
            アカウントをお持ちでない方は{" "}
            <Link href="/register" className="link link-primary">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

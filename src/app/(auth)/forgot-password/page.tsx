import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "パスワードをお忘れですか？ | Beer Link",
  description: "Beer Linkのパスワードをリセットします。登録したメールアドレスにリセット用のリンクを送信します。",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center mb-2">
            パスワードをお忘れですか？
          </h1>
          <p className="text-center text-base-content/70 mb-4">
            登録したメールアドレスを入力してください。
            パスワードリセット用のリンクをお送りします。
          </p>

          <ForgotPasswordForm />

          <div className="divider"></div>

          <p className="text-center text-sm">
            <Link href="/login" className="link link-primary">
              ログインページに戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

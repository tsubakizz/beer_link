import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "パスワードリセット | Beer Link",
  description: "Beer Linkの新しいパスワードを設定します。",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center mb-4">
            新しいパスワードを設定
          </h1>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}

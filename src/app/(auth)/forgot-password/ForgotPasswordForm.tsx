"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="card-title text-2xl justify-center mb-2">
            メールを送信しました
          </h1>
          <p className="text-base-content/70 mb-4">
            {email} にパスワードリセット用のリンクを送信しました。
            メールをご確認ください。
          </p>
          <p className="text-sm text-base-content/50 mb-4">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          <Link href="/login" className="btn btn-ghost">
            ログインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
          <div className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">メールアドレス</span>
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "リセットリンクを送信"
            )}
          </button>
        </form>
    </>
  );
}

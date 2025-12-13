"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitContact } from "./actions";

export function ContactForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("お名前を入力してください");
      return;
    }
    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!subject.trim()) {
      setError("件名を入力してください");
      return;
    }
    if (!message.trim()) {
      setError("お問い合わせ内容を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (result.success) {
        router.push("/contact/complete");
      } else {
        setError(result.error || "送信に失敗しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">お名前 *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="山田 太郎"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">メールアドレス *</span>
        </label>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">件名 *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="お問い合わせの件名"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">お問い合わせ内容 *</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder="お問い合わせ内容をご記入ください"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isPending}
      >
        {isPending ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "送信する"
        )}
      </button>
    </form>
  );
}

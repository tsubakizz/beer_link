"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitStyle } from "./actions";

export function StyleSubmitForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("スタイル名を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await submitStyle({ name: name.trim() });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "追加に失敗しました");
      }
    });
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🍺</div>
        <h2 className="text-2xl font-bold mb-2">スタイルを追加しました</h2>
        <p className="text-base-content/70 mb-6">
          ビール追加時に選択できるようになりました。
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
            }}
            className="btn btn-primary"
          >
            続けて追加
          </button>
          <button onClick={() => router.push("/submit/beer")} className="btn btn-ghost">
            ビールを追加
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">スタイル名 *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="例：ニューイングランドIPA"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
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
          "追加する"
        )}
      </button>
    </form>
  );
}

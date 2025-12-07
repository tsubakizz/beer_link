"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "./actions";
import type { User } from "@/lib/db/schema";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfile({ displayName, bio });
      if (result.success) {
        setMessage({ type: "success", text: "プロフィールを更新しました" });
      } else {
        setMessage({ type: "error", text: result.error || "更新に失敗しました" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">表示名</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="表示名を入力"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">自己紹介</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="自己紹介を入力"
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
          "保存"
        )}
      </button>
    </form>
  );
}

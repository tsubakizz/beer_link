"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitBeer } from "./actions";
import { FormSearchSelect } from "@/components/ui/FormSearchSelect";

interface BeerSubmitFormProps {
  breweries: { id: number; name: string }[];
  styles: { id: number; name: string; otherNames: string[] }[];
}

export function BeerSubmitForm({ breweries, styles }: BeerSubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [breweryId, setBreweryId] = useState("");
  const [styleId, setStyleId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("ビール名を入力してください");
      return;
    }

    if (!breweryId) {
      setError("ブルワリーを選択してください");
      return;
    }

    startTransition(async () => {
      const result = await submitBeer({
        name: name.trim(),
        breweryId: parseInt(breweryId, 10),
        styleId: styleId ? parseInt(styleId, 10) : null,
      });

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
        <h2 className="text-2xl font-bold mb-2">ビールを追加しました</h2>
        <p className="text-base-content/70 mb-6">
          ビール一覧に掲載されました。
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setBreweryId("");
              setStyleId("");
            }}
            className="btn btn-primary"
          >
            続けて追加
          </button>
          <button onClick={() => router.push("/beers")} className="btn btn-ghost">
            ビール一覧へ
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

      {/* ビール名 */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">ビール名 *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="例：よなよなエール"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      {/* ブルワリー（ライブサーチ） */}
      <FormSearchSelect
        options={breweries}
        value={breweryId}
        onChange={setBreweryId}
        label="ブルワリー"
        placeholder="ブルワリー名で検索..."
        required
        helperText={
          <>
            見つからない場合は{" "}
            <Link href="/submit/brewery" className="link link-primary">
              ブルワリーを追加
            </Link>
          </>
        }
      />

      {/* ビアスタイル（任意・ライブサーチ） */}
      <FormSearchSelect
        options={styles}
        value={styleId}
        onChange={setStyleId}
        label="ビアスタイル（任意）"
        placeholder="スタイル名で検索..."
        clearable
        helperText={
          <>
            見つからない場合は{" "}
            <Link href="/submit/style" className="link link-primary">
              スタイルを追加
            </Link>
          </>
        }
      />

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

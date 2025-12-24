"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitBeer } from "./actions";
import { FormSearchSelect } from "@/components/ui/FormSearchSelect";
import { OTHER_STYLE_NAME } from "@/lib/constants/beer-styles";

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
  const [customStyleText, setCustomStyleText] = useState("");

  // 「その他」スタイルが選択されているか判定
  const isOtherStyleSelected =
    styleId && styles.find((s) => s.id === parseInt(styleId, 10))?.name === OTHER_STYLE_NAME;

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
        customStyleText: isOtherStyleSelected ? customStyleText.trim() || null : null,
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
              setCustomStyleText("");
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
        maxResults={100}
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
        onChange={(value) => {
          setStyleId(value);
          // スタイル変更時にカスタムテキストをクリア
          if (!value || styles.find((s) => s.id === parseInt(value, 10))?.name !== OTHER_STYLE_NAME) {
            setCustomStyleText("");
          }
        }}
        label="ビアスタイル（任意）"
        placeholder="スタイル名で検索..."
        clearable
        maxResults={100}
        helperText={
          <>
            見つからない場合は「その他」を選択するか、
            <Link href="/submit/style" className="link link-primary">
              スタイルを追加
            </Link>
          </>
        }
      />

      {/* その他選択時のカスタムスタイル入力 */}
      {isOtherStyleSelected && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">スタイル名（任意）</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="例：フルーツサワーエール、スモークドラガー"
            value={customStyleText}
            onChange={(e) => setCustomStyleText(e.target.value)}
            maxLength={100}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              分類が難しいスタイルの場合は入力してください
            </span>
          </label>
        </div>
      )}

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

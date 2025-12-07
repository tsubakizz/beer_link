"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "./actions";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface ReviewFormProps {
  beerId: number;
}

const FLAVOR_LABELS = [
  { value: 1, label: "弱め" },
  { value: 2, label: "やや弱め" },
  { value: 3, label: "普通" },
  { value: 4, label: "やや強め" },
  { value: 5, label: "強め" },
];

export function ReviewForm({ beerId }: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [bitterness, setBitterness] = useState<number | null>(null);
  const [sweetness, setSweetness] = useState<number | null>(null);
  const [body, setBody] = useState<number | null>(null);
  const [aroma, setAroma] = useState<number | null>(null);
  const [sourness, setSourness] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("評価を選択してください");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        beerId,
        rating,
        bitterness,
        sweetness,
        body,
        aroma,
        sourness,
        comment: comment.trim() || null,
        imageUrl,
      });

      if (result.success) {
        router.push(`/beers/${beerId}`);
        router.refresh();
      } else {
        setError(result.error || "レビューの投稿に失敗しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
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

      {/* 総合評価 */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg font-bold">総合評価 *</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="rating rating-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <input
                key={star}
                type="radio"
                name="rating"
                className="mask mask-star-2 bg-amber-400"
                checked={rating === star}
                onChange={() => setRating(star)}
              />
            ))}
          </div>
          <span className="text-lg font-bold ml-2">
            {rating > 0 ? `${rating}/5` : "未選択"}
          </span>
        </div>
      </div>

      <div className="divider">味の評価（任意）</div>

      {/* 味の評価 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FlavorSlider
          label="苦味"
          value={bitterness}
          onChange={setBitterness}
        />
        <FlavorSlider
          label="甘味"
          value={sweetness}
          onChange={setSweetness}
        />
        <FlavorSlider label="ボディ" value={body} onChange={setBody} />
        <FlavorSlider label="香り" value={aroma} onChange={setAroma} />
        <FlavorSlider label="酸味" value={sourness} onChange={setSourness} />
      </div>

      <div className="divider"></div>

      {/* コメント */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg font-bold">コメント</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-32"
          placeholder="このビールの感想を書いてください..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
        />
        <label className="label">
          <span className="label-text-alt text-base-content/60">
            {comment.length}/2000文字
          </span>
        </label>
      </div>

      {/* 画像アップロード */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg font-bold">写真</span>
          <span className="label-text-alt text-base-content/60">任意</span>
        </label>
        <ImageUploader
          category="reviews"
          onUploadComplete={(url) => setImageUrl(url || null)}
          currentImageUrl={imageUrl}
          aspectRatio="video"
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-4">
        <button
          type="button"
          className="btn btn-ghost flex-1"
          onClick={() => router.back()}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isPending || rating === 0}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "レビューを投稿"
          )}
        </button>
      </div>
    </form>
  );
}

interface FlavorSliderProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

function FlavorSlider({ label, value, onChange }: FlavorSliderProps) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
        <span className="label-text-alt">
          {value !== null
            ? FLAVOR_LABELS.find((l) => l.value === value)?.label
            : "未評価"}
        </span>
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`btn btn-xs ${value === null ? "btn-primary" : "btn-ghost"}`}
          onClick={() => onChange(null)}
        >
          -
        </button>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            className={`btn btn-sm flex-1 ${value === v ? "btn-primary" : "btn-outline"}`}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

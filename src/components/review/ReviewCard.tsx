import Image from "next/image";
import { FlavorBars } from "@/components/beer";
import { ReviewCardActions } from "./ReviewCardActions";

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    bitterness?: number | null;
    sweetness?: number | null;
    body?: number | null;
    aroma?: number | null;
    sourness?: number | null;
    comment?: string | null;
    imageUrl?: string | null;
    createdAt: Date;
    user?: {
      id: string;
      displayName?: string | null;
      profileImageUrl?: string | null;
    } | null;
  };
  beerId?: number;
  currentUserId?: string | null;
}

export function ReviewCard({ review, beerId, currentUserId }: ReviewCardProps) {
  const isOwner = currentUserId && review.user?.id === currentUserId;
  const hasFlavorData =
    review.bitterness ||
    review.sweetness ||
    review.body ||
    review.aroma ||
    review.sourness;

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-3">
          {/* ユーザーアバター */}
          {review.user?.profileImageUrl ? (
            <Image
              src={review.user.profileImageUrl}
              alt={review.user.displayName || "ユーザー"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-base-content/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          <div className="flex-1">
            <p className="font-medium">
              {review.user?.displayName || "匿名ユーザー"}
            </p>
            <p className="text-sm text-base-content/60">
              {formatDate(review.createdAt)}
            </p>
          </div>

          {/* 評価 */}
          <div className="flex items-center gap-1">
            <div className="rating rating-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  className="mask mask-star-2 bg-amber-400"
                  checked={review.rating === star}
                  readOnly
                />
              ))}
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="space-y-3">
          {/* コメント */}
          {review.comment && (
            <p className="text-base-content/80 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}

          {/* レビュー画像 */}
          {review.imageUrl && (
            <div>
              <Image
                src={review.imageUrl}
                alt="レビュー画像"
                width={300}
                height={200}
                className="rounded-lg min-h-48 object-contain bg-base-200"
              />
            </div>
          )}

          {/* 味の評価 */}
          {hasFlavorData && (
            <div className="max-w-sm">
              <FlavorBars
                data={{
                  bitterness: review.bitterness,
                  sweetness: review.sweetness,
                  body: review.body,
                  aroma: review.aroma,
                  sourness: review.sourness,
                }}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* 編集・削除ボタン（自分のレビューの場合のみ表示） */}
        {isOwner && beerId && (
          <ReviewCardActions reviewId={review.id} beerId={beerId} />
        )}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

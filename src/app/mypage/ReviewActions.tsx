"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteReview } from "@/app/beers/[id]/review/actions";

interface ReviewActionsProps {
  reviewId: number;
  beerId: number;
}

export function ReviewActions({ reviewId, beerId }: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReview(reviewId, beerId);

      if (result.success) {
        setShowDeleteConfirm(false);
        router.refresh();
      } else {
        setError(result.error || "削除に失敗しました");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/beers/${beerId}/review/${reviewId}/edit`}
          className="btn btn-ghost btn-xs"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          編集
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-ghost btn-xs text-error"
          disabled={isPending}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          削除
        </button>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">レビューを削除</h3>
            <p className="py-4">
              このレビューを削除しますか？この操作は取り消せません。
            </p>
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError(null);
                }}
                disabled={isPending}
              >
                キャンセル
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "削除する"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !isPending && setShowDeleteConfirm(false)}
          ></div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { approveStyle, rejectStyle } from "./actions";

interface StyleRequestCardProps {
  request: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    submitter: { id: string | null; displayName: string | null; email: string | null } | null;
  };
}

export function StyleRequestCard({ request }: StyleRequestCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isProcessed, setIsProcessed] = useState(false);
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveStyle(request.id);
      if (res.success) {
        setIsProcessed(true);
        setResult("approved");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectStyle(request.id);
      if (res.success) {
        setIsProcessed(true);
        setResult("rejected");
      }
    });
  };

  if (isProcessed) {
    return (
      <div className={`card bg-base-100 shadow border-l-4 ${result === "approved" ? "border-success" : "border-error"}`}>
        <div className="card-body py-4">
          <div className="flex items-center gap-4">
            <span className={`badge ${result === "approved" ? "badge-success" : "badge-error"}`}>
              {result === "approved" ? "承認済み" : "却下済み"}
            </span>
            <span className="font-bold">{request.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="card-title">{request.name}</h3>
            {request.description && (
              <p className="mt-3 text-sm">{request.description}</p>
            )}
            <p className="text-xs text-base-content/50 mt-3">
              申請者: {request.submitter?.displayName || request.submitter?.email || "不明"} /
              {formatDate(request.createdAt)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="btn btn-success btn-sm"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "承認"
              )}
            </button>
            <button
              onClick={handleReject}
              className="btn btn-error btn-outline btn-sm"
              disabled={isPending}
            >
              却下
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

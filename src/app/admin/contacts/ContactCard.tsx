"use client";

import { useState, useTransition } from "react";
import { updateContactStatus, updateAdminNote } from "./actions";

interface ContactCardProps {
  contact: {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    adminNote: string | null;
    createdAt: Date;
    submitter: {
      id: string | null;
      displayName: string | null;
      email: string | null;
    } | null;
  };
}

export function ContactCard({ contact }: ContactCardProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(contact.status);
  const [adminNote, setAdminNote] = useState(contact.adminNote || "");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateContactStatus(contact.id, newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
      }
    });
  };

  const handleSaveNote = () => {
    startTransition(async () => {
      const result = await updateAdminNote(contact.id, adminNote);
      if (result.success) {
        setIsEditingNote(false);
      }
    });
  };

  const statusBadgeClass = {
    pending: "badge-warning",
    read: "badge-info",
    replied: "badge-success",
    closed: "badge-neutral",
  }[currentStatus] || "badge-ghost";

  const statusLabel = {
    pending: "未対応",
    read: "確認済み",
    replied: "返信済み",
    closed: "完了",
  }[currentStatus] || currentStatus;

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${statusBadgeClass}`}>{statusLabel}</span>
              <h3 className="card-title text-lg">{contact.subject}</h3>
            </div>
            <p className="text-sm text-base-content/70">
              {contact.name} &lt;{contact.email}&gt;
            </p>
            <p className="text-xs text-base-content/50 mt-1">
              {contact.submitter && (
                <>会員: {contact.submitter.displayName || contact.submitter.email} / </>
              )}
              {formatDate(contact.createdAt)}
            </p>
          </div>

          {/* ステータス変更ボタン */}
          <div className="flex flex-wrap gap-2">
            {currentStatus === "pending" && (
              <button
                onClick={() => handleStatusChange("read")}
                className="btn btn-info btn-sm"
                disabled={isPending}
              >
                確認済み
              </button>
            )}
            {(currentStatus === "pending" || currentStatus === "read") && (
              <button
                onClick={() => handleStatusChange("replied")}
                className="btn btn-success btn-sm"
                disabled={isPending}
              >
                返信済み
              </button>
            )}
            {currentStatus !== "closed" && (
              <button
                onClick={() => handleStatusChange("closed")}
                className="btn btn-neutral btn-outline btn-sm"
                disabled={isPending}
              >
                完了
              </button>
            )}
          </div>
        </div>

        {/* メッセージ本文 */}
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:underline"
          >
            {isExpanded ? "▼ 内容を閉じる" : "▶ 内容を表示"}
          </button>
          {isExpanded && (
            <div className="mt-2 p-4 bg-base-200 rounded-lg whitespace-pre-wrap text-sm">
              {contact.message}
            </div>
          )}
        </div>

        {/* 管理者メモ */}
        <div className="mt-4 pt-4 border-t border-base-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">管理者メモ</span>
            {!isEditingNote && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="btn btn-ghost btn-xs"
              >
                編集
              </button>
            )}
          </div>
          {isEditingNote ? (
            <div className="space-y-2">
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="メモを入力..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  className="btn btn-primary btn-sm"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "保存"
                  )}
                </button>
                <button
                  onClick={() => {
                    setAdminNote(contact.adminNote || "");
                    setIsEditingNote(false);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-base-content/70">
              {adminNote || "（メモなし）"}
            </p>
          )}
        </div>

        {/* 返信リンク */}
        <div className="mt-4">
          <a
            href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
            className="btn btn-outline btn-sm"
          >
            メールで返信
          </a>
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

"use client";

import { useState } from "react";
import Link from "next/link";

interface AuthRequiredLinkProps {
  href: string;
  isAuthenticated: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AuthRequiredLink({
  href,
  isAuthenticated,
  children,
  className,
}: AuthRequiredLinkProps) {
  const [showModal, setShowModal] = useState(false);

  if (isAuthenticated) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={className}
      >
        {children}
      </button>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">ログインが必要です</h3>
            <p className="py-4">
              この機能を使うには、ログインまたは会員登録が必要です。
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                キャンセル
              </button>
              <Link href="/register" className="btn btn-outline btn-primary">
                会員登録
              </Link>
              <Link href="/login" className="btn btn-primary">
                ログイン
              </Link>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowModal(false)}
          ></div>
        </div>
      )}
    </>
  );
}

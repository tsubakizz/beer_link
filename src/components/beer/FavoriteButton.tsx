"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorite";

interface FavoriteButtonProps {
  beerId: number;
  isFavorited: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function FavoriteButton({
  beerId,
  isFavorited: initialIsFavorited,
  size = "md",
  showText = false,
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);

  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleFavorite(beerId);
      if (result.success) {
        setIsFavorited(result.isFavorited);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`btn ${sizeClasses[size]} ${
        isFavorited ? "btn-error" : "btn-ghost"
      }`}
      aria-label={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
    >
      {isPending ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconSizeClasses[size]}
          fill={isFavorited ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      {showText && (
        <span className="ml-1">
          {isFavorited ? "お気に入り済み" : "お気に入りに追加"}
        </span>
      )}
    </button>
  );
}

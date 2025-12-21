"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import {
  compressImage,
  createImagePreview,
  revokeImagePreview,
  isAllowedImageType,
  isFileSizeValid,
} from "@/lib/image/compress";

export type ImageCategory = "reviews" | "beers" | "breweries";

interface ImageUploaderProps {
  category: ImageCategory;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  currentImageUrl?: string | null;
  className?: string;
}

type UploadStatus = "idle" | "compressing" | "uploading" | "complete" | "error";

export function ImageUploader({
  category,
  onUploadComplete,
  onUploadError,
  onUploadingChange,
  currentImageUrl,
  className = "",
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // コンポーネントのアンマウント時にプレビューURLを解放
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== currentImageUrl) {
        revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl, currentImageUrl]);

  // アップロード状態の変化を親に通知
  useEffect(() => {
    const isUploading = status === "compressing" || status === "uploading";
    onUploadingChange?.(isUploading);
  }, [status, onUploadingChange]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // ファイルタイプチェック
      if (!isAllowedImageType(file)) {
        const error = "JPEG、PNG、WebP形式の画像のみ対応しています";
        setErrorMessage(error);
        onUploadError?.(error);
        return;
      }

      // ファイルサイズチェック（10MB以下）
      if (!isFileSizeValid(file, 10)) {
        const error = "ファイルサイズは10MB以下にしてください";
        setErrorMessage(error);
        onUploadError?.(error);
        return;
      }

      setErrorMessage(null);
      setStatus("compressing");
      setProgress(10);

      try {
        // 画像を圧縮（EXIFも削除される）
        const compressedFile = await compressImage(file);
        setProgress(30);

        // プレビューを表示
        const preview = createImagePreview(compressedFile);
        if (previewUrl && previewUrl !== currentImageUrl) {
          revokeImagePreview(previewUrl);
        }
        setPreviewUrl(preview);

        setStatus("uploading");
        setProgress(50);

        // presigned URLを取得（ファイル名の拡張子をwebpに変更）
        const webpFilename = file.name.replace(/\.[^/.]+$/, ".webp");
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: webpFilename,
            contentType: compressedFile.type,
            category,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "アップロードURLの取得に失敗しました");
        }

        const { presignedUrl, publicUrl } = await response.json();
        setProgress(70);

        // R2に直接アップロード
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: compressedFile,
          headers: {
            "Content-Type": compressedFile.type,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("画像のアップロードに失敗しました");
        }

        setProgress(100);
        setStatus("complete");
        onUploadComplete(publicUrl);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "アップロードに失敗しました";
        setErrorMessage(message);
        setStatus("error");
        onUploadError?.(message);
      }
    },
    [category, currentImageUrl, onUploadComplete, onUploadError, previewUrl]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl !== currentImageUrl) {
      revokeImagePreview(previewUrl);
    }
    setPreviewUrl(null);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = status === "compressing" || status === "uploading";

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {previewUrl ? (
        <div className="relative">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-lg border border-base-300 bg-base-200"
          >
            <Image
              src={previewUrl}
              alt="アップロード画像"
              fill
              className="object-cover"
              unoptimized={previewUrl.startsWith("blob:")}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <span className="loading loading-spinner loading-lg text-white"></span>
                <p className="text-white text-sm mt-2">
                  {status === "compressing" ? "圧縮中..." : "アップロード中..."}
                </p>
                <progress
                  className="progress progress-primary w-3/4 mt-2"
                  value={progress}
                  max="100"
                ></progress>
              </div>
            )}
          </div>
          {!isLoading && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleClick}
                className="btn btn-sm btn-outline flex-1"
              >
                変更
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-sm btn-error btn-outline"
              >
                削除
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className={`min-h-32 min-w-48 border-2 border-dashed border-base-300 rounded-lg
              hover:border-primary hover:bg-base-200/50 transition-colors
              flex flex-col items-center justify-center gap-2 cursor-pointer px-8
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg
              className="w-10 h-10 text-base-content/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-base-content/60">
              クリックして画像を選択
            </span>
            <span className="text-xs text-base-content/40">
              JPEG, PNG, WebP (最大10MB)
            </span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error mt-2 py-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

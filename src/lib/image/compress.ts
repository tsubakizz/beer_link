import imageCompression from "browser-image-compression";

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxSizeMB: 1, // 最大1MB
  maxWidthOrHeight: 1920, // 最大幅/高さ 1920px
  quality: 0.8, // 品質80%
};

/**
 * 画像を圧縮し、EXIFデータを削除する
 * browser-image-compressionはcanvasを使用して再描画するため、
 * 自動的にEXIFデータが削除される
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // 画像を圧縮してWebPに変換（canvasで再描画されるためEXIFも削除される）
  const compressedFile = await imageCompression(file, {
    maxSizeMB: mergedOptions.maxSizeMB,
    maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
    initialQuality: mergedOptions.quality,
    useWebWorker: true,
    // EXIFデータを保持しない（デフォルトでfalse）
    preserveExif: false,
    // WebPに変換
    fileType: "image/webp",
  });

  return compressedFile;
}

/**
 * 画像ファイルのプレビューURLを生成
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * プレビューURLを解放（メモリリーク防止）
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * ファイルが画像かどうかを判定
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * 許可されたファイル形式かどうかを判定
 */
export function isAllowedImageType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
}

/**
 * ファイルサイズが制限内かどうかを判定（圧縮前のチェック）
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

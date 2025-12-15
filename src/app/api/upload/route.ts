import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2/client";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// リクエストのバリデーションスキーマ
const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/),
  category: z.enum(["reviews", "beers", "breweries"]),
});

// ファイル名をサニタイズしてユニークなキーを生成
function generateObjectKey(
  category: string,
  userId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const sanitizedName = filename
    .replace(/\.[^/.]+$/, "") // 拡張子を除去
    .replace(/[^a-zA-Z0-9-_]/g, "_") // 特殊文字を置換
    .substring(0, 50); // 長さ制限

  return `${category}/${userId}/${timestamp}-${sanitizedName}-${randomSuffix}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストボディをパース
    const body = await request.json();
    const parsed = uploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "無効なリクエストです", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { filename, contentType, category } = parsed.data;

    // オブジェクトキーを生成
    const objectKey = generateObjectKey(category, user.id, filename);

    // presigned URLを生成（有効期限: 5分）
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 300, // 5分
    });

    // 公開URLを生成
    const publicUrl = `${R2_PUBLIC_URL}/${objectKey}`;

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      objectKey,
    });
  } catch (error) {
    console.error("Upload URL generation error:", error);
    return NextResponse.json(
      { error: "アップロードURLの生成に失敗しました" },
      { status: 500 }
    );
  }
}

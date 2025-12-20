import { AwsClient } from "aws4fetch";

// Edge互換のR2クライアント（aws4fetch使用）
export function getR2Client() {
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    region: "auto",
    service: "s3",
  });
}

export function getR2Endpoint(): string {
  return `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

/**
 * R2へのpresigned URLを生成する（Edge Runtime対応）
 */
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 300
): Promise<string> {
  const client = getR2Client();
  const endpoint = getR2Endpoint();
  const bucket = R2_BUCKET_NAME;

  const url = new URL(`${endpoint}/${bucket}/${key}`);

  // AWS Signature V4のクエリパラメータを追加
  url.searchParams.set("X-Amz-Expires", expiresIn.toString());

  // aws4fetchでリクエストに署名（ヘッダーは署名に含めない）
  // クライアント側でContent-Typeを自由に設定できるようにする
  const signedRequest = await client.sign(url.toString(), {
    method: "PUT",
    aws: {
      signQuery: true, // URLクエリパラメータに署名を含める
    },
  });

  return signedRequest.url;
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/** 파일을 R2에 올리고 공개 URL을 반환한다. 서버 전용(관리자 업로드 라우트에서만 호출). */
export async function uploadToR2(params: { key: string; body: Buffer; contentType: string }): Promise<string> {
  const client = r2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );
  return `${process.env.NEXT_PUBLIC_MEDIA_URL}/${params.key}`;
}

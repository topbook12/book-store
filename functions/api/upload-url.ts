import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function onRequestPost({ request, env }: any) {
  try {
    const reqBody = await request.json();
    const { filename, contentType } = reqBody;

    if (!filename) {
      return new Response(JSON.stringify({ error: "Filename is required" }), { status: 400 });
    }

    // Connect using ENV variables from Cloudflare Pages
    const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID || "bae529746fcd29c8e7251c3cda62dc67";
    const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID || "eb42d02da85821fa3668f3ac725c8cee";
    const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY || "fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6";
    const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "ice-dept-documents";
    const R2_PUBLIC_URL = env.R2_PUBLIC_URL || "https://pub-16c77c3aa29c4145b29453efaaf65851.r2.dev";

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    // Generate a unique object key
    const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600
    });
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return new Response(JSON.stringify({ presignedUrl, publicUrl, key }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate upload URL" }), { status: 500 });
  }
}

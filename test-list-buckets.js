import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "weurhq-us-east-1", // Cloudflare doesn't care, but SDK might need a valid one
  endpoint: `https://bae529746fcd29c8e7251c3cda62dc67.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: "eb42d02da85821fa3668f3ac725c8cee",
    secretAccessKey: "fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6",
  },
});

async function run() {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Buckets:", data.Buckets);
  } catch(err) {
    console.error("Error connecting to R2:", err.Code || err);
  }
}
run();

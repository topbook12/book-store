import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { AwsClient } from "aws4fetch";

// Fallbacks for local / AI Studio preview (Never push actual secret keys to GitHub)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "bae529746fcd29c8e7251c3cda62dc67";
// Temporary fallback, you must add these to Cloudflare
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "eb42d02da85821fa3668f3ac725c8cee";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "ice-dept-documents";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-16c77c3aa29c4145b29453efaaf65851.r2.dev";

const aws = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to generate presigned URL for upload
  app.post("/api/upload-url", async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      
      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      // Generate a unique object key
      const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`);
      url.searchParams.set('X-Amz-Expires', '3600');

      const signedRequest = await aws.sign(url, {
        method: "PUT",
        aws: { signQuery: true },
        headers: {
          "Content-Type": contentType || "application/octet-stream",
        }
      });

      const presignedUrl = signedRequest.url;
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;

      res.json({ presignedUrl, publicUrl, key });
    } catch (error) {
      console.error("Presigned URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

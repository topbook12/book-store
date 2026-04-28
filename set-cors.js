import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://bae529746fcd29c8e7251c3cda62dc67.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'eb42d02da85821fa3668f3ac725c8cee',
    secretAccessKey: 'fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6'
  }
})

async function run () {
  try {
    const data = await s3Client.send(new PutBucketCorsCommand({
      Bucket: 'ice-dept-documents',
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: [
              '*',
              'https://book-store.bookpreview12.workers.dev'
            ],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600
          }
        ]
      }
    }))
    console.log('CORS updated successfully on Cloudflare R2!')
  } catch (err) {
    console.error('Error setting CORS:', err)
  }
}
run()

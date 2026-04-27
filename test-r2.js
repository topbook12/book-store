import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://bae529746fcd29c8e7251c3cda62dc67.r2.cloudflarestorage.com',
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'eb42d02da85821fa3668f3ac725c8cee',
    secretAccessKey: 'fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6'
  }
})

async function test () {
  try {
    const command = new PutObjectCommand({
      Bucket: 'ice-dept-documents',
      Key: 'test-' + Date.now() + '.txt',
      ContentType: 'text/plain'
    })

    // Some s3 configs with R2 require signableHeaders to be minimal
    // or region to be "us-east-1"
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600
    })
    console.log('URL:', presignedUrl)

    const fetch = (await import('node-fetch')).default
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      body: 'test content',
      headers: {
        'Content-Type': 'text/plain' // Must match exactly
      }
    })
    console.log('Status:', res.status)
    console.log('Text:', await res.text())
  } catch (err) {
    console.error('error test:', err)
  }
}
test()

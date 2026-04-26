import { AwsClient } from 'aws4fetch';

const R2_ACCOUNT_ID = "bae529746fcd29c8e7251c3cda62dc67";
const R2_ACCESS_KEY_ID = "eb42d02da85821fa3668f3ac725c8cee";
const R2_SECRET_ACCESS_KEY = "fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6";
const R2_BUCKET_NAME = "ice-dept-documents";

const aws = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
});

async function run() {
  const key = "test-file.txt";
  const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`);
  url.searchParams.set('X-Amz-Expires', '3600');
  const req = await aws.sign(url, {
      method: 'PUT',
      aws: { signQuery: true },
  });
  console.log(req.url);
}
run();

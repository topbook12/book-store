import fetch from 'node-fetch';
async function test() {
  const res = await fetch('http://localhost:3000/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: 'test.txt', contentType: 'text/plain' })
  });
  console.log(res.status, await res.text());
}
test();

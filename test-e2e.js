import fetch from 'node-fetch'
async function test () {
  const res = await fetch('http://localhost:3000/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: 'test-e2e.txt', contentType: 'text/plain' })
  })
  const data = await res.json()
  console.log('Got URLs', data)

  const uploadRes = await fetch(data.presignedUrl, {
    method: 'PUT',
    body: 'hello world e2e test',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
  console.log('Upload status:', uploadRes.status)

  const readRes = await fetch(data.publicUrl)
  console.log('Read status:', readRes.status)
  console.log('Read body:', await readRes.text())
}
test()

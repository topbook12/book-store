import fs from 'fs'
import path from 'path'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBpGhTJ8gWQIW7iWNMEGoGwgxqrIVOlh10',
  authDomain: 'ice-documents.firebaseapp.com',
  projectId: 'ice-documents',
  storageBucket: 'ice-documents.firebasestorage.app',
  messagingSenderId: '497389322034',
  appId: '1:497389322034:web:ed78faa96b29178e1b212b',
  measurementId: 'G-VY2E3BBZSG'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function run () {
  try {
    console.log('Generating dummy file...')
    const fileContent = 'This is a real document automatically uploaded to verify the Cloudflare R2 and Firebase integration is fully functional and ready for production.'
    const filename = 'Verification_Document_R2_Firebase.txt'

    // Simulate frontend API call to our local server
    console.log('Calling local API for presigned URL...')
    const apiUrl = 'http://127.0.0.1:3000/api/upload-url'
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentType: 'text/plain' })
    })

    if (!res.ok) throw new Error('Failed to get presigned URL: ' + await res.text())
    const { presignedUrl, publicUrl, key } = await res.json()

    console.log('Got presigned URL! Uploading to R2...')
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileContent,
      headers: { 'Content-Type': 'text/plain' }
    })

    if (!uploadRes.ok) throw new Error('Failed R2 upload: ' + uploadRes.statusText)
    console.log('Uploaded successfully to R2! Public URL:', publicUrl)

    console.log('Adding record to Firestore...')
    const docRef = await addDoc(collection(db, 'materials'), {
      title: 'Test File: Seamless Cloudflare R2 Integration',
      description: 'This is a real document successfully uploaded from the system directly into your Cloudflare R2 bucket and registered in Firebase Firestore.',
      type: 'Note',
      category: 'Cloud Services',
      semester: '8',
      fileUrl: publicUrl,
      fileName: filename,
      uploaderId: 'SYSTEM_AGENT',
      uploaderName: 'AI Verification Agent',
      createdAt: Date.now(),
      downloads: 0,
      size: fileContent.length
    })

    console.log('Firestore record created! ID:', docRef.id)
    process.exit(0)
  } catch (e) {
    console.error('TEST FAILED:', e)
    process.exit(1)
  }
}

run()

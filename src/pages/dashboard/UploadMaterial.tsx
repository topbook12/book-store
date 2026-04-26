import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { toast } from 'sonner';
import { MaterialType } from '../../types';
import { Upload } from 'lucide-react';
import { AwsClient } from 'aws4fetch';
import { cn } from '../../lib/utils';

// Direct R2 upload for static deployments
const R2_ACCOUNT_ID = "bae529746fcd29c8e7251c3cda62dc67";
const R2_ACCESS_KEY_ID = "eb42d02da85821fa3668f3ac725c8cee";
const R2_SECRET_ACCESS_KEY = "fed12428ff53de19ab08675b5c102f1be863964e04669fbafecdf0222b59b1e6";
const R2_BUCKET_NAME = "ice-dept-documents";
const R2_PUBLIC_URL = "https://pub-16c77c3aa29c4145b29453efaaf65851.r2.dev";

const aws = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
});

export default function UploadMaterial() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaterialType>('Book');
  const [category, setCategory] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user && user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'TEACHER') {
      navigate('/dashboard');
      toast.error('You do not have permission to upload materials');
    }
  }, [user, navigate]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // 1. Generate Presigned URL natively using aws4fetch
      const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`);
      url.searchParams.set('X-Amz-Expires', '3600');

      const signedRequest = await aws.sign(url, {
        method: "PUT",
        aws: { signQuery: true },
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        }
      });

      const presignedUrl = signedRequest.url;
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;

      // 2. Upload directly to Cloudflare R2 using XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            // Cap at 95% until firesore finishes
            setUploadProgress(percentComplete > 95 ? 95 : percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            console.error("XHR failed", xhr.status, xhr.responseText);
            if (xhr.status === 403 || xhr.status === 0) {
              reject(new Error(`CORS or Permission Error: Ensure Cloudflare R2 bucket "${R2_BUCKET_NAME}" has CORS configured correctly for PUT requests.`));
            } else {
              reject(new Error(`Upload Failed (${xhr.status}): ${xhr.responseText}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network Error: Upload blocked by CORS. Please go to Cloudflare R2 -> Settings -> CORS and allow PUT requests from all origins.'));
        };

        xhr.send(file);
      });

      // 3. Create the record in Firestore using the publicUrl
      setUploadProgress(98);
      await addDoc(collection(db, 'materials'), {
        title,
        description,
        type,
        category: category || 'Uncategorized',
        semester,
        fileUrl: publicUrl,
        fileName: file.name,
        uploaderId: user.uid,
        uploaderName: user.displayName || user.email,
        createdAt: Date.now(),
        downloads: 0,
        size: file.size, 
      });

      setUploadProgress(100);
      toast.success('Material uploaded successfully!');
      setTimeout(() => navigate('/dashboard/materials'), 500);
    } catch (error: any) {
      console.error("Upload error caught:", error);
      toast.error(error.message, { duration: 15000 });
    } finally {
      setIsLoading(false);
      // Don't reset to 0 immediately so user can see it finished
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const types: MaterialType[] = ['Book', 'Note', 'Lab Manual', 'Slide', 'Paper', 'Thesis', 'Question', 'Syllabus', 'Other'];

  return (
    <Card className="max-w-2xl mx-auto border bg-card/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
        <CardTitle className="text-2xl font-bold">Upload Material</CardTitle>
        <CardDescription className="text-base text-muted-foreground">Share academic resources securely</CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-tight">Title *</label>
              <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Note CH-1" className="h-12 bg-background/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-tight">Type *</label>
              <select 
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors hover:border-primary/50"
                value={type} 
                onChange={(e) => setType(e.target.value as MaterialType)}
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-tight">Description</label>
            <textarea 
              className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors hover:border-primary/50 resize-y"
              value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details about the material..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-tight">Subject Category *</label>
              <Input required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. ICE202, VLSI" className="h-12 bg-background/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-tight">Semester (Optional)</label>
              <Input value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. 3, 5" className="h-12 bg-background/50 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-semibold tracking-tight">Upload File *</label>
            <div className={cn("mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl relative transition-all duration-300", file ? "border-primary bg-primary/5 shadow-inner" : "border-border bg-background/50 hover:bg-accent/5 hover:border-primary/50")}>
              <div className="space-y-2 flex flex-col items-center text-center">
                <div className={cn("p-4 rounded-full mb-2 transition-colors", file ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                  <Upload className="mx-auto h-8 w-8" />
                </div>
                <div className="flex text-sm text-foreground font-medium">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md text-primary hover:underline focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 px-2">
                    <span>{file ? file.name : "Tap to select a document"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {file ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOCX, ZIP, PPTX up to 50MB'}
                </p>
              </div>
            </div>
          </div>

          {isLoading && (
             <div className="w-full bg-muted/50 rounded-full h-3 mt-4 overflow-hidden border shadow-inner relative">
               <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
               <div className="bg-gradient-to-r from-primary to-purple-600 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end px-2" style={{ width: `${Math.max(5, uploadProgress)}%` }}>
                  <span className="text-[8px] font-bold text-white shadow-sm drop-shadow-md">{uploadProgress}%</span>
               </div>
             </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-transform active:scale-95">
            {isLoading ? 'Uploading...' : 'Publish Material'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
    setUploadProgress(10);

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

      setUploadProgress(40);

      // 2. Upload directly to Cloudflare R2
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("R2 Upload Failed:", uploadResponse.status, errorText);
        throw new Error(`Upload Failed (${uploadResponse.status}): Please check if your Cloudflare R2 CORS policy is correctly configured.`);
      }
      
      setUploadProgress(80);

      // 3. Create the record in Firestore using the publicUrl
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
      let errorMsg = error.message;
      if (errorMsg === 'Failed to fetch' || errorMsg.includes('NetworkError')) {
        errorMsg = 'Network Error: Upload blocked by CORS or Invalid R2 Credentials. Please ensure your R2 API keys and CORS policy are correctly configured.';
      }
      toast.error(errorMsg, { duration: 10000 });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const types: MaterialType[] = ['Book', 'Note', 'Lab Manual', 'Slide', 'Paper', 'Thesis', 'Question', 'Syllabus', 'Other'];

  return (
    <Card className="max-w-2xl mx-auto border bg-card">
      <CardHeader>
        <CardTitle>Upload New Material</CardTitle>
        <CardDescription>Add new academic resources to the digital library</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Note CH-1" className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type *</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={type} 
                onChange={(e) => setType(e.target.value as MaterialType)}
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
              value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details about the material..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject Category *</label>
              <Input required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. ICE202, VLSI" className="bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester (Optional)</label>
              <Input value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. 3, 5" className="bg-background" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">Upload File *</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-lg bg-background/50 relative hover:bg-accent/5 transition-colors">
              <div className="space-y-1 justify-center flex flex-col items-center">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <div className="flex text-sm text-muted-foreground">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:underline focus-within:outline-none">
                    <span>{file ? file.name : "Select a document to upload"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOCX, ZIP, PPTX up to 50MB
                </p>
              </div>
            </div>
          </div>

          {isLoading && uploadProgress > 0 && (
             <div className="w-full bg-muted rounded-full h-2 mt-4 overflow-hidden">
               <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
             </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading ? `Uploading... ${uploadProgress}%` : 'Publish Material'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

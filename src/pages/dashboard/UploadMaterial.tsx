import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db, storage } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { toast } from 'sonner';
import { MaterialType } from '../../types';
import { Upload } from 'lucide-react';

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

    try {
      const storageRef = ref(storage, `materials/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error caught:", error);
          toast.error(error.message, { duration: 10000 });
          setIsLoading(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            const publicUrl = await getDownloadURL(uploadTask.snapshot.ref);

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

            toast.success('Material uploaded successfully!');
            setTimeout(() => navigate('/dashboard/materials'), 500);
          } catch (dbError: any) {
            console.error("Database error:", dbError);
            toast.error(dbError.message || 'Failed to save material details');
          } finally {
            setIsLoading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error: any) {
      console.error("Initialization error caught:", error);
      toast.error(error.message, { duration: 10000 });
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

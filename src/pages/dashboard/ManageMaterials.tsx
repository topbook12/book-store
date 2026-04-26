import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, orderBy, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { toast } from 'sonner';
import { Trash2, Download } from 'lucide-react';
import { Material } from '../../types';

export default function ManageMaterials() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      navigate('/dashboard');
      toast.error('You do not have permission to manage materials');
      return;
    }

    fetchMaterials();
  }, [user, navigate]);

  const fetchMaterials = async () => {
    if (!user) return;
    try {
      // Admin sees all, Teacher sees only their own
      let q;
      if (user.role?.toUpperCase() === 'ADMIN') {
        q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'materials'), where('uploaderId', '==', user.uid));
      }
      
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Material, 'id'>) })) as Material[];
      
      if (user.role?.toUpperCase() !== 'ADMIN') {
        data.sort((a, b) => b.createdAt - a.createdAt);
      }
      
      setMaterials(data);
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn('Firestore permission denied while fetching materials in dashboard. Waiting for rules to update...');
        // Don't show toast for expected permission delays that resolve themselves
      } else {
        console.error(error);
        toast.error('Failed to load materials: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
      setMaterials(prev => prev.filter(m => m.id !== id));
      toast.success('Material deleted successfully');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to delete: ' + error.message);
    }
  };

  return (
    <Card className="border bg-card">
      <CardHeader>
        <CardTitle>Manage Materials</CardTitle>
        <CardDescription>
          {user?.role === 'ADMIN' ? 'As an Admin, you can view and delete any material on the platform.' : 'Manage your uploaded academic resources.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No materials found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">Title</th>
                  <th className="pb-3 px-4 font-semibold">Type</th>
                  {user?.role === 'ADMIN' && <th className="pb-3 px-4 font-semibold">Uploader</th>}
                  <th className="pb-3 px-4 font-semibold text-right">Date</th>
                  <th className="pb-3 pl-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 pr-4 font-medium max-w-[200px] truncate" title={m.title}>
                      {m.title}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-primary/20">
                        {m.type}
                      </span>
                    </td>
                    {user?.role === 'ADMIN' && <td className="py-3 px-4 text-muted-foreground">{m.uploaderName}</td>}
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                           <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                             <Download className="w-4 h-4" />
                           </a>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

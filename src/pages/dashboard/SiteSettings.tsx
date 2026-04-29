import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function SiteSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    developerName: 'Topu Biswas',
    developerLink: '#'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error: any) {
        toast.error('Failed to load settings', { description: error.message });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') {
      toast.error('Unauthorized', { description: 'Only admins can change settings.' });
      return;
    }
    try {
      setSaving(true);
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error('Failed to save settings', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center">Unauthorized. Admin access required.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 flex-col min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">Manage global application configurations</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border/50 pb-2">Footer Credits</h3>
            
            <div className="space-y-2">
              <label htmlFor="developerName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Developer Name</label>
              <Input 
                id="developerName" 
                value={settings.developerName} 
                onChange={(e) => setSettings({...settings, developerName: e.target.value})} 
                placeholder="e.g. Topu Biswas"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="developerLink" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Developer Link</label>
              <Input 
                id="developerLink" 
                value={settings.developerLink} 
                onChange={(e) => setSettings({...settings, developerLink: e.target.value})} 
                placeholder="e.g. https://github.com/..."
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto self-start mt-4">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Settings"}
          </Button>

        </form>
      </div>
    </motion.div>
  );
}

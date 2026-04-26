import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { toast } from 'sonner';

export default function UserManagement() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role?.toUpperCase() !== 'ADMIN') {
      navigate('/dashboard');
      toast.error('Only Administrators can access User Management');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn('Firestore permission denied while fetching users. Waiting for rules to update...');
      } else {
        console.error(error);
        toast.error('Failed to load users: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      if (userId === user?.uid) {
         toast.error("You cannot change your own role from here.");
         return;
      }
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      // Update local state instead of refetching everything to be faster
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole} successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update role: ' + error.message);
    }
  };

  return (
    <Card className="border bg-card">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all registered users and assign Teacher or Admin roles.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">User Name</th>
                  <th className="pb-3 px-4 font-semibold">Email</th>
                  <th className="pb-3 px-4 font-semibold text-center">Current Role</th>
                  <th className="pb-3 pl-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 pr-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {u.displayName?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      {u.displayName || 'Unknown User'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        u.role === 'TEACHER' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {u.role || 'STUDENT'}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <select
                        className="text-xs border rounded px-2 py-1 bg-background text-foreground focus:ring-primary focus:outline-none cursor-pointer"
                        value={u.role || 'STUDENT'}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        disabled={u.id === user?.uid}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                      </select>
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

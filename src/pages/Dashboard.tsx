import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UploadMaterial from './dashboard/UploadMaterial';
import UserManagement from './dashboard/UserManagement';
import ManageMaterials from './dashboard/ManageMaterials';
import { cn } from '../lib/utils';
import { LayoutDashboard, Library, Users, Settings, Bell, Upload, ChevronRight, Lock, ShieldCheck, Globe, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, getCountFromServer, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Material, Notice } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    activeStudents: 0,
    facultyUploads: 0, // We'll count teachers
    totalDownloads: 0
  });
  const [recentResources, setRecentResources] = useState<Material[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch stats
        const materialsSnapshot = await getDocs(collection(db, 'materials'));
        const materialsCount = materialsSnapshot.size;
        let downloadsCount = 0;
        materialsSnapshot.forEach(doc => {
          downloadsCount += (doc.data().downloads || 0);
        });

        // Using simple snapshots because we don't have indexes set up for count aggregation on certain where clauses by default
        const usersRef = collection(db, 'users');
        const studentsQuery = query(usersRef, where('role', '==', 'STUDENT'));
        const teachersQuery = query(usersRef, where('role', '==', 'TEACHER'));
        
        const [studentsSnap, teachersSnap] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(teachersQuery)
        ]);

        setStats({
          totalMaterials: materialsCount,
          activeStudents: studentsSnap.size,
          facultyUploads: teachersSnap.size, // Renamed to "Active Faculty" below
          totalDownloads: downloadsCount
        });

        // Fetch recent resources
        const recentQ = query(collection(db, 'materials'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        const recentData = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
        setRecentResources(recentData);
        
        // Fetch notices (priority)
        // If we don't have notices yet, we could use empty array
        try {
          const noticesQ = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(3));
          const noticesSnap = await getDocs(noticesQ);
          const noticesData = noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
          setNotices(noticesData);
        } catch (e) {
          console.error("Error fetching notices:", e);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user]);

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[50vh]">
      <Lock className="w-12 h-12 mb-4 text-muted-foreground opacity-50" />
      <p>Secure Area. Please login to view this page.</p>
    </div>;
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const NavItem = ({ to, icon: Icon, children, isExternal }: any) => {
    const isActive = !isExternal && (location.pathname === to || (to === '/dashboard' && location.pathname === '/dashboard/'));
    
    if (isExternal) {
      return (
        <a 
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98] whitespace-nowrap",
            "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
          {children}
        </a>
      );
    }
    
    return (
      <Link 
        to={to} 
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98] whitespace-nowrap",
          isActive 
            ? "bg-primary text-primary-foreground shadow-md font-medium" 
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "")} />
        {children}
      </Link>
    );
  };

  const getMaterialColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'code': return 'bg-primary/10 text-primary';
      case 'pdf': return 'bg-red-500/10 text-red-500';
      case 'ppt':
      case 'slide': return 'bg-orange-500/10 text-orange-500';
      case 'book': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-64px)] bg-transparent pb-16 md:pb-0">
      {/* Mobile Top Scrollable Nav */}
      <div className="md:hidden sticky top-[60px] z-40 bg-card/80 backdrop-blur-md border-b border-border/50 py-3 px-4 overflow-x-auto no-scrollbar shadow-sm">
        <div className="flex gap-2">
          <NavItem to="/dashboard" icon={LayoutDashboard}>Overview</NavItem>
          <div className="w-px h-6 bg-border mx-1 self-center shrink-0" />
          {(user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'TEACHER') && (
            <>
              <NavItem to="/dashboard/upload" icon={Upload}>Upload</NavItem>
              <NavItem to="/dashboard/materials" icon={Library}>Manage Ref</NavItem>
            </>
          )}
          {user.role?.toUpperCase() === 'ADMIN' && (
            <>
              <NavItem to="/dashboard/users" icon={Users}>Users</NavItem>
            </>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl p-6 shrink-0 flex-col">
        <nav className="flex flex-col gap-2 mb-8">
          <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard Overview</NavItem>
          
          {(user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'TEACHER') && (
            <>
              <div className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Management</div>
              <NavItem to="/dashboard/upload" icon={Upload}>Upload Material</NavItem>
              <NavItem to="/dashboard/materials" icon={Library}>Manage Materials</NavItem>
              <NavItem to="https://book-store.bookpreview12.workers.dev" icon={Globe} isExternal={true}>SRH (Department Site)</NavItem>
            </>
          )}

          {user.role?.toUpperCase() === 'ADMIN' && (
            <>
              <div className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administration</div>
              <NavItem to="/dashboard/users" icon={Users}>User Management</NavItem>
              <NavItem to="/dashboard/settings" icon={Settings}>Site Settings</NavItem>
            </>
          )}
        </nav>

        <div className="mt-auto pt-5 border-t border-border/50">
          <Link to="/dashboard/profile" className="flex items-center gap-3 bg-background border border-border/50 rounded-2xl p-3 hover:border-primary/50 transition-colors shadow-sm group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-black flex flex-col items-center justify-center text-xs font-bold shadow-inner">
              {getInitials(user.displayName || user.email)}
            </div>
            <div className="flex flex-col overflow-hidden max-w-[120px]">
              <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user.displayName || user.email.split('@')[0]}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{user.role}</span>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto [&::-webkit-scrollbar]:hidden">
        <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
          {(user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'TEACHER') && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 text-foreground px-4 md:px-5 py-4 rounded-2xl flex items-start sm:items-center gap-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldCheck className="w-24 h-24 text-primary" />
              </div>
              <span className="relative flex h-3 w-3 mt-1 sm:mt-0 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <p className="text-sm">
                <strong className="text-primary">{user.role} Access Active:</strong> You have elevated privileges to upload materials and manage system resources.
              </p>
            </motion.div>
          )}
          
          <Routes>
            <Route path="/" element={
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}
                className="flex flex-col gap-6 md:gap-8"
              >
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">Digital Learning Resource Management System</p>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                      {[
                        { label: 'Total Materials', value: stats.totalMaterials },
                        { label: 'Active Students', value: stats.activeStudents },
                        { label: 'Active Faculty', value: stats.facultyUploads },
                        { label: 'Total Downloads', value: stats.totalDownloads }
                      ].map((stat, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          key={i} 
                          className="glass-panel rounded-2xl p-4 md:p-5 flex flex-col gap-2 hover:-translate-y-1 transition-transform duration-300"
                        >
                          <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</span>
                          <span className="text-2xl sm:text-4xl font-black text-foreground font-mono tracking-tight">{stat.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <section className="glass-panel rounded-3xl p-5 md:p-6 lg:col-span-2 flex flex-col gap-4 min-h-[300px]">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg md:text-xl font-bold tracking-tight">Recent Resources</h2>
                          <Link to="/materials" className="text-xs font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors active:scale-95">View All</Link>
                        </div>
                        <div className="overflow-x-auto no-scrollbar -mx-5 md:mx-0 px-5 md:px-0">
                          {recentResources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                              <p>No materials uploaded yet.</p>
                            </div>
                          ) : (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead>
                                <tr className="border-b border-border/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                  <th className="pb-3 pr-4">Material Title</th>
                                  <th className="pb-3 px-4">Type</th>
                                  <th className="pb-3 px-4">Uploader</th>
                                  <th className="pb-3 pl-4 text-right">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {recentResources.map((row) => (
                                  <tr key={row.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="py-4 pr-4 font-semibold text-foreground group-hover:text-primary transition-colors max-w-[200px] truncate">{row.title}</td>
                                    <td className="py-4 px-4"><span className={cn("px-2 py-1 rounded-md text-[10px] font-bold", getMaterialColor(row.type))}>{row.type}</span></td>
                                    <td className="py-4 px-4 text-muted-foreground max-w-[120px] truncate">{row.uploaderName}</td>
                                    <td className="py-4 pl-4 text-right text-muted-foreground font-mono text-xs">
                                      {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </section>

                      <section className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col gap-4">
                        <h2 className="text-lg md:text-xl font-bold tracking-tight mb-2">Priority Notices</h2>
                        <div className="flex flex-col gap-3">
                          {notices.length === 0 ? (
                            <div className="bg-background/50 border border-border/50 p-4 rounded-2xl text-center text-muted-foreground text-sm">
                              No recent notices.
                            </div>
                          ) : (
                            notices.map((notice) => (
                              <div key={notice.id} className={cn(
                                "bg-background/50 border border-border/50 p-4 rounded-2xl relative overflow-hidden group transition-colors",
                                notice.priority === 'Urgent' ? "hover:border-red-500/50" : "hover:border-primary/50"
                              )}>
                                <div className={cn(
                                  "absolute top-0 left-0 w-1 h-full",
                                  notice.priority === 'Urgent' ? "bg-red-500" : "bg-primary"
                                )} />
                                <p className={cn(
                                  "text-[10px] font-bold tracking-widest mb-1.5 uppercase",
                                  notice.priority === 'Urgent' ? "text-red-500" : "text-primary"
                                )}>
                                  {notice.priority} • {formatDistanceToNow(notice.createdAt, { addSuffix: true })}
                                </p>
                                <p className="text-sm font-medium leading-relaxed">{notice.content || notice.title}</p>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="mt-auto bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-2">
                           <div className="flex justify-between items-center">
                             <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">System</p>
                             <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Operational</span>
                           </div>
                           <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mt-1">
                             <div className="h-full bg-gradient-to-r from-primary to-emerald-500 w-[42%] rounded-full"></div>
                           </div>
                           <p className="text-[10px] text-muted-foreground font-mono mt-1 font-medium">System status normal</p>
                        </div>
                      </section>
                    </div>
                  </>
                )}
              </motion.div>
            } />
            <Route path="upload" element={<UploadMaterial />} />
            <Route path="materials" element={<ManageMaterials />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="profile" element={<div className="glass-panel p-8 rounded-3xl flex items-center justify-center min-h-[300px]">Profile settings coming soon...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

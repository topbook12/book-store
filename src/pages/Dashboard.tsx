import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UploadMaterial from './dashboard/UploadMaterial';
import UserManagement from './dashboard/UserManagement';
import ManageMaterials from './dashboard/ManageMaterials';
import { cn } from '../lib/utils';
import { LayoutDashboard, Library, Users, Settings, Bell, Upload, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[50vh]">
      <Lock className="w-12 h-12 mb-4 text-muted-foreground opacity-50" />
      <p>Secure Area. Please login to view this page.</p>
    </div>;
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const NavItem = ({ to, icon: Icon, children }: any) => {
    const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/dashboard/');
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

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-64px)] bg-background pb-16 md:pb-0">
      {/* Mobile Top Scrollable Nav */}
      <div className="md:hidden sticky top-[60px] z-40 bg-background border-b border-border/50 py-3 px-4 overflow-x-auto no-scrollbar shadow-sm">
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
              <NavItem to="/dashboard/notices" icon={Bell}>Priority Notices</NavItem>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex flex-col items-center justify-center text-xs font-bold shadow-inner">
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
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                  {[
                    { label: 'Total Materials', value: '1,248' },
                    { label: 'Active Students', value: '842' },
                    { label: 'Faculty Uploads', value: '156' },
                    { label: 'Total Downloads', value: '12.4k' }
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
                  <section className="glass-panel rounded-3xl p-5 md:p-6 lg:col-span-2 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg md:text-xl font-bold tracking-tight">Recent Resources</h2>
                      <button className="text-xs font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors active:scale-95">View All</button>
                    </div>
                    <div className="overflow-x-auto no-scrollbar -mx-5 md:mx-0 px-5 md:px-0">
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
                          {[
                            { title: 'Digital Library Project', type: 'CODE', uploader: 'Admin', date: 'Just now', color: 'bg-primary/10 text-primary' },
                            { title: 'VLSI Design manual', type: 'PDF', uploader: 'Prof. Rahman', date: '2 hrs ago', color: 'bg-red-500/10 text-red-500' },
                            { title: 'Optical Fiber Slide', type: 'PPT', uploader: 'Lecturer Sadia', date: '6 hrs ago', color: 'bg-orange-500/10 text-orange-500' }
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors group">
                              <td className="py-4 pr-4 font-semibold text-foreground group-hover:text-primary transition-colors">{row.title}</td>
                              <td className="py-4 px-4"><span className={cn("px-2 py-1 rounded-md text-[10px] font-bold", row.color)}>{row.type}</span></td>
                              <td className="py-4 px-4 text-muted-foreground">{row.uploader}</td>
                              <td className="py-4 pl-4 text-right text-muted-foreground font-mono text-xs">{row.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col gap-4">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight mb-2">Priority Notices</h2>
                    <div className="flex flex-col gap-3">
                      <div className="bg-background/50 border border-border/50 p-4 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <p className="text-[10px] text-primary font-bold tracking-widest mb-1.5 uppercase">URGENT • 10:45 AM</p>
                        <p className="text-sm font-medium leading-relaxed">The library system will undergo maintenance at 12:00 AM tonight.</p>
                      </div>
                      <div className="bg-background/50 border border-border/50 p-4 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <p className="text-[10px] text-green-500 font-bold tracking-widest mb-1.5 uppercase">ACADEMIC • OCT 24</p>
                        <p className="text-sm font-medium leading-relaxed">Final Year Project proposal submission deadline extended.</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-2">
                       <div className="flex justify-between items-center">
                         <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">System</p>
                         <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Operational</span>
                       </div>
                       <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mt-1">
                         <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[42%] rounded-full"></div>
                       </div>
                       <p className="text-[10px] text-muted-foreground font-mono mt-1 font-medium">Storage: 42% used</p>
                    </div>
                  </section>
                </div>
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

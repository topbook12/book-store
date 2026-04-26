import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UploadMaterial from './dashboard/UploadMaterial';
import UserManagement from './dashboard/UserManagement';
import ManageMaterials from './dashboard/ManageMaterials';
import { cn } from '../lib/utils';
import { LayoutDashboard, Library, Download, Users, Settings, Bell, Upload } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Please login to view this page.</div>;
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
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
          isActive 
            ? "bg-accent text-accent-foreground border border-accent/20 font-medium" 
            : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
        )}
      >
        <Icon className="w-4 h-4" />
        {children}
      </Link>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-background">
      {/* Sidebar sidebar */}
      <aside className="w-full md:w-64 border-r bg-card p-6 shrink-0 flex flex-col">
        <nav className="flex flex-col gap-2 mb-8">
          <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard Overview</NavItem>
          
          {(user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'TEACHER') && (
            <>
              <NavItem to="/dashboard/materials" icon={Library}>Manage Materials</NavItem>
              <NavItem to="/dashboard/upload" icon={Upload}>Upload Material</NavItem>
              <NavItem to="/dashboard/notices" icon={Bell}>Priority Notices</NavItem>
            </>
          )}

          {user.role?.toUpperCase() === 'ADMIN' && (
            <>
              <NavItem to="/dashboard/users" icon={Users}>User Management</NavItem>
              <NavItem to="/dashboard/settings" icon={Settings}>Site Settings</NavItem>
            </>
          )}
        </nav>

        <div className="mt-auto pt-5 border-t">
          <Link to="/dashboard/profile" className="flex items-center gap-3 bg-background border rounded-full px-3 py-2 hover:border-primary/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center text-[10px] font-bold">
              {getInitials(user.displayName || user.email)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user.displayName || user.email.split('@')[0]}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.role}</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {(user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'TEACHER') && (
            <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <p className="text-sm font-medium">
                <strong>{user.role} Privilege Active:</strong> You have elevated access to upload materials, manage notices, and access staff-only sections.
              </p>
            </div>
          )}
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Digital Learning Resource Management System</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[
                    { label: 'Total Materials', value: '1,248' },
                    { label: 'Active Students', value: '842' },
                    { label: 'Faculty Uploads', value: '156' },
                    { label: 'Total Downloads', value: '12.4k' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-card border rounded-xl p-5 flex flex-col gap-2">
                      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</span>
                      <span className="text-2xl sm:text-3xl font-bold text-primary font-mono">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <section className="bg-card border rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold">Recent Academic Resources</h2>
                      <button className="text-xs text-muted-foreground border px-3 py-1.5 rounded-md hover:bg-accent/10 transition-colors">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="pb-3 pr-4">Material Title</th>
                            <th className="pb-3 px-4">Type</th>
                            <th className="pb-3 px-4">Uploader</th>
                            <th className="pb-3 pl-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 pr-4 font-medium">Digital Library Project</td>
                            <td className="py-3 px-4"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">CODE</span></td>
                            <td className="py-3 px-4 text-muted-foreground">Admin</td>
                            <td className="py-3 pl-4 text-right text-muted-foreground">Just now</td>
                          </tr>
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 pr-4 font-medium">VLSI Design manual</td>
                            <td className="py-3 px-4"><span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">PDF</span></td>
                            <td className="py-3 px-4 text-muted-foreground">Prof. Rahman</td>
                            <td className="py-3 pl-4 text-right text-muted-foreground">2 hrs ago</td>
                          </tr>
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 pr-4 font-medium">Optical Fiber Slide</td>
                            <td className="py-3 px-4"><span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">PPT</span></td>
                            <td className="py-3 px-4 text-muted-foreground">Lecturer Sadia</td>
                            <td className="py-3 pl-4 text-right text-muted-foreground">6 hrs ago</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="bg-card border rounded-2xl p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold mb-2">Priority Notices</h2>
                    <div className="flex flex-col gap-3">
                      <div className="bg-white/5 border-l-4 border-l-primary p-3 rounded-r-lg shadow-sm">
                        <p className="text-[10px] text-muted-foreground font-semibold tracking-wider mb-1">URGENT • 10:45 AM</p>
                        <p className="text-sm">The library system will undergo maintenance at 12:00 AM tonight.</p>
                      </div>
                      <div className="bg-white/5 border-l-4 border-l-green-500 p-3 rounded-r-lg shadow-sm">
                        <p className="text-[10px] text-muted-foreground font-semibold tracking-wider mb-1">ACADEMIC • OCT 24</p>
                        <p className="text-sm">Final Year Project proposal submission deadline extended.</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto bg-primary/5 border border-dashed border-primary/30 rounded-xl p-4 flex flex-col gap-2">
                       <p className="text-xs font-bold text-primary">System Health</p>
                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[98%]"></div>
                       </div>
                       <p className="text-[10px] text-muted-foreground mt-1">Server: Operational • Storage: 42% used</p>
                    </div>
                  </section>
                </div>
              </div>
            } />
            <Route path="upload" element={<UploadMaterial />} />
            <Route path="materials" element={<ManageMaterials />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="profile" element={<div className="bg-card p-8 rounded-xl border">Profile settings coming soon...</div>} />
            {/* Add more nested routes here as they are built */}
          </Routes>
        </div>
      </main>
    </div>
  );
}

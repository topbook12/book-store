import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';
import { LogOut, Library, Bell, ShoppingCart, LayoutDashboard, Moon, Sun, Home, User, Menu, X, Download, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function Layout() {
  const { user } = useAuthStore();
  const { items, removeItem, clearCart } = useCartStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const downloadAllAttachments = async () => {
    if (items.length === 0) return;
    toast.success('Starting batch download...');
    for (const item of items) {
      try {
        const a = document.createElement('a');
        a.href = item.fileUrl;
        a.download = item.fileName || 'download';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise(resolve => setTimeout(resolve, 500)); // stagger downloads slightly
      } catch (err) {
        console.error("Failed to trigger download", err);
      }
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Library', path: '/materials', icon: Library },
    { name: 'Notices', path: '/notices', icon: Bell },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : [])
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 md:pb-0 overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-xl border-border/40 shadow-sm">
        <div className="container mx-auto px-4 h-[60px] md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-3 active:scale-95 transition-transform">
              <div className="w-8 h-8 rounded-xl logo-gradient shadow-lg"></div>
              <span className="font-extrabold tracking-tight text-lg md:text-xl text-foreground">ICE Dept.</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1 ml-4">
               {navItems.map((item) => {
                 const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                 return (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive ? 'secondary' : 'ghost'} 
                      className="gap-2 rounded-full px-4 font-semibold"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                 )
               })}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground rounded-full hover:bg-accent/50 hover:text-primary active:scale-90 transition-all">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
            
            <motion.div whileTap={{ scale: 0.9 }}>
              <button onClick={() => setIsCartOpen(true)} className="relative cursor-pointer hover:bg-accent p-2 md:p-2.5 rounded-full transition-colors flex items-center justify-center bg-secondary/50 md:bg-transparent">
                <ShoppingCart className="w-5 h-5 text-foreground/80 hover:text-primary" />
                {items.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 h-4 w-4 md:h-5 md:w-5 md:-translate-y-1 md:translate-x-1 rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground flex items-center justify-center shadow-md border-2 border-background"
                  >
                    {items.length}
                  </motion.span>
                )}
              </button>
            </motion.div>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-semibold">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="rounded-full font-semibold">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-md shadow-primary/20 font-bold px-6">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] sm:w-[400px] bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50 bg-muted/10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                     <ShoppingCart className="w-5 h-5" />
                   </div>
                   <h2 className="text-xl font-black">Download Cart</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full shadow-sm bg-background border">
                   <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 pb-32">
                 {items.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 opacity-50">
                     <ShoppingCart className="w-16 h-16" />
                     <p className="font-semibold text-lg">Your cart is empty</p>
                   </div>
                 ) : (
                   items.map(item => (
                     <div key={item.id} className="group relative flex gap-4 p-4 border border-border/50 rounded-2xl bg-background shadow-sm pr-12 transition-all hover:border-primary/50">
                        <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                           <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.type}</span>
                           <h4 className="text-sm font-bold truncate leading-snug text-foreground">{item.title}</h4>
                           <p className="text-xs text-muted-foreground truncate">{item.uploaderName}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   ))
                 )}
              </div>
              
              <div className="border-t border-border/50 p-4 md:p-6 bg-card sticky bottom-0 z-10 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
                 <div className="flex justify-between items-center mb-4 px-2">
                   <span className="font-semibold text-muted-foreground">Total items</span>
                   <span className="font-black text-xl">{items.length}</span>
                 </div>
                 <div className="flex gap-3">
                   <Button variant="outline" className="h-14 font-bold rounded-xl flex-1 text-destructive hover:bg-destructive/10 hover:border-destructive/30" onClick={clearCart} disabled={items.length === 0}>
                     Clear
                   </Button>
                   <Button className="h-14 font-black rounded-xl flex-[2] text-sm gap-2 shadow-xl shadow-primary/20" onClick={downloadAllAttachments} disabled={items.length === 0}>
                     <Download className="w-5 h-5" /> Download All
                   </Button>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/40 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center h-full space-y-1 active:scale-95 transition-transform relative"
              >
                <div className={cn("p-1.5 rounded-2xl transition-all duration-300", isActive ? 'bg-primary shadow-sm text-primary-foreground' : 'text-muted-foreground')}>
                  <item.icon className={cn("w-5 h-5", isActive ? 'scale-110 drop-shadow-sm' : '')} />
                </div>
                <span className={cn("text-[10px] font-bold transition-all", isActive ? 'text-primary' : 'text-muted-foreground opacity-70')}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-[1.5px] w-10 h-[3px] bg-primary rounded-b-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  />
                )}
              </Link>
            )
          })}
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center h-full space-y-1 active:scale-95 transition-transform text-muted-foreground hover:text-destructive group relative"
            >
              <div className="p-1.5 rounded-2xl transition-all duration-300">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold opacity-70 group-hover:opacity-100">Logout</span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="flex-1 flex flex-col items-center justify-center h-full space-y-1 active:scale-95 transition-transform text-muted-foreground group relative"
            >
              <div className="p-1.5 rounded-2xl transition-all duration-300">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold opacity-70 group-hover:opacity-100">Login</span>
            </Link>
          )}
        </div>
      </div>

      <footer className="hidden md:block border-t border-border/40 bg-card/50 backdrop-blur pb-env-safe top-safe">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 h-16 flex-row">
          <p className="text-sm font-medium text-muted-foreground">
            Built for ICE Department, Rajshahi University. 
          </p>
          <p className="text-sm font-medium text-muted-foreground">
             &copy; {new Date().getFullYear()} ICE Portal
          </p>
        </div>
      </footer>
    </div>
  );
}

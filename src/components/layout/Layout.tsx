import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';
import { LogOut, User, Library, Bell, ShoppingCart, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useTheme } from '../ThemeProvider';

export default function Layout() {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    signOut(auth);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md logo-gradient"></div>
              <span className="font-extrabold tracking-tight text-xl">ICE Dept.</span>
            </Link>
            <nav className="hidden md:flex gap-6 ml-4">
              <Link to="/materials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2">
                <Library className="w-4 h-4" /> Library
              </Link>
              <Link to="/notices" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2">
                <Bell className="w-4 h-4" /> Notices
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:bg-accent/10 hover:text-primary">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <div className="relative cursor-pointer hover:bg-accent/10 p-2 rounded-full transition-colors flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-muted-foreground hover:text-primary" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center -translate-y-1/4 translate-x-1/4">
                  {items.length}
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary hover:opacity-90 text-primary-foreground">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card py-6 md:py-0">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm leading-loose text-muted-foreground text-center md:text-left">
            Built for ICE Department, Rajshahi University. 
          </p>
          <p className="text-sm text-muted-foreground">
             &copy; {new Date().getFullYear()} ICE Portal
          </p>
        </div>
      </footer>
    </div>
  );
}

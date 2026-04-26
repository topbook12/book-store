import { motion } from 'motion/react';
import { Bell, Sparkles, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NoticeBoard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="container relative z-10 px-4 py-20 mx-auto flex flex-col items-center justify-center flex-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-[3rem] p-8 md:p-16 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Bell className="w-64 h-64 text-primary" />
          </div>

          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
            className="relative z-10 w-24 h-24 mx-auto bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-8 shadow-inner shadow-primary/20 backdrop-blur-md"
          >
            <Bell className="w-12 h-12" />
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 text-yellow-500"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Notice Board</h1>
          
          <div className="flex items-center justify-center gap-2 mb-8 text-primary font-semibold">
             <Clock className="w-5 h-5 flex-shrink-0" />
             <span>Feature currently under development</span>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-md mx-auto font-medium leading-relaxed">
            We are working hard to bring you real-time push notifications and priority alerts. Stay tuned!
          </p>

          <Button 
            onClick={() => navigate('/materials')}
            size="lg" 
            className="h-14 rounded-xl px-10 text-lg font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            Explore Materials in the meantime
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

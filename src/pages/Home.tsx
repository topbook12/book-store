import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Search, BookOpen, Download, ShieldCheck, ArrowRight, Sparkles, Zap, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const containerParams = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemParams = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-32 pb-24 md:pb-40 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] md:w-[600px] md:h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <motion.div style={{ y: y2 }} className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] md:w-[500px] md:h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={containerParams}
          style={{ opacity }}
          className="container mx-auto relative z-10 flex flex-col items-center justify-center text-center mt-12 md:mt-0"
        >
          <motion.div variants={itemParams} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-6 backdrop-blur-md border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to the future of learning</span>
          </motion.div>
          
          <motion.h1 variants={itemParams} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 md:mb-8 max-w-4xl leading-[1.1]">
            <span className="text-foreground">Information & </span>
            <span className="text-gradient block mt-2">Communication</span>
            <span className="text-foreground"> Engineering</span>
          </motion.h1>
          
          <motion.p variants={itemParams} className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl font-light px-4">
            A centralized digital library and learning platform for the brilliant minds of Rajshahi University.
          </motion.p>

          <motion.form variants={itemParams} onSubmit={handleSearch} className="w-full max-w-xl mx-auto relative group px-4 md:px-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center bg-card rounded-2xl border shadow-xl p-1.5 md:p-2 transition-all">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search materials, books..."
                  className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-12 bg-transparent h-12 md:h-14 text-base md:text-lg rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="default" className="rounded-xl px-5 md:px-8 h-12 md:h-14 font-semibold shadow-md active:scale-95 transition-transform bg-primary text-primary-foreground hover:opacity-90">
                <span className="hidden md:inline">Search</span>
                <Search className="w-5 h-5 md:hidden" />
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-12 md:py-32 px-4 relative z-20 -mt-10 md:mt-0">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[250px] md:auto-rows-[300px]">
            {/* Feature 1 - Large spanning */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 md:row-span-2 glass-panel p-6 md:p-10 rounded-3xl flex flex-col justify-between overflow-hidden relative group active:scale-[0.98] transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-6 text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <BookOpen className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">Vast Digital Library</h3>
                <p className="text-muted-foreground text-sm md:text-lg leading-relaxed max-w-xl">
                  Access every book, lecture note, slide deck, and past question from your curriculum. All categorized, searchable, and instantly accessible from your pocket.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-end relative overflow-hidden group active:scale-[0.98] transition-transform duration-300 bg-gradient-to-bl from-green-500/5 to-transparent"
            >
              <div className="absolute top-6 md:top-8 right-6 md:right-8 w-12 h-12 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Batch Download</h3>
              <p className="text-muted-foreground text-sm">Add to cart & download your entire semester's syllabus with a single tap.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-end relative overflow-hidden group active:scale-[0.98] transition-transform duration-300 bg-gradient-to-tr from-purple-500/5 to-transparent"
            >
              <div className="absolute top-6 md:top-8 left-6 md:left-8 w-12 h-12 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center group-hover:-rotate-12 transition-transform duration-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Secure Access</h3>
              <p className="text-muted-foreground text-sm">Role-based controls for teachers to manage content safely.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-8 md:p-20 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-64 h-64 text-primary" />
            </div>
            <div className="relative z-10 w-20 h-20 mx-auto bg-primary/20 text-primary rounded-3xl flex items-center justify-center mb-8 shadow-inner shadow-primary/20 backdrop-blur-md">
              <Layers className="w-10 h-10" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Ready to excel?</h2>
            <p className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
              Join your peers and get instant access to the best study materials tailored for ICE.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
              <Link to="/materials" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 md:h-16 px-8 md:px-10 rounded-2xl text-base md:text-lg font-bold gap-3 active:scale-95 transition-transform shadow-xl shadow-primary/25">
                  Explore Materials <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/notices" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full h-14 md:h-16 px-8 md:px-10 rounded-2xl text-base md:text-lg font-bold active:scale-95 transition-transform bg-secondary/80 hover:bg-secondary">
                  View Notices
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <div className="h-20 md:h-0" /> {/* Bottom Padding for Mobile Nav */}
    </div>
  );
}

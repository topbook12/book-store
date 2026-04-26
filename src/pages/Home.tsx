import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, BookOpen, Download, UserCheck, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:linear-gradient(0deg,background,transparent)] dark:bg-grid-slate-800/20" />
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gradient inline-block">
              Department of Information & Communication Engineering
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              A centralized digital library and learning platform for the students and teachers of Rajshahi University.
            </p>

            <form onSubmit={handleSearch} className="flex max-w-lg mx-auto bg-card rounded-lg border shadow-sm p-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search materials, books, questions..."
                  className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-10 bg-transparent h-12 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" className="rounded-md px-6 h-12 font-medium">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col text-left group hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Digital Library</h3>
              <p className="text-muted-foreground leading-relaxed">Access books, notes, slides, and syllabus from any semester directly from the cloud.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col text-left group hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Batch Download</h3>
              <p className="text-muted-foreground leading-relaxed">Add multiple materials to your cart and download them all at once seamlessly.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col text-left group hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Role Based Access</h3>
              <p className="text-muted-foreground leading-relaxed">Dedicated panels for Teachers to upload and Manage materials securely.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Start Learning?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/materials">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Browse Library <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/notices">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Notice Board
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

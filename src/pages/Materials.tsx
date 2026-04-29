import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Material, MaterialType } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Download, PlusCircle, Check, Filter, FileText, X, ChevronDown, Eye } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCartStore();
  
  // Filter States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Mobile Filter Drawer State
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Material[];
      setMaterials(data);
      setLoading(false);
    }, (error: any) => {
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        console.warn('Firestore permission denied while fetching materials. Waiting for rules to update...');
      } else {
        console.error('Error fetching materials:', error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Extracted unique values for dropdowns
  const uniqueCategories = useMemo(() => Array.from(new Set(materials.map(m => m.category).filter(Boolean))), [materials]);
  const uniqueUploaders = useMemo(() => Array.from(new Set(materials.map(m => m.uploaderName).filter(Boolean))), [materials]);

  const filteredMaterials = useMemo(() => {
    let result = materials.filter(m => {
      const matchesSearch = search ? 
        m.title.toLowerCase().includes(search.toLowerCase()) || 
        m.description?.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()) : true;
      
      const matchesType = typeFilter ? m.type === typeFilter : true;
      const matchesSemester = semesterFilter ? m.semester === semesterFilter : true;
      const matchesCat = categoryFilter ? m.category === categoryFilter : true;
      const matchesUploader = uploaderFilter ? m.uploaderName === uploaderFilter : true;
      
      return matchesSearch && matchesType && matchesSemester && matchesCat && matchesUploader;
    });

    if (sortOrder === 'oldest') {
      result = result.reverse();
    }

    return result;
  }, [materials, search, typeFilter, semesterFilter, categoryFilter, uploaderFilter, sortOrder]);

  const types: MaterialType[] = ['Book', 'Note', 'Lab Manual', 'Slide', 'Paper', 'Thesis', 'Question', 'Syllabus', 'Other'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Book': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Note': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Slide': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Question': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Paper': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-accent text-accent-foreground border-accent/20';
    }
  };

  const hasActiveFilters = semesterFilter || categoryFilter || uploaderFilter || typeFilter;

  const clearFilters = () => {
    setSemesterFilter('');
    setCategoryFilter('');
    setUploaderFilter('');
    setTypeFilter('');
    setSearch('');
  };

  return (
    <div className="flex flex-col flex-1 bg-transparent relative">
      {/* Top Hero Section */}
      <div className="border-b bg-card/60 backdrop-blur-xl relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:linear-gradient(0deg,background,transparent)] dark:bg-grid-slate-800/20" />
        <div className="container relative z-10 px-4 py-8 md:py-16 mx-auto text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3"
          >
            <span className="p-2 md:p-3 rounded-2xl bg-primary/10 text-primary relative shadow-inner">
              <FileText className="w-6 h-6 md:w-8 md:h-8" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </span>
            Document Portal
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="w-full max-w-3xl relative mt-4 mb-4 md:mb-6"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by title, desc..."
              className="w-full pl-14 h-14 md:h-16 rounded-[2rem] border-2 shadow-xl shadow-foreground/5 bg-background text-base focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary transition-all md:text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex w-full max-w-4xl overflow-x-auto no-scrollbar pb-2 md:pb-0 px-2 justify-start md:justify-center gap-2 "
          >
            <button 
              className={cn("px-4 py-2 shrink-0 rounded-full text-xs md:text-sm font-bold transition-all active:scale-95 shadow-sm border", typeFilter === '' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground hover:bg-accent/50 hover:text-foreground')}
              onClick={() => setTypeFilter('')}
            >
              All
            </button>
            {types.map(t => (
              <button 
                key={t}
                className={cn("px-4 py-2 shrink-0 rounded-full text-xs md:text-sm font-bold transition-all active:scale-95 shadow-sm border", typeFilter === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground hover:bg-accent/50 hover:text-foreground')}
                onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
              >
                {t}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 flex flex-col md:flex-row gap-8 items-start relative max-w-7xl">
        {/* Mobile Filter Button */}
        <div className="md:hidden w-full flex justify-between items-center bg-card rounded-2xl p-4 border shadow-sm sticky top-[68px] z-30 backdrop-blur-xl">
          <span className="text-sm font-bold text-foreground">Showing <span className="text-primary">{filteredMaterials.length}</span> results</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full gap-2 font-bold shadow-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </div>

        {/* Sidebar Filters */}
        <AnimatePresence>
          {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 768) && (
            <motion.aside 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-[280px] shrink-0 md:sticky top-24 z-20"
            >
              <div className="glass-panel border-border/50 shadow-sm rounded-3xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between font-bold text-lg border-b pb-4">
                  <div className="flex items-center gap-2">
                     <Filter className="w-5 h-5 text-primary" /> 
                     Filters
                  </div>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-destructive hover:underline font-semibold bg-destructive/10 px-2 py-1 rounded-md">Clear</button>
                  )}
                </div>

                {/* Semester Filter */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Semester</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['1','2','3','4','5','6','7','8'].map(sem => (
                      <button
                        key={sem}
                        className={cn("py-2.5 rounded-xl border text-sm font-black transition-all active:scale-95", semesterFilter === sem ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-background/50 hover:bg-accent/50 border-border/50')}
                        onClick={() => setSemesterFilter(semesterFilter === sem ? '' : sem)}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Filter */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Subject</h3>
                  <div className="relative">
                    <select 
                      className="w-full h-12 rounded-xl border-border/50 bg-background/50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Subjects</option>
                      {uniqueCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Teacher Filter */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Teacher</h3>
                  <div className="relative">
                    <select 
                      className="w-full h-12 rounded-xl border-border/50 bg-background/50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      value={uploaderFilter}
                      onChange={e => setUploaderFilter(e.target.value)}
                    >
                      <option value="">All Teachers</option>
                      {uniqueUploaders.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sort By</h3>
                  <div className="relative">
                    <select 
                      className="w-full h-12 rounded-xl border-border/50 bg-background/50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Grid Content */}
        <main className="flex-1 w-full relative">
          <div className="hidden md:flex mb-6 text-sm text-muted-foreground font-medium items-center justify-between">
            <span className="bg-card px-4 py-2 rounded-full border shadow-sm">Showing <span className="text-foreground font-bold">{filteredMaterials.length}</span> results</span>
          </div>

          {loading ? (
            <div className="flex justify-center flex-col items-center p-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground font-medium animate-pulse">Loading library...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 md:p-20 border-2 rounded-3xl border-dashed bg-card/30 flex flex-col items-center justify-center gap-6"
            >
              <div className="p-6 bg-background rounded-full shadow-inner">
                <Search className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground tracking-tight">No documents found</p>
              <p className="text-muted-foreground -mt-4 max-w-sm">We couldn't find any materials matching your current filters.</p>
              <Button onClick={clearFilters} className="rounded-full px-8 h-12 font-bold shadow-md shadow-primary/20">Reset Search</Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              <AnimatePresence>
                {filteredMaterials.map((material, idx) => {
                  const inCart = items.some(i => i.id === material.id);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 < 1 ? idx * 0.05 : 0 }}
                      key={material.id}
                    >
                      <Card className="flex flex-col h-full hover:border-primary/40 hover:shadow-xl transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden group">
                        <CardHeader className="pb-3 border-b border-border/30 bg-gradient-to-br from-background to-muted/20 relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex justify-between items-start mb-3 relative z-10">
                            <span className={cn("text-[10px] px-2.5 py-1 rounded-md border font-black uppercase tracking-widest shadow-sm", getTypeColor(material.type))}>
                              {material.type}
                            </span>
                            {material.semester && (
                              <span className="text-[10px] text-muted-foreground bg-background px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-border/50 shadow-sm">
                                Sem {material.semester}
                              </span>
                            )}
                          </div>
                          <CardTitle className="line-clamp-2 text-lg md:text-xl leading-tight group-hover:text-primary transition-colors relative z-10">
                            {material.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-5 flex-1 relative z-10">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-5 leading-relaxed">
                            {material.description || 'No description provided.'}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                            {material.category && (
                              <span className="bg-background text-muted-foreground border border-border/50 shadow-sm px-2.5 py-1 rounded-md">
                                {material.category}
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col pt-4 pb-5 px-5 border-t border-border/30 gap-4 bg-background/50 relative z-10">
                           <div className="flex items-center justify-between w-full text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                             <div className="flex flex-col gap-1">
                               <span className="text-foreground">{material.uploaderName}</span>
                               <span className="opacity-70">{new Date(material.createdAt).toLocaleDateString()}</span>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                               <span>{(material.size / 1024 / 1024).toFixed(1)} MB</span>
                               <span className="opacity-70">{material.downloads || 0} DLs</span>
                             </div>
                           </div>
                          <div className="flex items-center gap-2 w-full border-t border-border/30 pt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 h-11 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors hover:border-primary active:scale-95 px-0" 
                              asChild
                            >
                              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4 mr-1" /> View
                              </a>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 h-11 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors hover:border-primary active:scale-95 px-0" 
                              onClick={async () => {
                                toast.success("Welcome to Download File!", {
                                  description: `Starting download for ${material.title}... ICE Portal hopes you find this useful! 🚀`,
                                  duration: 3000,
                                });
                                try {
                                  // Fetch to trigger direct download, preventing navigation out of PWA
                                  const response = await fetch(material.fileUrl);
                                  const blob = await response.blob();
                                  const blobUrl = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = blobUrl;
                                  a.download = material.fileName || material.title || 'download';
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  window.URL.revokeObjectURL(blobUrl);
                                } catch (e) {
                                  // Fallback in case of CORS or other issues
                                  const a = document.createElement('a');
                                  a.href = material.fileUrl;
                                  a.download = material.fileName || material.title || 'download';
                                  a.target = '_blank';
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" /> Download
                            </Button>
                            <Button 
                              variant={inCart ? "secondary" : "default"} 
                              size="icon" 
                              className={cn("shrink-0 h-11 w-11 rounded-xl shadow-md active:scale-95 transition-all text-white", inCart ? 'bg-green-500 hover:bg-green-600' : 'bg-primary')}
                              onClick={() => !inCart && addItem(material)}
                              disabled={inCart}
                            >
                              {inCart ? <Check className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

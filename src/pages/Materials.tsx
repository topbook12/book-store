import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Material, MaterialType } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Download, PlusCircle, Check, Filter, FileText } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

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

  return (
    <div className="flex flex-col flex-1 bg-background">
      {/* Top Hero Section */}
      <div className="border-b bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:linear-gradient(0deg,background,transparent)] dark:bg-grid-slate-800/20" />
        <div className="container relative z-10 px-4 py-16 mx-auto text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary relative">
              <FileText className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </span>
            Document Portal
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6 text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Sync Active
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg pt-2">
            Browse and download lecture notes, textbooks, lab manuals, question papers, and more.
          </p>

          <div className="w-full max-w-3xl relative mb-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search documents by title or description..."
              className="w-full pl-14 h-14 rounded-full border shadow-sm bg-background/80 backdrop-blur text-base focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl">
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${typeFilter === '' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border hover:bg-accent'}`}
              onClick={() => setTypeFilter('')}
            >
              All
            </button>
            {types.map(t => (
              <button 
                key={t}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${typeFilter === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border hover:bg-accent text-muted-foreground'}`}
                onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-[280px] shrink-0 sticky top-24">
          <div className="bg-card border shadow-sm rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 font-bold text-lg border-b pb-4">
              <Filter className="w-5 h-5 text-primary" /> 
              Filters
            </div>

            {/* Semester Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flexItems-center gap-2">
                # Semester
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {['1','2','3','4','5','6','7','8'].map(sem => (
                  <button
                    key={sem}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all hover:border-primary/50 ${semesterFilter === sem ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-accent/50'}`}
                    onClick={() => setSemesterFilter(semesterFilter === sem ? '' : sem)}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Subject
              </h3>
              <select 
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="">All Subjects</option>
                {uniqueCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Teacher Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Teacher
              </h3>
              <select 
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={uploaderFilter}
                onChange={e => setUploaderFilter(e.target.value)}
              >
                <option value="">All Teachers</option>
                {uniqueUploaders.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Sort By
              </h3>
              <select 
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            {(semesterFilter || categoryFilter || uploaderFilter || typeFilter) && (
              <button 
                className="text-sm font-medium text-destructive hover:underline mt-2 text-center"
                onClick={() => {
                  setSemesterFilter('');
                  setCategoryFilter('');
                  setUploaderFilter('');
                  setTypeFilter('');
                  setSearch('');
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Grid Content */}
        <main className="flex-1 w-full relative">
          <div className="mb-6 text-sm text-muted-foreground font-medium flex items-center justify-between">
            <span>Showing <span className="text-foreground">{filteredMaterials.length}</span> results</span>
          </div>

          {loading ? (
            <div className="flex justify-center p-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center p-20 border rounded-2xl border-dashed bg-card/50 flex flex-col items-center justify-center gap-4">
              <Search className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">No documents found matching your filters.</p>
              <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter(''); setSemesterFilter(''); setCategoryFilter(''); setUploaderFilter(''); }}>Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredMaterials.map(material => {
                const inCart = items.some(i => i.id === material.id);
                return (
                  <Card key={material.id} className="flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-300 border bg-card">
                    <CardHeader className="pb-3 border-b border-border/40 bg-muted/10 rounded-t-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${getTypeColor(material.type)}`}>
                          {material.type}
                        </span>
                        {material.semester && (
                          <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider border">
                            Sem {material.semester}
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 text-base leading-tight group-hover:text-primary transition-colors pr-2">
                        {material.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                        {material.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-accent/50 text-muted-foreground border px-2 py-1 rounded flex items-center gap-1">
                           Cat: {material.category}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col pt-3 pb-4 px-4 border-t gap-3 bg-muted/10 rounded-b-xl mt-auto">
                       <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                         <div className="flex flex-col gap-0.5">
                           <span className="font-medium text-foreground">{material.uploaderName}</span>
                           <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                         </div>
                       </div>
                      <div className="flex items-center gap-2 w-full mt-2">
                        <Button variant="outline" size="sm" className="w-full gap-2 border-primary/20 hover:bg-primary hover:text-white transition-colors" asChild>
                          <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" /> View
                          </a>
                        </Button>
                        <Button 
                          variant={inCart ? "secondary" : "default"} 
                          size="sm" 
                          className={`shrink-0 ${inCart ? 'opacity-50' : ''}`}
                          onClick={() => !inCart && addItem(material)}
                          disabled={inCart}
                        >
                          {inCart ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

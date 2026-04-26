import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Toaster } from 'sonner';

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Materials from './pages/Materials';
import NoticeBoard from './pages/NoticeBoard';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const isMasterAdmin = firebaseUser.email === 'topubiswas.math@gmail.com';
        
        let userData: any = null;
        let docExists = false;

        try {
          const docSnap = await getDoc(docRef);
          docExists = docSnap.exists();
          if (docExists) {
            userData = docSnap.data();
          }
        } catch (error: any) {
          if (error?.message?.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
            console.warn("Firestore permission denied. Using local role fallback.");
          } else {
            console.error("Firestore getDoc error in Auth Listener:", error);
          }
        }
        
        if (docExists && userData) {
          const fetchedRole = (userData.role || 'STUDENT').toUpperCase();
          const mergedRole = isMasterAdmin ? 'ADMIN' : fetchedRole;
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            role: mergedRole,
          });

          // Sync database if role differs
          if (isMasterAdmin && userData.role !== 'ADMIN') {
            import('firebase/firestore').then(({ setDoc }) => {
              setDoc(docRef, { role: 'ADMIN' }, { merge: true }).catch(err => {
                if (err?.code !== 'permission-denied' && !err?.message?.includes('Missing')) {
                   console.error("Failed to sync admin role", err);
                }
              });
            });
          }
        } else {
          // Fallback if document doesn't exist or we don't have permission to read it yet
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isMasterAdmin ? 'ADMIN' : 'STUDENT',
          });

          // Attempt to create the user document
          import('firebase/firestore').then(({ setDoc }) => {
             setDoc(docRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: isMasterAdmin ? 'ADMIN' : 'STUDENT',
              createdAt: Date.now()
            }).catch(err => {
              if (err?.code !== 'permission-denied' && !err?.message?.includes('Missing')) {
                 console.error("Failed to initialize user document", err);
              }
            });
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="materials" element={<Materials />} />
          <Route path="notices" element={<NoticeBoard />} />
          <Route path="dashboard/*" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

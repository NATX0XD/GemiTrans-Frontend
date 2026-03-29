// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './configuration/firebase';
import { Languages, Loader2, Sparkles } from 'lucide-react';

// Import Layouts
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';

// Import Pages
import HomePage from './page/HomePage';
import HistoryPage from './page/HistoryPage';
import SavedWordsPage from './page/SavedWordsPage';
import NotebookPage from './page/NotebookPage';
import LoginPage from './page/LoginPage';
import RegisterPage from './page/RegisterPage';
import PageNotFound from './page/PageNotFound';
import { DataProvider } from './context/DataContext';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center animate-bounce duration-1000">
            <Languages className="text-teal-500" size={40} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Loader2 size={16} className="animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">AI Workbench</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <DataProvider>
      <Router>
        <Routes>

          {/* กลุ่ม Auth Routes (ไม่มี Header/Sidebar) */}
          <Route element={currentUser ? <Navigate to="/" /> : <AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* กลุ่ม Main App Routes (มี Header/Sidebar) */}
          <Route element={currentUser ? <MainLayout /> : <Navigate to="/login" />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/saved" element={<SavedWordsPage />} />
            <Route path="/notes" element={<NotebookPage />} />
            {/* ถ้ามีหน้าอื่นๆ เช่น <Route path="/users" element={<UsersPage />} /> ก็เอามาใส่ตรงนี้ได้เลย */}
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<PageNotFound />} />

        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
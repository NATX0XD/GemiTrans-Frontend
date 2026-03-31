// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './configuration/firebase';


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
import LandingPage from './page/LandingPage';
import PricingPage from './page/PricingPage';
import Loading from './page/Loading';

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
      <Loading />
    );
  }

  return (
    <DataProvider>
      <Router>
        <Routes>

         
          <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to="/app" />} />

          <Route element={currentUser ? <Navigate to="/app" /> : <AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={currentUser ? <MainLayout /> : <Navigate to="/login" />}>
            <Route path="/app" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/saved" element={<SavedWordsPage />} />
            <Route path="/notes" element={<NotebookPage />} />
          </Route>

          <Route path="/pricing" element={<PricingPage />} />

          <Route path="*" element={<PageNotFound />} />

        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
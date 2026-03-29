import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../configuration/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Input, Button } from "@heroui/react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          createdAt: new Date()
        });
      }
      navigate('/');
    } catch (err) {
      setError('Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-500/10 rounded-[2.5rem] relative overflow-hidden">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.91L22 12L15.09 15.09L12 22L8.91 15.09L2 12L8.91 8.91L12 2Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to Translation Workbench</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
             <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Email</label>
            <Input
              type="email"
              variant="faded"
              placeholder="Enter your email"
              value={email}
              onValueChange={setEmail}
              isRequired
              startContent={<Mail className="w-4 h-4 text-slate-400" />}
              classNames={{
                inputWrapper: "bg-white border-1.5 border-slate-300 hover:border-indigo-300 data-[focus=true]:border-indigo-500 data-[focus=true]:bg-white transition-all shadow-sm rounded-2xl h-12",
                input: "text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Password</label>
            <Input
              variant="faded"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
              isRequired
              startContent={<Lock className="w-4 h-4 text-slate-400" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              }
              classNames={{
                inputWrapper: "bg-white border-1.5 border-slate-300 hover:border-indigo-300 data-[focus=true]:border-indigo-500 data-[focus=true]:bg-white transition-all shadow-sm rounded-2xl h-12",
                input: "text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              }}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Link to="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            color="primary" 
            isLoading={loading}
            className="w-full bg-slate-900 border border-slate-800 text-white font-medium rounded-2xl py-6 hover:bg-slate-800 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 mb-8 flex items-center">
          <div className="flex-grow border-t border-slate-200/60"></div>
          <span className="px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-slate-200/60"></div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          isLoading={googleLoading}
          variant="faded"
          className="w-full bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl py-6 hover:bg-slate-50 transition-all shadow-sm"
          startContent={
            !googleLoading && (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.409 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z" />
                <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558l3.793 2.987z" />
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z" />
              </svg>
            )
          }
        >
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </Button>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-slate-900 border-b border-slate-900 pb-0.5 hover:opacity-70 transition-opacity">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
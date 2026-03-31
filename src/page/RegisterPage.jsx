import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../configuration/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, User, Mail, Lock, Globe, Calendar as CalendarIcon, ChevronDown, ArrowRight, ArrowLeft, ShieldCheck, Zap, Users, Languages } from "lucide-react";

const appName = process.env.REACT_APP_NAME || 'AI Workbench';

// -------------- FULL COUNTRY LIST --------------
const countryOptions = [
  { label: 'Afghanistan', value: 'AF' }, { label: 'Albania', value: 'AL' }, { label: 'Algeria', value: 'DZ' },
  { label: 'Argentina', value: 'AR' }, { label: 'Australia', value: 'AU' }, { label: 'Austria', value: 'AT' },
  { label: 'Bangladesh', value: 'BD' }, { label: 'Belgium', value: 'BE' }, { label: 'Brazil', value: 'BR' },
  { label: 'Brunei', value: 'BN' }, { label: 'Bulgaria', value: 'BG' }, { label: 'Cambodia', value: 'KH' },
  { label: 'Canada', value: 'CA' }, { label: 'Chile', value: 'CL' }, { label: 'China', value: 'CN' },
  { label: 'Colombia', value: 'CO' }, { label: 'Croatia', value: 'HR' }, { label: 'Czech Republic', value: 'CZ' },
  { label: 'Denmark', value: 'DK' }, { label: 'Egypt', value: 'EG' }, { label: 'Estonia', value: 'EE' },
  { label: 'Ethiopia', value: 'ET' }, { label: 'Finland', value: 'FI' }, { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' }, { label: 'Ghana', value: 'GH' }, { label: 'Greece', value: 'GR' },
  { label: 'Hong Kong', value: 'HK' }, { label: 'Hungary', value: 'HU' }, { label: 'Iceland', value: 'IS' },
  { label: 'India', value: 'IN' }, { label: 'Indonesia', value: 'ID' }, { label: 'Iran', value: 'IR' },
  { label: 'Iraq', value: 'IQ' }, { label: 'Ireland', value: 'IE' }, { label: 'Israel', value: 'IL' },
  { label: 'Italy', value: 'IT' }, { label: 'Japan', value: 'JP' }, { label: 'Jordan', value: 'JO' },
  { label: 'Kazakhstan', value: 'KZ' }, { label: 'Kenya', value: 'KE' }, { label: 'South Korea', value: 'KR' },
  { label: 'Kuwait', value: 'KW' }, { label: 'Laos', value: 'LA' }, { label: 'Latvia', value: 'LV' },
  { label: 'Lebanon', value: 'LB' }, { label: 'Lithuania', value: 'LT' }, { label: 'Luxembourg', value: 'LU' },
  { label: 'Malaysia', value: 'MY' }, { label: 'Mexico', value: 'MX' }, { label: 'Mongolia', value: 'MN' },
  { label: 'Morocco', value: 'MA' }, { label: 'Myanmar', value: 'MM' }, { label: 'Nepal', value: 'NP' },
  { label: 'Netherlands', value: 'NL' }, { label: 'New Zealand', value: 'NZ' }, { label: 'Nigeria', value: 'NG' },
  { label: 'Norway', value: 'NO' }, { label: 'Pakistan', value: 'PK' }, { label: 'Peru', value: 'PE' },
  { label: 'Philippines', value: 'PH' }, { label: 'Poland', value: 'PL' }, { label: 'Portugal', value: 'PT' },
  { label: 'Qatar', value: 'QA' }, { label: 'Romania', value: 'RO' }, { label: 'Russia', value: 'RU' },
  { label: 'Saudi Arabia', value: 'SA' }, { label: 'Singapore', value: 'SG' }, { label: 'Slovakia', value: 'SK' },
  { label: 'Slovenia', value: 'SI' }, { label: 'South Africa', value: 'ZA' }, { label: 'Spain', value: 'ES' },
  { label: 'Sri Lanka', value: 'LK' }, { label: 'Sweden', value: 'SE' }, { label: 'Switzerland', value: 'CH' },
  { label: 'Taiwan', value: 'TW' }, { label: 'Tanzania', value: 'TZ' }, { label: 'Thailand', value: 'TH' },
  { label: 'Turkey', value: 'TR' }, { label: 'Ukraine', value: 'UA' }, { label: 'United Arab Emirates', value: 'AE' },
  { label: 'United Kingdom', value: 'GB' }, { label: 'United States', value: 'US' }, { label: 'Uruguay', value: 'UY' },
  { label: 'Uzbekistan', value: 'UZ' }, { label: 'Venezuela', value: 'VE' }, { label: 'Vietnam', value: 'VN' },
  { label: 'Other', value: 'OTHER' },
];

// -------------- CUSTOM SELECT COMPONENT --------------
const CustomSelect = ({ label, icon: Icon, placeholder, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-sm font-semibold text-slate-700 ml-0.5">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-11 px-3.5 bg-slate-50 border rounded-xl transition-all flex items-center justify-between text-left focus:outline-none cursor-pointer ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-white' : 'border-slate-200 hover:border-indigo-300'}`}
        >
          <div className="flex items-center truncate overflow-hidden">
            {Icon && <Icon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />}
            <span className={`text-sm truncate ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
              {selectedLabel}
            </span>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2 z-50 flex flex-col gap-0.5 max-h-56 overflow-hidden">
            {/* Search */}
            {options.length > 10 && (
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 px-3 mb-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 font-medium outline-none focus:border-indigo-300"
                autoFocus
              />
            )}
            <div className="overflow-y-auto max-h-44 flex flex-col gap-0.5">
              {filtered.map((obj) => {
                const isSelected = value === obj.value;
                return (
                  <button
                    key={obj.value}
                    type="button"
                    onClick={() => {
                      onChange(obj.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border-0 cursor-pointer outline-none ${isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-transparent text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span className="truncate">{obj.label}</span>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 shrink-0"></div>
                    )}
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-3 font-medium">No results found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ---------------------------------------------------

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '',
    country: '', birthYear: '', birthMonth: '',
    email: '', password: '', confirmPassword: ''
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthOptions = months.map(m => ({ label: m, value: m }));
  const yearOptions = years.map(y => ({ label: y.toString(), value: y.toString() }));

  const handleNext = (e) => { e.preventDefault(); setStep(prev => prev + 1); };
  const handleBack = () => { setStep(prev => prev - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: `${formData.firstName} ${formData.lastName}` });
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName, lastName: formData.lastName,
        username: formData.username, country: formData.country,
        birthYear: formData.birthYear, birthMonth: formData.birthMonth,
        email: formData.email, createdAt: new Date()
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const StepperIndicator = () => (
    <div className="flex justify-center items-center gap-3 mb-10 w-full">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center gap-3 flex-1 last:flex-none">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= num ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 scale-105' : 'bg-slate-100 text-slate-400'}`}>
            {num}
          </div>
          {num < 3 && (
            <div className="h-[2px] flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500 ease-in-out ${step > num ? 'w-full' : 'w-0'}`}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const inputCls = "w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 font-medium transition-all outline-none";

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card Container */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-200/40 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white mb-5 shadow-lg shadow-indigo-600/20">
              <Languages size={25} />

            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium text-sm mt-1.5">Join {appName} — it's free</p>
          </div>

          <StepperIndicator />

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3 font-medium">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              {error}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : handleNext} className="min-h-[220px] flex flex-col justify-center">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-1.5 w-full">
                  <label className="block text-sm font-semibold text-slate-700 ml-0.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input placeholder="John" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1.5 w-full">
                  <label className="block text-sm font-semibold text-slate-700 ml-0.5">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input placeholder="Doe" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 ml-0.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm pointer-events-none">@</span>
                    <input placeholder="johndoe123" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 border-none cursor-pointer text-sm">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <CustomSelect label="Country" placeholder="Select your country" icon={Globe} value={formData.country} onChange={(val) => handleChange('country', val)} options={countryOptions} />
                <div className="flex gap-3">
                  <CustomSelect label="Birth Month" placeholder="Month" icon={CalendarIcon} value={formData.birthMonth} onChange={(val) => handleChange('birthMonth', val)} options={monthOptions} />
                  <CustomSelect label="Birth Year" placeholder="Year" value={formData.birthYear} onChange={(val) => handleChange('birthYear', val)} options={yearOptions} />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={handleBack} className="w-1/3 h-11 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 text-sm">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="submit" className="w-2/3 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 active:scale-[0.98] flex items-center justify-center gap-2 border-none cursor-pointer text-sm">
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 ml-0.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type="email" placeholder="name@example.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 ml-0.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type={isVisible ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required className="w-full h-11 pl-10 pr-12 bg-slate-50 border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 font-medium transition-all outline-none" />
                    <button className="absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none" type="button" onClick={toggleVisibility}>
                      {isVisible ? <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" /> : <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 ml-0.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type={isVisible ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" disabled={loading} onClick={handleBack} className="w-1/3 h-11 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="submit" disabled={loading} className="w-2/3 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 active:scale-[0.98] flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-60 text-sm">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Create Account <ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-xs font-semibold">SSL Encrypted</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-500" />
          <span className="text-xs font-semibold">Real-time AI</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold">Free to Use</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
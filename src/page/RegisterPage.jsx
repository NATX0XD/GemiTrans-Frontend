import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../configuration/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Input, Button } from "@heroui/react";
import { Eye, EyeOff, User, Mail, Lock, Globe, Calendar as CalendarIcon, ChevronDown } from "lucide-react";

// -------------- CUSTOM SELECT COMPONENT --------------
const CustomSelect = ({ label, icon: Icon, placeholder, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-sm font-semibold text-slate-700 ml-1">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-12 px-3 bg-white border-1.5 border-slate-300 hover:border-indigo-300 rounded-2xl transition-all shadow-sm flex items-center justify-between text-left focus:outline-none focus:border-indigo-500 ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
        >
          <div className="flex items-center truncate overflow-hidden">
             {Icon && <Icon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />}
             <span className={`text-sm tracking-wide truncate ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
               {selectedLabel}
             </span>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 flex flex-col gap-1 max-h-60 overflow-y-auto">
            {options.map((obj) => {
              const isSelected = value === obj.value;
              return (
                <button
                  key={obj.value}
                  type="button"
                  onClick={() => {
                    onChange(obj.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-0 cursor-pointer outline-none ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'bg-transparent text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{obj.label}</span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 shrink-0"></div>
                  )}
                </button>
              )
            })}
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
    firstName: '',
    lastName: '',
    username: '',
    country: '',
    birthYear: '',
    birthMonth: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Options formatting for CustomSelect
  const countryOptions = [
    { label: 'Thailand', value: 'Thailand' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Japan', value: 'Japan' },
    { label: 'Singapore', value: 'Singapore' },
    { label: 'Other Region', value: 'Other' },
  ];
  const monthOptions = months.map(m => ({ label: m, value: m }));
  const yearOptions = years.map(y => ({ label: y.toString(), value: y.toString() }));

  const handleNext = (e) => {
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

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

      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        country: formData.country,
        birthYear: formData.birthYear,
        birthMonth: formData.birthMonth,
        email: formData.email,
        createdAt: new Date()
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
    <div className="flex justify-center items-center gap-3 mb-10 w-full px-6">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center gap-3 flex-1 last:flex-none">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${step >= num ? 'bg-slate-900 text-white scale-110 shadow-slate-900/20' : 'bg-slate-100 text-slate-400'}`}>
            {num}
          </div>
          {num < 3 && (
            <div className="h-[2px] flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full bg-slate-900 transition-all duration-500 ease-in-out ${step > num ? 'w-full' : 'w-0'}`}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const sharedInputClasses = {
    inputWrapper: "bg-white border-1.5 border-slate-300 hover:border-indigo-300 data-[focus=true]:border-indigo-500 data-[focus=true]:bg-white transition-all shadow-sm rounded-2xl h-12",
    input: "text-sm text-slate-800 placeholder:text-slate-400 font-medium"
  };

  return (
    <div className="w-full max-w-lg p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-500/10 rounded-[2.5rem] relative overflow-hidden">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-sans text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Join Translation Workbench today</p>
        </div>

        <StepperIndicator />

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
             <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="min-h-[220px] flex flex-col justify-center">
          
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex gap-4">
                <div className="space-y-1.5 w-full">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">First Name</label>
                  <Input
                    variant="faded"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onValueChange={(val) => handleSelectChange('firstName', val)}
                    isRequired
                    startContent={<User className="w-4 h-4 text-slate-400" />}
                    classNames={sharedInputClasses}
                  />
                </div>
                <div className="space-y-1.5 w-full">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                  <Input
                    variant="faded"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onValueChange={(val) => handleSelectChange('lastName', val)}
                    isRequired
                    classNames={sharedInputClasses}
                  />
                </div>
              </div>
              <div className="space-y-1.5 w-full">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Username</label>
                <Input
                  variant="faded"
                  name="username"
                  placeholder="johndoe123"
                  value={formData.username}
                  onValueChange={(val) => handleSelectChange('username', val)}
                  isRequired
                  startContent={<span className="text-slate-400 font-medium text-sm">@</span>}
                  classNames={sharedInputClasses}
                />
              </div>
              <Button type="submit" color="primary" className="w-full bg-slate-900 text-white font-medium rounded-2xl py-6 mt-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all">
                Continue to Next Step
              </Button>
            </div>
          )}

          {/* STEP 2: Demographics */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <CustomSelect
                label="Country"
                placeholder="Select your country"
                icon={Globe}
                value={formData.country}
                onChange={(val) => handleSelectChange('country', val)}
                options={countryOptions}
              />
              
              <div className="flex gap-4">
                <CustomSelect
                  label="Birth Month"
                  placeholder="Month"
                  icon={CalendarIcon}
                  value={formData.birthMonth}
                  onChange={(val) => handleSelectChange('birthMonth', val)}
                  options={monthOptions}
                />
                
                <CustomSelect
                  label="Birth Year"
                  placeholder="Year"
                  value={formData.birthYear}
                  onChange={(val) => handleSelectChange('birthYear', val)}
                  options={yearOptions}
                />
              </div>

              <div className="flex gap-4 mt-4 pt-2">
                <Button type="button" onClick={handleBack} variant="flat" className="w-1/3 bg-slate-100/80 text-slate-700 font-medium rounded-2xl py-6 hover:bg-slate-200/80">
                  Back
                </Button>
                <Button type="submit" color="primary" className="w-2/3 bg-slate-900 text-white font-medium rounded-2xl py-6 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Account */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5 w-full">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <Input
                  type="email"
                  variant="faded"
                  name="email"
                  value={formData.email}
                  placeholder="Enter your email"
                  onValueChange={(val) => handleSelectChange('email', val)}
                  isRequired
                  startContent={<Mail className="w-4 h-4 text-slate-400" />}
                  classNames={sharedInputClasses}
                />
              </div>
              
              <div className="space-y-1.5 w-full">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Password</label>
                <Input
                  variant="faded"
                  type={isVisible ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onValueChange={(val) => handleSelectChange('password', val)}
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
                  classNames={sharedInputClasses}
                />
              </div>

              <div className="space-y-1.5 w-full">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                <Input
                  variant="faded"
                  type={isVisible ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onValueChange={(val) => handleSelectChange('confirmPassword', val)}
                  isRequired
                  startContent={<Lock className="w-4 h-4 text-slate-400" />}
                  classNames={sharedInputClasses}
                />
              </div>

              <div className="flex gap-4 mt-4 pt-2">
                <Button type="button" isDisabled={loading} onClick={handleBack} variant="flat" className="w-1/3 bg-slate-100/80 text-slate-700 font-medium rounded-2xl py-6 hover:bg-slate-200/80">
                  Back
                </Button>
                <Button type="submit" color="primary" isLoading={loading} className="w-2/3 bg-primary text-white font-medium rounded-2xl py-6 shadow-[0_4px_14px_0_rgb(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all">
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 border-b border-slate-900 pb-0.5 hover:opacity-70 transition-opacity">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
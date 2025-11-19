
import React from 'react';
import { Logo } from './Logo';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft } from 'lucide-react';

interface RegistrationViewProps {
  language: Language;
  onRegister: () => void;
  onBack: () => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({ language, onRegister, onBack }) => {
  const t = TRANSLATIONS[language].auth;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validation and API call would happen here
    onRegister();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <button 
        onClick={onBack} 
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">{t.backToLogin}</span>
      </button>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <div className="scale-75 mb-4 inline-block">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{t.registerTitle}</h2>
          <p className="text-slate-400 mt-2">{t.registerSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.company}</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="ACME Corp"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.email}</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="ceo@acme.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.password}</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-cyan-900/20 transition-all transform active:scale-[0.98]"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
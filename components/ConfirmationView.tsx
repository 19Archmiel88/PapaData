
import React from 'react';
import { Logo } from './Logo';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

interface ConfirmationViewProps {
  language: Language;
  onBackToHome: () => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ language, onBackToHome }) => {
  const t = TRANSLATIONS[language].confirmation;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-200">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-lg w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-10 shadow-2xl text-center relative overflow-hidden">
            {/* Top Highlight Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>

            <div className="mb-8 flex justify-center">
                <div className="relative">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 relative z-10">
                        <Mail size={40} className="text-cyan-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-slate-900 z-20">
                        <CheckCircle2 size={20} className="text-slate-950" strokeWidth={3} />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t.title}</h2>
            
            <p className="text-slate-400 text-base leading-relaxed mb-8">
                {t.message}
            </p>

            <button 
                onClick={onBackToHome}
                className="w-full group flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-lg transition-all border border-slate-700 hover:border-slate-600"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t.btn}</span>
            </button>
        </div>
        
        <div className="mt-8 flex justify-center">
             <div className="scale-75 opacity-50">
                <Logo />
             </div>
        </div>
      </div>
    </div>
  );
};

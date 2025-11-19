
import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PromoPopupProps {
  language: Language;
  onRegister: () => void;
}

export const PromoPopup: React.FC<PromoPopupProps> = ({ language, onRegister }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const t = TRANSLATIONS[language].landing.promo;

  useEffect(() => {
    // Show after 3 seconds
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleAction = () => {
      handleClose();
      onRegister();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>
      
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-cyan-500/20 relative transform transition-all duration-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-8">
        
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 animate-bounce">
                <Gift size={32} className="text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">
                {t.title}
            </h3>
            
            <p className="text-slate-300 mb-8 leading-relaxed">
                {t.text}
            </p>

            <div className="flex flex-col w-full gap-3">
                <button 
                    onClick={handleAction}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
                >
                    {t.btn}
                </button>
                <button 
                    onClick={handleClose}
                    className="w-full py-3 text-slate-400 hover:text-white text-sm transition-colors"
                >
                    {t.maybeLater}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

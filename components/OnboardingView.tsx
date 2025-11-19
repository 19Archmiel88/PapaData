
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, MOCK_INTEGRATIONS, INTEGRATION_FIELDS } from '../constants';
import { PDIcon } from './Logo';
import { 
  BarChart3, 
  ShoppingCart, 
  Database, 
  Megaphone, 
  Cloud, 
  Facebook, 
  ShoppingBag,
  Layers,
  Video,
  Package,
  Tags,
  CheckCircle2,
  ArrowRight,
  Lock,
  ArrowLeft
} from 'lucide-react';

// Icon mapping reused
const ICON_MAP: Record<string, React.ElementType> = {
  'BarChart3': BarChart3,
  'ShoppingCart': ShoppingCart,
  'Database': Database,
  'Megaphone': Megaphone,
  'Cloud': Cloud,
  'Facebook': Facebook,
  'ShoppingBag': ShoppingBag,
  'Layers': Layers,
  'Video': Video,
  'Package': Package,
  'Tags': Tags
};

interface OnboardingViewProps {
  language: Language;
  onFinish: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ language, onFinish }) => {
  const t = TRANSLATIONS[language].auth;
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filter relevant integrations for onboarding (excluding DW for now as it's destination)
  const onboardingOptions = MOCK_INTEGRATIONS.filter(i => i.type === 'source');

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedIds.length === 0) return;
    setStep(2);
  };

  const handleBack = () => {
    if (step > 1) {
        setStep(step - 1);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit configurations logic here
    onFinish();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <div className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <PDIcon size={28} />
           <span className="font-bold text-lg tracking-tight">
                <span className="text-white">Papa</span><span className="text-cyan-400">Data</span>
           </span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-sm">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step === 1 ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-green-500 text-slate-950'}`}>
                 {step > 1 ? <CheckCircle2 size={18} /> : '1'}
              </div>
              <span className={`${step === 1 ? 'text-white font-medium' : 'text-slate-500'}`}>{t.step1Title}</span>
              <div className="w-8 h-px bg-slate-700"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step === 2 ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500'}`}>2</div>
              <span className={`${step === 2 ? 'text-white font-medium' : 'text-slate-500'}`}>{t.step2Title}</span>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {step === 1 ? t.step1Title : t.step2Title}
            </h1>
            <p className="text-slate-400 text-lg">
              {step === 1 ? t.step1Subtitle : t.step2Subtitle}
            </p>
          </div>

          {/* STEP 1: Selection */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {onboardingOptions.map((integration) => {
                  const Icon = ICON_MAP[integration.icon] || Cloud;
                  const isSelected = selectedIds.includes(integration.id);
                  return (
                    <div 
                      key={integration.id}
                      onClick={() => toggleSelection(integration.id)}
                      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 group ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                          : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-cyan-400">
                          <CheckCircle2 size={24} fill="currentColor" className="text-slate-900" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{integration.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{integration.description}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={handleNext}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-cyan-900/20"
                >
                  {t.next} <ArrowRight size={20} />
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Configuration Forms */}
          {step === 2 && (
            <form onSubmit={handleFinish} className="max-w-3xl mx-auto space-y-8">
              {selectedIds.map(id => {
                const integration = MOCK_INTEGRATIONS.find(i => i.id === id);
                const Icon = ICON_MAP[integration?.icon || ''] || Cloud;
                const fields = INTEGRATION_FIELDS[id] || [];

                return (
                  <div key={id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 bg-slate-800 text-cyan-400 rounded-lg flex items-center justify-center">
                           <Icon size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{integration?.name} Configuration</h3>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map((field, idx) => (
                           <div key={idx} className={field.type === 'text' && fields.length === 1 ? 'col-span-2' : 'col-span-1'}>
                              <label className="block text-sm font-medium text-slate-400 mb-1.5 uppercase tracking-wide text-[10px]">{field.label}</label>
                              <div className="relative">
                                <input 
                                  type={field.type} 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                  placeholder={field.placeholder}
                                  required
                                />
                                {field.type === 'password' && (
                                   <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-6 px-4">
                 <button 
                   type="button"
                   onClick={handleBack}
                   className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2"
                 >
                    <ArrowLeft size={18} />
                    {t.previous}
                 </button>
                 
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-cyan-900/20 transform hover:-translate-y-1"
                >
                  {t.finish} <CheckCircle2 size={20} />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

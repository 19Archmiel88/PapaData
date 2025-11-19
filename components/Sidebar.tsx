
import React from 'react';
import { ViewState, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  LayoutDashboard, 
  Workflow, 
  FileText, 
  LogOut,
  Globe,
  Monitor
} from 'lucide-react';
import { PDIcon } from './Logo';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  language: Language;
  onToggleLanguage: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, language, onToggleLanguage, onSignOut }) => {
  const t = TRANSLATIONS[language].sidebar;

  const menuItems = [
    { id: ViewState.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
    { id: ViewState.LOOKER_STUDIO, label: t.lookerStudio, icon: Monitor },
    { id: ViewState.INTEGRATIONS, label: t.integrations, icon: Workflow },
    { id: ViewState.DOCS, label: t.docs, icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10 hidden md:flex">
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
            <PDIcon size={32} />
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-white">Papa</span><span className="text-cyan-400">Data</span>
            </h1>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="px-4 py-4">
        <button 
            onClick={onToggleLanguage}
            className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 transition-colors"
        >
            <div className="flex items-center space-x-2">
                <Globe size={14} />
                <span>Language</span>
            </div>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] uppercase">{language}</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm">{t.signOut}</span>
        </button>
        <div className="mt-4 text-xs text-slate-600 text-center">
          {t.version}
        </div>
      </div>
    </div>
  );
};
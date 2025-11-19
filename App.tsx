
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { IntegrationsView } from './components/IntegrationsView';
import { LookerStudioView } from './components/LookerStudioView';
import { Chatbot } from './components/Chatbot';
import { RegistrationView } from './components/RegistrationView';
import { OnboardingView } from './components/OnboardingView';
import { ConfirmationView } from './components/ConfirmationView';
import { PromoPopup } from './components/PromoPopup';
import { Logo, PDIcon } from './components/Logo';
import { analyzeData } from './services/geminiService';
import { ViewState, Language, AnalysisResult } from './types';
import { TRANSLATIONS } from './constants';
import { 
  Activity, 
  Database, 
  ChevronRight, 
  Menu,
  Layout,
  Server,
  GitBranch,
  Cloud,
  Code,
  Globe,
  User,
  Bell,
  UserPlus
} from 'lucide-react';

const App: React.FC = () => {
  // App State
  // "isLoggedIn" now signifies user is authenticated. 
  // "currentView" determines if they are in Landing, Register, Onboarding or Admin Panel.
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('pl');

  // Landing State
  const [inputData, setInputData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputData.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeData(inputData);
      setResult(data);
      // If analyzing from landing, scroll to result
      const element = document.getElementById('analyzer-output');
      if(element) element.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert("Failed to analyze data. Please check your API key configuration.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'en') return 'de';
      if (prev === 'de') return 'fr';
      if (prev === 'fr') return 'pl';
      return 'en';
    });
  };

  const handleLogin = () => {
      setIsLoggedIn(true);
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleRegisterStart = () => {
      setCurrentView(ViewState.REGISTER);
  };

  const handleRegisterComplete = () => {
      // After registration form
      setIsLoggedIn(true);
      setCurrentView(ViewState.ONBOARDING);
  };

  const handleOnboardingComplete = () => {
      // Transition to confirmation screen instead of dashboard
      setCurrentView(ViewState.CONFIRMATION);
  };

  const handleConfirmationBack = () => {
      setIsLoggedIn(false);
      setCurrentView(ViewState.LANDING);
  };

  const renderAdminView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <DashboardView language={language} />;
      case ViewState.INTEGRATIONS:
        return <IntegrationsView language={language} />;
      case ViewState.LOOKER_STUDIO:
        return <LookerStudioView language={language} />;
      case ViewState.DOCS:
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">{TRANSLATIONS[language].sidebar.docs}</h3>
                <p>{language === 'pl' ? 'Poproś chatbota o streszczenie.' : 'Ask the Chatbot to summarize.'}</p>
            </div>
        );
      default:
        return <DashboardView language={language} />;
    }
  };

  // Helper for Landing Page Architecture Cards (Dark Mode)
  const LandingArchCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; color: string }> = ({ title, icon: Icon, children, color }) => (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
      <div className={`absolute top-0 right-0 p-3 opacity-5 transform translate-x-2 -translate-y-2 ${color}`}>
        <Icon size={80} />
      </div>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg bg-slate-800 ${color}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-200">{title}</h3>
      </div>
      <div className="text-sm text-slate-400 leading-relaxed relative z-10">
        {children}
      </div>
    </div>
  );

  // ROUTING LOGIC

  // 1. Registration View
  if (currentView === ViewState.REGISTER) {
     return (
        <RegistrationView 
            language={language} 
            onRegister={handleRegisterComplete}
            onBack={() => setCurrentView(ViewState.LANDING)}
        />
     );
  }

  // 2. Onboarding View (User is logged in but needs to setup)
  if (currentView === ViewState.ONBOARDING) {
     return (
        <OnboardingView 
            language={language}
            onFinish={handleOnboardingComplete}
        />
     );
  }

  // 3. Confirmation View
  if (currentView === ViewState.CONFIRMATION) {
      return (
          <ConfirmationView 
            language={language}
            onBackToHome={handleConfirmationBack}
          />
      );
  }

  // 4. Landing Page
  if (!isLoggedIn && currentView === ViewState.LANDING) {
    const t = TRANSLATIONS[language].landing;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-white overflow-x-hidden font-sans">
        {/* Header / Navigation */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PDIcon size={32} />
              <span className="font-bold text-xl tracking-tight">
                <span className="text-white">Papa</span><span className="text-cyan-400">Data</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                <button onClick={handleLogin} className="hover:text-cyan-400 transition-colors">{t.nav.dashboard}</button>
                <button onClick={() => scrollToSection('architecture')} className="hover:text-cyan-400 transition-colors">{t.nav.architecture}</button>
                <button onClick={() => { handleLogin(); setCurrentView(ViewState.LOOKER_STUDIO); }} className="hover:text-cyan-400 transition-colors text-cyan-500 font-semibold">{t.nav.looker}</button>
              </div>
              
              <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

              {/* Landing Top Bar Language Switcher */}
              <button 
                onClick={toggleLanguage} 
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Globe size={16} />
                <span className="uppercase">{language}</span>
              </button>

              <div className="flex items-center gap-2">
                <button 
                    onClick={handleRegisterStart}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20"
                >
                    <UserPlus size={16} />
                    <span>{t.nav.register}</span>
                </button>

                <button 
                    onClick={handleLogin}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                    <User size={16} />
                    <span>{t.nav.account}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex flex-col items-center justify-start pt-12 pb-24 px-4">
          {/* Hero Section */}
          <div className="w-full max-w-4xl flex flex-col items-center mb-16 text-center">
            <div className="mb-8 scale-110 hover:scale-125 transition-transform duration-700 ease-in-out cursor-pointer">
              <Logo />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-6 tracking-tight">
              {t.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-8">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleRegisterStart}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2"
              >
                {t.hero.startBtn} <ChevronRight size={18}/>
              </button>
            </div>
          </div>

          {/* Main Analyzer Interface */}
          <div id="analyzer" className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl scroll-mt-24 mb-24">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="text-cyan-500" size={20} />
                <span className="font-mono text-sm text-slate-300 font-bold">{t.analyzer.module}</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Input Section */}
              <div className="flex flex-col gap-4">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.analyzer.inputLabel}</label>
                <textarea
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                  placeholder={t.analyzer.placeholder}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                />
                <button
                  disabled={loading || !inputData}
                  onClick={handleAnalyze}
                  className={`w-full py-3 rounded-lg font-bold tracking-wide transition-all flex items-center justify-center gap-2
                    ${loading 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20'
                    }`}
                >
                  {loading ? (
                    <>
                      <span className="block w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                      {t.analyzer.processing}
                    </>
                  ) : (
                    t.analyzer.btn
                  )}
                </button>
              </div>

              {/* Output Section */}
              <div id="analyzer-output" className="flex flex-col gap-4">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.analyzer.outputLabel}</label>
                <div className={`w-full h-full min-h-[256px] bg-slate-950/50 border border-slate-800 rounded-lg p-6 relative ${!result ? 'flex items-center justify-center' : ''}`}>
                    
                    {!result && !loading && (
                      <div className="text-center text-slate-600">
                        <Database size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-mono text-sm">{t.analyzer.awaiting}</p>
                      </div>
                    )}

                    {loading && (
                      <div className="text-center space-y-4">
                        <div className="inline-block relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-mono text-sm text-cyan-400 animate-pulse">{t.analyzer.connecting}</p>
                      </div>
                    )}

                    {result && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        
                        <div>
                          <h4 className="text-xs font-bold text-cyan-500 uppercase mb-2">{t.analyzer.summary}</h4>
                          <p className="text-slate-300 leading-relaxed">{result.summary}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-cyan-500 uppercase mb-2">{t.analyzer.insights}</h4>
                          <ul className="space-y-2">
                            {result.keyInsights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-cyan-500 mt-1">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900 p-3 rounded border border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">{t.analyzer.sentiment}</h4>
                            <span className={`font-mono text-sm font-bold uppercase ${
                              result.sentiment === 'positive' ? 'text-green-400' : 
                              result.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {result.sentiment}
                            </span>
                          </div>
                          <div className="bg-slate-900 p-3 rounded border border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">{t.analyzer.confidence}</h4>
                            <span className="font-mono text-sm font-bold text-cyan-400">98.4%</span>
                          </div>
                        </div>

                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Section - Now on Landing Page */}
          <div id="architecture" className="w-full max-w-7xl scroll-mt-24">
             <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.arch.title}</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                   {t.arch.subtitle}
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LandingArchCard title={t.cards.frontend.title} icon={Layout} color="text-blue-400">
                  <p>{t.cards.frontend.desc}</p>
                  <ul className="mt-4 list-disc list-inside text-slate-500 text-xs space-y-2">
                    {t.cards.frontend.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </LandingArchCard>

                <LandingArchCard title={t.cards.backend.title} icon={Server} color="text-green-400">
                  <p>{t.cards.backend.desc}</p>
                  <ul className="mt-4 list-disc list-inside text-slate-500 text-xs space-y-2">
                    {t.cards.backend.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </LandingArchCard>

                <LandingArchCard title={t.cards.etl.title} icon={GitBranch} color="text-purple-400">
                  <p>{t.cards.etl.desc}</p>
                  <ul className="mt-4 list-disc list-inside text-slate-500 text-xs space-y-2">
                    {t.cards.etl.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </LandingArchCard>

                <LandingArchCard title={t.cards.infra.title} icon={Cloud} color="text-orange-400">
                  <p>{t.cards.infra.desc}</p>
                  <ul className="mt-4 list-disc list-inside text-slate-500 text-xs space-y-2">
                    {t.cards.infra.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </LandingArchCard>

                <LandingArchCard title={t.cards.storage.title} icon={Database} color="text-cyan-400">
                  <p>{t.cards.storage.desc}</p>
                  <ul className="mt-4 list-disc list-inside text-slate-500 text-xs space-y-2">
                    {t.cards.storage.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </LandingArchCard>

                <LandingArchCard title={t.cards.contracts.title} icon={Code} color="text-rose-400">
                  <p>{t.cards.contracts.desc}</p>
                  <ul className="mt-4 list-disc list-inside text-slate-500 text-xs space-y-2">
                    {t.cards.contracts.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </LandingArchCard>
             </div>
          </div>
        </main>

        {/* Promo Popup for Guests */}
        <PromoPopup language={language} onRegister={handleRegisterStart} />

        {/* AI Chatbot Overlay */}
        <Chatbot language={language} /> 
      </div>
    );
  }

  // 5. ADMIN DASHBOARD RENDER
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Desktop */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        language={language}
        onToggleLanguage={toggleLanguage}
        onSignOut={() => { setIsLoggedIn(false); setCurrentView(ViewState.LANDING); }}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 z-30 transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar 
            currentView={currentView} 
            onChangeView={(view) => { setCurrentView(view); setSidebarOpen(false); }}
            language={language}
            onToggleLanguage={toggleLanguage}
            onSignOut={() => { setIsLoggedIn(false); setCurrentView(ViewState.LANDING); }}
         />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        {/* Admin Top Bar (Desktop & Mobile) */}
        <div className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 mr-2 text-slate-600">
                    <Menu size={24} />
                </button>
                <h2 className="text-lg font-semibold text-slate-800">
                    {currentView === ViewState.DASHBOARD && TRANSLATIONS[language].sidebar.dashboard}
                    {currentView === ViewState.LOOKER_STUDIO && 'Looker Studio'}
                    {currentView === ViewState.INTEGRATIONS && TRANSLATIONS[language].sidebar.integrations}
                    {currentView === ViewState.DOCS && TRANSLATIONS[language].sidebar.docs}
                </h2>
            </div>

            <div className="flex items-center space-x-4">
                {/* Language Switcher REMOVED per request (left side only) */}

                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer">
                    AD
                </div>
            </div>
        </div>

        <div className="p-4 md:p-8">
             {renderAdminView()}
        </div>
      </main>

      {/* AI Chatbot Overlay */}
      <Chatbot language={language} />
    </div>
  );
};

export default App;

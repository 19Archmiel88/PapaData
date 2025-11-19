
import React from 'react';
import { MOCK_INTEGRATIONS, TRANSLATIONS } from '../constants';
import { 
  BarChart3, 
  ShoppingCart, 
  Database, 
  Megaphone, 
  Cloud, 
  Facebook,
  CheckCircle2,
  PlusCircle,
  Clock,
  ShoppingBag,
  Layers,
  Video,
  Package,
  Tags
} from 'lucide-react';
import { Language, Integration } from '../types';

// Icon mapping
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

interface IntegrationsViewProps {
  language: Language;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].integrations;

  const renderIntegrationCard = (integration: Integration) => {
    const Icon = ICON_MAP[integration.icon] || Cloud;
    return (
      <div key={integration.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all relative overflow-hidden group">
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {integration.status === 'connected' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle2 size={12} className="mr-1" />
                {t.connected}
              </span>
            )}
            {integration.status === 'available' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                <PlusCircle size={12} className="mr-1" />
                {t.available}
              </span>
            )}
            {integration.status === 'coming_soon' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                <Clock size={12} className="mr-1" />
                {t.comingSoon}
              </span>
            )}
          </div>

        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
          integration.status === 'connected' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'
        }`}>
          <Icon size={24} />
        </div>

        <h3 className="text-lg font-bold text-slate-900">{integration.name}</h3>
        <p className="text-sm text-slate-600 mb-6 h-10 leading-relaxed mt-2 line-clamp-2">
          {integration.description}
        </p>

        <button 
          disabled={integration.status === 'coming_soon'}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            integration.status === 'connected' 
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
              : integration.status === 'coming_soon'
                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {integration.status === 'connected' ? t.configure : t.connect}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-slate-500 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Store Platforms Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-slate-800">{t.sections.storePlatforms}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_INTEGRATIONS.filter(i => i.category === 'ecommerce').map(renderIntegrationCard)}
        </div>
      </div>

      {/* Campaigns Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-slate-800">{t.sections.campaigns}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_INTEGRATIONS.filter(i => i.category === 'marketing').map(renderIntegrationCard)}
        </div>
      </div>

      {/* Warehouse Section (Optional/Infrastructure) */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-1 bg-slate-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-slate-800">{t.sections.warehouse}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_INTEGRATIONS.filter(i => i.category === 'warehouse').map(renderIntegrationCard)}
        </div>
      </div>

    </div>
  );
};

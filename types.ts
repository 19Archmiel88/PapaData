
export interface KPI {
  date: string;
  sessions: number;
  revenue: number;
  orders: number;
}

export interface ETLJobMetric {
  date: string;
  durationMinutes: number;
  rowsLoaded: number;
  rowsFailed: number;
}

export interface Integration {
  id: string;
  name: string;
  type: 'source' | 'destination';
  category: 'ecommerce' | 'marketing' | 'warehouse';
  status: 'connected' | 'available' | 'coming_soon';
  icon: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'onboarding' | 'inactive';
  integrations: string[];
  lastSync: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisResult {
  summary: string;
  keyInsights: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  recommendation?: string;
}

export enum ViewState {
  LANDING = 'LANDING',
  REGISTER = 'REGISTER',
  ONBOARDING = 'ONBOARDING',
  CONFIRMATION = 'CONFIRMATION',
  DASHBOARD = 'DASHBOARD',
  INTEGRATIONS = 'INTEGRATIONS',
  DOCS = 'DOCS',
  LOOKER_STUDIO = 'LOOKER_STUDIO'
}

export type Language = 'en' | 'pl' | 'de' | 'fr';
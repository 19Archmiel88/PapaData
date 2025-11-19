
import React from 'react';
import { Database, Cloud, Server, Code, Layout, GitBranch } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ArchitectureViewProps {
  language: Language;
}

const ArchitectureCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; color: string }> = ({ title, icon: Icon, children, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 ${color}`}>
      <Icon size={80} />
    </div>
    <div className="flex items-center space-x-3 mb-4">
      <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('opacity-10', '')} text-white`}>
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>
    <div className="text-sm text-slate-600 leading-relaxed relative z-10">
      {children}
    </div>
  </div>
);

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].architecture;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-slate-500 mt-1">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArchitectureCard title="Frontend (SPA)" icon={Layout} color="bg-blue-600">
          <p>React 19 + Vite application serving the Admin Panel.</p>
          <ul className="mt-2 list-disc list-inside text-slate-500 text-xs space-y-1">
            <li>TypeScript & Tailwind CSS</li>
            <li>Onboarding Wizard</li>
            <li>Visualization Components</li>
          </ul>
        </ArchitectureCard>

        <ArchitectureCard title="Backend (BFF)" icon={Server} color="bg-green-600">
          <p>Node.js Express API managing logic and BigQuery connection.</p>
          <ul className="mt-2 list-disc list-inside text-slate-500 text-xs space-y-1">
            <li>Rest API for Frontend</li>
            <li>Client Configuration Management</li>
            <li>Secret Management Proxy</li>
          </ul>
        </ArchitectureCard>

        <ArchitectureCard title="Data Processing (ETL)" icon={GitBranch} color="bg-purple-600">
          <p>Cloud Run services for extracting data from sources.</p>
          <ul className="mt-2 list-disc list-inside text-slate-500 text-xs space-y-1">
            <li>Google Analytics 4 ETL</li>
            <li>WooCommerce ETL</li>
            <li>Dataform for SQL Transformations</li>
          </ul>
        </ArchitectureCard>

        <ArchitectureCard title="Infrastructure (IaC)" icon={Cloud} color="bg-orange-600">
          <p>Terraform managed Google Cloud resources.</p>
          <ul className="mt-2 list-disc list-inside text-slate-500 text-xs space-y-1">
            <li>GCS Buckets (Raw, Staging, Curated)</li>
            <li>Cloud Build CI/CD Pipelines</li>
            <li>Artifact Registry</li>
          </ul>
        </ArchitectureCard>

         <ArchitectureCard title="Storage & Analytics" icon={Database} color="bg-cyan-600">
          <p>BigQuery as the central data warehouse.</p>
          <ul className="mt-2 list-disc list-inside text-slate-500 text-xs space-y-1">
            <li>Partitioned & Clustered Tables</li>
            <li>Daily Metric Aggregates</li>
            <li>KPI Views</li>
          </ul>
        </ArchitectureCard>

        <ArchitectureCard title="Data Contracts" icon={Code} color="bg-rose-600">
          <p>YAML definitions for schema and metrics.</p>
          <ul className="mt-2 list-disc list-inside text-slate-500 text-xs space-y-1">
            <li>metrics.yaml (SLA, Owners)</li>
            <li>reports.yaml (Dimensions)</li>
            <li>Automated Validation</li>
          </ul>
        </ArchitectureCard>
      </div>
      
      <div className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">{t.explore}</h3>
            <p className="text-slate-300 mb-6">
                {t.exploreText}
            </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-900 to-transparent opacity-50 pointer-events-none"></div>
      </div>
    </div>
  );
};

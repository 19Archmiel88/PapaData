import React from 'react';
import { MOCK_CLIENTS } from '../constants';
import { MoreVertical, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const ClientsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Client Management</h2>
          <p className="text-slate-500 mt-1">Manage onboarded clients, configurations and secrets.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Client
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Integrations</th>
                <th className="px-6 py-4">Last Sync</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CLIENTS.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{client.name}</div>
                        <div className="text-xs text-slate-500">ID: {client.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${client.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      ${client.status === 'onboarding' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${client.status === 'inactive' ? 'bg-slate-100 text-slate-600' : ''}
                    `}>
                      {client.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                      {client.status === 'onboarding' && <Clock size={12} className="mr-1" />}
                      {client.status === 'inactive' && <AlertCircle size={12} className="mr-1" />}
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      {client.integrations.length > 0 ? client.integrations.map(int => (
                        <span key={int} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                          {int}
                        </span>
                      )) : <span className="text-slate-400 text-xs italic">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {client.lastSync}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
           <span className="text-xs text-slate-500">Showing 4 clients</span>
           <div className="flex space-x-2">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

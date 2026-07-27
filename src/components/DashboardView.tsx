import React from 'react';
import { SalesOrder, SKU, LedgerAccount, BusinessEvent, Capability, TenantContext } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  Users,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  tenant: TenantContext;
  orders: SalesOrder[];
  skus: SKU[];
  accounts: LedgerAccount[];
  events: BusinessEvent[];
  capabilities: Capability[];
  onNavigate: (tab: any) => void;
  onQuickAiAsk: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tenant,
  orders,
  skus,
  accounts,
  events,
  capabilities,
  onNavigate,
  onQuickAiAsk,
}) => {
  const { t } = useLanguage();

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = skus.filter((s) => s.status === 'Low Stock' || s.status === 'Out of Stock').length;
  const cashBalance = accounts.find((a) => a.accountCode === '1010')?.balance || 0;
  const activeCaps = capabilities.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tenant.legalEntity}
            </span>
            <span className="text-slate-400 text-xs font-mono">Location: {tenant.locationName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t('dashboardTitle')}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t('dashboardSubtitle')} — <span className="text-indigo-400 font-bold">{activeCaps} {t('activeModules').toLowerCase()}</span>.
          </p>
        </div>

        {/* Quick AI Prompt Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onQuickAiAsk('Provide a 3-bullet executive summary of overall financial and inventory health.')}
            className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm uppercase tracking-tight"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Summary</span>
          </button>
          <button
            onClick={() => onQuickAiAsk('Analyze low stock items and suggest reorder quantities for our warehouses.')}
            className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm uppercase tracking-tight"
          >
            <Boxes className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Inventory Advice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Polished White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('grossRevenue')}</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4%</span>
            </div>
          </div>
        </div>


        {/* Card 2: Cash & Liquidity */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('cashReserve')}</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solvent & Liquid</span>
            </div>
          </div>
        </div>

        {/* Card 3: SKUs & Stock Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('activeInventory')}</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">{skus.length} SKU</div>
            <div className="flex items-center gap-1 text-xs font-medium mt-1">
              {lowStockCount > 0 ? (
                <span className="text-amber-600 font-bold">{lowStockCount} {t('lowStockAlerts')}</span>
              ) : (
                <span className="text-emerald-600">{t('inStock')}</span>
              )}
            </div>
          </div>
        </div>


        {/* Card 4: Orders & Events */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Processed Orders</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">{orders.length}</div>
            <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-1">
              <Activity className="w-3.5 h-3.5" />
              <span>{events.length} system events logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Operational Controls + Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Quick Actions & Capability Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Action Operations */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Operational Capability Launcher</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('sales')}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-indigo-700 font-bold text-sm group-hover:translate-x-0.5 transition-transform flex items-center justify-between">
                  <span>Create New Sale</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Issue quote, charge order, emit sale.completed</p>
              </button>

              <button
                onClick={() => onNavigate('inventory')}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-blue-700 font-bold text-sm group-hover:translate-x-0.5 transition-transform flex items-center justify-between">
                  <span>Manage Stock Levels</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Adjust warehouse quantities, review SKU reorder thresholds</p>
              </button>

              <button
                onClick={() => onNavigate('finance')}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-emerald-700 font-bold text-sm group-hover:translate-x-0.5 transition-transform flex items-center justify-between">
                  <span>General Ledger</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Inspect double-entry journal, post accounting entries</p>
              </button>
            </div>
          </div>

          {/* Active Capabilities Blueprint Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 italic">
                Active Capabilities Overview
              </h3>
              <button
                onClick={() => onNavigate('capabilities')}
                className="text-[11px] bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-indigo-600 transition-colors uppercase font-bold tracking-tight cursor-pointer"
              >
                Capability Registry ({capabilities.length})
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-widest">
                    <th className="pb-3 pl-2">ID</th>
                    <th className="pb-3">CAPABILITY</th>
                    <th className="pb-3">CATEGORY</th>
                    <th className="pb-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {capabilities.slice(0, 5).map((cap) => (
                    <tr key={cap.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 pl-2 font-mono text-slate-400">{cap.id}</td>
                      <td className="py-3 font-semibold text-slate-800">{cap.name}</td>
                      <td className="py-3 text-slate-500 uppercase font-medium text-[10px]">{cap.category}</td>
                      <td className="py-3 text-right font-mono text-[11px] text-emerald-600 font-bold">
                        ACTIVE v{cap.version}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Global Event Stream Terminal Box */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-lg p-5 flex flex-col border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 animate-pulse rounded-full" />
              Global Event Stream
            </h3>
            <button
              onClick={() => onNavigate('events')}
              className="text-[10px] text-indigo-400 hover:underline font-mono uppercase cursor-pointer"
            >
              Full Stream →
            </button>
          </div>

          <div className="space-y-3 font-mono text-[11px] max-h-[380px] overflow-y-auto pr-1">
            {events.slice().reverse().map((evt) => (
              <div key={evt.id} className="border-l-2 border-indigo-500 pl-3 py-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-indigo-400 font-bold">[{evt.timestamp.split('T')[1]?.slice(0, 8)}] {evt.eventType}</p>
                </div>
                <p className="text-slate-400 text-[10px]">Source: {evt.sourceCapability}</p>
                <div className="text-slate-300 text-[10px] bg-slate-950 p-1.5 rounded truncate">
                  Payload: {JSON.stringify(evt.payload)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

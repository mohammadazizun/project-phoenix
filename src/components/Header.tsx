import React from 'react';
import { TenantContext } from '../types';
import { Building2, MapPin, Sparkles, ShieldCheck, Activity, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language, SUPPORTED_LANGUAGES } from '../i18n/translations';

interface HeaderProps {
  tenants: TenantContext[];
  currentTenant: TenantContext;
  onSelectTenant: (tenant: TenantContext) => void;
  eventCount: number;
  onOpenAiAssistant: () => void;
  activeCapabilityCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  tenants,
  currentTenant,
  onSelectTenant,
  eventCount,
  onOpenAiAssistant,
  activeCapabilityCount,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-sm">
            PHX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight uppercase text-white">{t('brandTitle')}</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{t('brandSubtitle')}</p>
          </div>
        </div>

        {/* Tenant & Location Switcher */}
        <div className="hidden md:flex items-center gap-3 bg-slate-800/90 border border-slate-700 rounded-lg p-1.5 text-xs">
          <div className="flex items-center gap-1.5 px-2 text-slate-300 font-medium">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={currentTenant.organizationId}
              onChange={(e) => {
                const found = tenants.find((t) => t.organizationId === e.target.value);
                if (found) onSelectTenant(found);
              }}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {tenants.map((tenant) => (
                <option key={tenant.organizationId} value={tenant.organizationId} className="bg-slate-900 text-white">
                  {tenant.organizationName}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-1.5 px-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-300">{currentTenant.locationName}</span>
          </div>
        </div>

        {/* System Health, Language Switcher & Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Capabilities Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('activeModules')}: {activeCapabilityCount}</span>
          </div>

          {/* Event Stream Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{t('eventsCount')}: {eventCount}</span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-md px-2.5 py-1.5 text-xs transition-colors">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <select
              aria-label={t('languageLabel')}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Copilot Quick Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer uppercase tracking-tight"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">{t('aiCopilot')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


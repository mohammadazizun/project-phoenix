import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Landmark,
  Users,
  Sparkles,
  Sliders,
  Radio,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../i18n/translations';

export type TabType =
  | 'dashboard'
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'crm'
  | 'ai'
  | 'capabilities'
  | 'events'
  | 'architecture';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs: { id: TabType; translationKey: TranslationKey; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', translationKey: 'tabDashboard', icon: LayoutDashboard },
    { id: 'sales', translationKey: 'tabSales', icon: ShoppingCart },
    { id: 'inventory', translationKey: 'tabInventory', icon: Boxes },
    { id: 'finance', translationKey: 'tabFinance', icon: Landmark },
    { id: 'crm', translationKey: 'tabCrm', icon: Users },
    { id: 'ai', translationKey: 'tabAi', icon: Sparkles, badge: 'Gemini 3.6' },
    { id: 'capabilities', translationKey: 'tabCapabilities', icon: Sliders },
    { id: 'events', translationKey: 'tabEvents', icon: Radio },
    { id: 'architecture', translationKey: 'tabArchitecture', icon: BookOpen },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-300 sticky top-16 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t(tab.translationKey)}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};


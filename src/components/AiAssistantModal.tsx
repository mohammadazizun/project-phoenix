import React, { useState } from 'react';
import { Sparkles, X, Play, RefreshCw, Cpu, Globe } from 'lucide-react';
import { TenantContext } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Language, SUPPORTED_LANGUAGES } from '../i18n/translations';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantContext;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose, tenant }) => {
  const { language, setLanguage, t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          language,
          businessContext: { tenant },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data.result);
      }
    } catch (err) {
      console.error('AI Copilot request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white border-l border-slate-200 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Phoenix {t('aiCopilot')}</h3>
              <p className="text-xs text-slate-400 font-mono">Gemini 3.6 Flash Server Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector in modal */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('languageLabel')}:</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Preset Prompts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {language === 'id' ? 'Topik Bantuan Cepat:' : 'Quick Assistance Topics:'}
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() =>
                  handleAsk(
                    language === 'id'
                      ? 'Jelaskan prinsip utama Project Phoenix untuk UMKM.'
                      : 'What are the key principles of Project Phoenix?'
                  )
                }
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left text-slate-800 transition-colors cursor-pointer font-medium"
              >
                💡 {language === 'id' ? 'Prinsip Utama Project Phoenix' : 'Explain Project Phoenix Principles'}
              </button>
              <button
                onClick={() =>
                  handleAsk(
                    language === 'id'
                      ? 'Bagaimana arsitektur berbasis Event Bus bekerja di aplikasi ini?'
                      : 'How does the Event-Driven architecture work across capabilities?'
                  )
                }
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left text-slate-800 transition-colors cursor-pointer font-medium"
              >
                ⚡ {language === 'id' ? 'Penjelasan Arsitektur Event Bus' : 'Event Bus Architecture Explanation'}
              </button>
              <button
                onClick={() =>
                  handleAsk(
                    language === 'id'
                      ? 'Bagaimana cara menambahkan modul (Capability) baru ke sistem?'
                      : 'How can I add a new custom Capability extension to the OS?'
                  )
                }
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left text-slate-800 transition-colors cursor-pointer font-medium"
              >
                🧩 {language === 'id' ? 'Panduan Modul Ekstensi Baru' : 'Custom Extension Blueprint'}
              </button>
            </div>
          </div>

          {/* Response Box */}
          {response && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="font-bold text-indigo-700 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Cpu className="w-4 h-4" />
                <span>{language === 'id' ? 'Respon Otak Intelijen AI' : 'AI Operating Brain Response'}</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">{response.answer}</p>

              {response.keyTakeaways?.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <span className="font-bold uppercase text-[10px] text-slate-500">
                    {language === 'id' ? 'Poin Utama:' : 'Takeaways:'}
                  </span>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {response.keyTakeaways.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              placeholder={t('askAiPlaceholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !prompt.trim()}
              className="absolute bottom-2.5 right-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { SalesOrder, SKU, LedgerAccount, BusinessEvent, Capability, TenantContext } from '../types';
import { Sparkles, ShieldAlert, Cpu, CheckCircle2, Play, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface AiIntelligenceCenterProps {
  tenant: TenantContext;
  orders: SalesOrder[];
  skus: SKU[];
  accounts: LedgerAccount[];
  events: BusinessEvent[];
  capabilities: Capability[];
}

export const AiIntelligenceCenter: React.FC<AiIntelligenceCenterProps> = ({
  tenant,
  orders,
  skus,
  accounts,
  events,
  capabilities,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleRunAiQuery = async (customPrompt?: string) => {
    const queryToRun = customPrompt || userQuery;
    if (!queryToRun.trim()) return;

    setLoadingQuery(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryToRun,
          businessContext: {
            tenant,
            totalOrders: orders.length,
            revenue: orders.reduce((s, o) => s + o.total, 0),
            skusCount: skus.length,
            lowStockCount: skus.filter((s) => s.status !== 'In Stock').length,
            activeCapabilities: capabilities.map((c) => c.name),
          },
          eventStreamSummary: events.slice(-5),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.result);
      }
    } catch (err) {
      console.error('Error running AI Query:', err);
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleRunSystemAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            tenant,
            orderCount: orders.length,
            revenue: orders.reduce((s, o) => s + o.total, 0),
            skus: skus.map((s) => ({ code: s.skuCode, status: s.status })),
          },
          capabilities: capabilities.map((c) => ({ id: c.id, name: c.name, status: c.status })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAuditResult(data.auditReport);
      }
    } catch (err) {
      console.error('Error running AI Audit:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Capability Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">AI Native Intelligence Center Capability</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded">
              cap_ai_brain v3.0.0
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Server-side Gemini 3.6 Flash reasoning engine. Analyzes structured events across capabilities to detect anomalies, optimize supply chains, and answer executive natural-language queries.
          </p>
        </div>

        <button
          onClick={handleRunSystemAudit}
          disabled={loadingAudit}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow-sm transition-all cursor-pointer disabled:opacity-50 uppercase tracking-tight shrink-0"
        >
          {loadingAudit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          <span>Run Full AI System Audit</span>
        </button>
      </div>

      {/* Main Grid: AI Copilot Console + Audit Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Executive Natural Language Query Console */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Executive Operational Copilot</span>
              </h3>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                Gemini 3.6 Flash
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleRunAiQuery('Analyze our inventory reorder risk for the East Coast warehouse.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
              >
                Inventory Reorder Risk
              </button>
              <button
                onClick={() => handleRunAiQuery('How are our top sales performing compared to COGS margins?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
              >
                Margin Analysis
              </button>
              <button
                onClick={() => handleRunAiQuery('Propose 3 automated event workflows based on recent sale.completed events.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
              >
                Propose Event Workflows
              </button>
            </div>

            {/* Prompt Input */}
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Ask Project Phoenix AI Brain anything about your business metrics, events, or capabilities..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              <button
                onClick={() => handleRunAiQuery()}
                disabled={loadingQuery || !userQuery.trim()}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {loadingQuery ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Query AI</span>
                    <Play className="w-3 h-3 fill-white" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Response Box */}
          {aiResponse && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs mt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Copilot Analysis</span>
                </span>
                {aiResponse.anomalyFlag && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Anomaly Flagged
                  </span>
                )}
              </div>

              <p className="text-slate-800 leading-relaxed font-medium">{aiResponse.answer}</p>

              {aiResponse.keyTakeaways?.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Key Takeaways:</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                    {aiResponse.keyTakeaways.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResponse.recommendedActions?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Recommended Actions:</span>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.recommendedActions.map((act: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] text-indigo-700 font-medium flex items-center gap-1 shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-indigo-600" />
                        <span>[{act.capability || 'Core'}]: {act.action || act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Box: System & Financial AI Health Audit */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>AI System & Financial Audit Report</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {auditResult ? 'Audit Completed' : 'Click "Run Full AI System Audit"'}
            </span>
          </div>

          {!auditResult && !loadingAudit && (
            <div className="text-center py-12 space-y-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-500 max-w-xs mx-auto">
                Click "Run Full AI System Audit" above to analyze active capabilities, financial entries, and SKU thresholds using Gemini 3.6 Flash.
              </div>
            </div>
          )}

          {loadingAudit && (
            <div className="text-center py-12 space-y-3 bg-slate-50 rounded-lg border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Evaluating platform health & compliance...</p>
            </div>
          )}

          {auditResult && !loadingAudit && (
            <div className="space-y-4 text-xs">
              {/* Health Score Card */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Platform Health Score</span>
                  <div className="text-3xl font-black font-mono text-emerald-600 mt-1">
                    {auditResult.healthScore} / 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Risk Level</span>
                  <div className="px-3 py-1 mt-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {auditResult.riskLevel || 'LOW'}
                  </div>
                </div>
              </div>

              {/* Audit Summary */}
              <p className="text-slate-700 font-medium bg-slate-50 p-3 rounded-md border border-slate-200">
                {auditResult.summary}
              </p>

              {/* Findings */}
              {auditResult.findings?.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">System Findings:</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {auditResult.findings.map((f: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-700">{f.category}</span>
                          <span className="text-[9px] font-bold uppercase text-slate-500">{f.severity}</span>
                        </div>
                        <p className="text-slate-800 text-[11px]">{f.issue}</p>
                        <div className="text-[10px] text-emerald-700 font-mono">
                          Rec: {f.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

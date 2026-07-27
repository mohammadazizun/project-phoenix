import React, { useState } from 'react';
import { Capability } from '../types';
import { Sliders, CheckCircle2, XCircle, Layers, Plus, ArrowRight, ShieldCheck, Box } from 'lucide-react';

interface CapabilityRegistryProps {
  capabilities: Capability[];
  onToggleCapability: (id: string) => void;
  onAddCapability: (capability: Capability) => void;
}

export const CapabilityRegistry: React.FC<CapabilityRegistryProps> = ({
  capabilities,
  onToggleCapability,
  onAddCapability,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddExtensionModal, setShowAddExtensionModal] = useState(false);
  const [extName, setExtName] = useState('');
  const [extDesc, setExtDesc] = useState('');

  const categories = ['All', 'Core', 'Business', 'Intelligence', 'Extension'];

  const filteredCapabilities =
    filterCategory === 'All'
      ? capabilities
      : capabilities.filter((c) => c.category === filterCategory);

  const handleInstallExtension = () => {
    if (!extName) return;

    const newCap: Capability = {
      id: `cap_ext_${Date.now()}`,
      name: extName,
      category: 'Extension',
      version: '1.0.0',
      status: 'active',
      description: extDesc || 'Custom extension capability registered in Project Phoenix Business OS.',
      author: 'Custom Ecosystem Developer',
      dependencies: ['cap_org'],
      eventsEmitted: ['extension.action_performed'],
      eventsConsumed: ['sale.completed'],
    };

    onAddCapability(newCap);
    setShowAddExtensionModal(false);
    setExtName('');
    setExtDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Modular Capability Registry</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              "Everything is a Capability" Architecture
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Capabilities are independent, testable modules communicating exclusively through the Event Bus. Enable, disable, or attach custom extension blueprints.
          </p>
        </div>

        <button
          onClick={() => setShowAddExtensionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow-sm transition-all cursor-pointer uppercase tracking-tight shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Install Extension</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCapabilities.map((cap) => {
          const isActive = cap.status === 'active';

          return (
            <div
              key={cap.id}
              className={`bg-white border rounded-lg p-5 space-y-4 shadow-sm transition-all flex flex-col justify-between ${
                isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-indigo-700 border border-slate-200 rounded">
                    {cap.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">v{cap.version}</span>
                    <button
                      onClick={() => onToggleCapability(cap.id)}
                      className={`p-1 rounded-full cursor-pointer ${
                        isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isActive ? 'Deactivate Capability' : 'Activate Capability'}
                    >
                      {isActive ? <CheckCircle2 className="w-5 h-5 fill-emerald-100" /> : <XCircle className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900">{cap.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{cap.description}</p>
              </div>

              {/* Event Contracts & Dependencies */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px]">
                {cap.dependencies.length > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Depends on:</span>
                    <span className="font-mono text-slate-800">{cap.dependencies.join(', ')}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Events Emitted:</div>
                  <div className="flex flex-wrap gap-1">
                    {cap.eventsEmitted.map((evt) => (
                      <span key={evt} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Install Extension Modal */}
      {showAddExtensionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span>Register New Capability Extension</span>
              </h3>
              <button onClick={() => setShowAddExtensionModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Capability Name</label>
                <input
                  type="text"
                  placeholder="e.g. Automated Warehouse Robotics Dispatch"
                  value={extName}
                  onChange={(e) => setExtName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Capability Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the modular purpose and event listeners for this capability..."
                  value={extDesc}
                  onChange={(e) => setExtDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs font-bold">
              <button
                onClick={() => setShowAddExtensionModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInstallExtension}
                disabled={!extName}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50 text-slate-950 rounded-lg hover:from-amber-400 cursor-pointer"
              >
                Register Capability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

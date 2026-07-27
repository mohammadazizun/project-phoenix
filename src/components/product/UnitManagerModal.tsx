/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Measurement Units Master Management Modal
 */

import React, { useState } from 'react';
import { X, Ruler, Plus, Trash2, AlertCircle, Check, Lock } from 'lucide-react';
import { useProductContext } from '../../services/productEngine/ProductContext';

interface UnitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitManagerModal: React.FC<UnitManagerModalProps> = ({ isOpen, onClose }) => {
  const { units, createUnit, deleteUnit } = useProductContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [symbol, setSymbol] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createUnit({ name, code: code.toUpperCase(), symbol });
      if (!res.success) {
        setError(res.error || 'Failed to create unit');
      } else {
        setName('');
        setCode('');
        setSymbol('');
        setIsFormOpen(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, unitName: string) => {
    if (!window.confirm(`Are you sure you want to delete unit "${unitName}"?`)) return;
    const res = await deleteUnit(id);
    if (!res.success) {
      alert(res.error || 'Failed to delete unit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Measurement Units Standard</h3>
              <p className="text-xs text-slate-400">System and custom unit definitions for product inventory cataloging.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-semibold text-slate-200">Register Custom Measurement Unit</h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kilogram"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!code) setCode(e.target.value.toUpperCase().slice(0, 5));
                      if (!symbol) setSymbol(e.target.value.toLowerCase().slice(0, 4));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KG"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kg"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Saving...' : 'Create Unit'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Available Units: <strong className="text-slate-200">{units.length}</strong>
              </span>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Unit
              </button>
            </div>
          )}

          {/* List Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Unit Name</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-amber-400 font-medium">{unit.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{unit.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{unit.symbol}</td>
                    <td className="px-4 py-3">
                      {unit.isSystem ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          <Lock className="w-2.5 h-2.5" /> System
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!unit.isSystem ? (
                        <button
                          onClick={() => handleDelete(unit.id, unit.name)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Custom Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

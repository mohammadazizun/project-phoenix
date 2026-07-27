/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Tags Master Management Modal
 */

import React, { useState } from 'react';
import { X, Tag as TagIcon, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { useProductContext } from '../../services/productEngine/ProductContext';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLOR_OPTIONS = [
  { name: 'indigo', label: 'Indigo', bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { name: 'emerald', label: 'Emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { name: 'rose', label: 'Rose', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  { name: 'amber', label: 'Amber', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  { name: 'sky', label: 'Sky', bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
  { name: 'purple', label: 'Purple', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  { name: 'slate', label: 'Slate', bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
];

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose }) => {
  const { tags, createTag, deleteTag } = useProductContext();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createTag({ name: name.trim(), color: selectedColor });
      if (!res.success) {
        setError(res.error || 'Failed to create tag');
      } else {
        setName('');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!window.confirm(`Delete tag "${tagName}"?`)) return;
    await deleteTag(id);
  };

  const getColorMeta = (colorName: string) => {
    return TAG_COLOR_OPTIONS.find((c) => c.name === colorName) || TAG_COLOR_OPTIONS[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Product Tags Registry</h3>
              <p className="text-xs text-slate-400">Manage tags for visual classification and search filtering.</p>
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
          {/* Create Form */}
          <form onSubmit={handleCreate} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Create New Tag</h4>

            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Tag name e.g. High Margin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tag
              </button>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Color:</span>
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-5 h-5 rounded-full ${c.bg} ${c.border} border flex items-center justify-center transition-transform ${
                      selectedColor === c.name ? 'scale-125 ring-2 ring-white/50' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === c.name && <Check className={`w-3 h-3 ${c.text}`} />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Tags Cloud / List */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-3">
              Existing Tags ({tags.length})
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const meta = getColorMeta(t.color);
                return (
                  <span
                    key={t.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${meta.bg} ${meta.text} border ${meta.border}`}
                  >
                    <TagIcon className="w-3 h-3" />
                    <span>{t.name}</span>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="ml-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
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

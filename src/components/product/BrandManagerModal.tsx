/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Brand Master Management Modal
 */

import React, { useState } from 'react';
import { X, Bookmark, Plus, Edit2, Trash2, AlertCircle, Check, Globe, Image as ImageIcon } from 'lucide-react';
import { useProductContext } from '../../services/productEngine/ProductContext';
import { ProductBrand } from '../../services/productEngine/types';

interface BrandManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandManagerModal: React.FC<BrandManagerModalProps> = ({ isOpen, onClose }) => {
  const { brands, createBrand, updateBrand, deleteBrand } = useProductContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<ProductBrand | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setName('');
    setCode('');
    setLogoUrl('');
    setWebsite('');
    setDescription('');
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (brand: ProductBrand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setCode(brand.code);
    setLogoUrl(brand.logoUrl || '');
    setWebsite(brand.website || '');
    setDescription(brand.description || '');
    setError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingBrand) {
        const res = await updateBrand(editingBrand.id, { name, code, logoUrl, website, description });
        if (!res.success) {
          setError(res.error || 'Failed to update brand');
        } else {
          setIsFormOpen(false);
        }
      } else {
        const res = await createBrand({ name, code, logoUrl, website, description });
        if (!res.success) {
          setError(res.error || 'Failed to create brand');
        } else {
          setIsFormOpen(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Brand action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brandName}"?`)) return;
    const res = await deleteBrand(id);
    if (!res.success) {
      alert(res.error || 'Failed to delete brand');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Product Brands Register</h3>
              <p className="text-xs text-slate-400">Manage registered manufacturer brands, logos, and web domain links.</p>
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
                <h4 className="text-sm font-semibold text-slate-200">
                  {editingBrand ? 'Edit Brand' : 'Register New Brand'}
                </h4>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phoenix Core"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingBrand && !code) {
                        setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10));
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brand Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Logo URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Website Domain</label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                    <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional brand notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
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
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Registered Brands: <strong className="text-slate-200">{brands.length}</strong>
              </span>
              <button
                onClick={handleOpenCreate}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Brand
              </button>
            </div>
          )}

          {/* List Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No brands registered yet. Click "Add Brand" to create one.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="w-6 h-6 rounded object-cover border border-slate-700 bg-slate-900"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-[10px]">
                              {brand.code.slice(0, 2)}
                            </div>
                          )}
                          <span className="font-semibold text-slate-200">{brand.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-purple-400 font-medium">{brand.code}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            {brand.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(brand)}
                            className="p-1 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit Brand"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id, brand.name)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete Brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

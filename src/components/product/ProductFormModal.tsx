/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Form Modal with Category & Brand Master Lookup Integration (v3.5)
 */

import React, { useState, useEffect } from 'react';
import { X, Package, ShieldCheck, AlertCircle, Save, Loader2, FolderTree, Bookmark } from 'lucide-react';
import { ProductRecord, PRODUCT_UNITS, PRODUCT_STATUSES, PRODUCT_DEFAULTS } from '../../services/productEngine/types';
import { ProductValidator, ProductInputDTO } from '../../services/productEngine/ProductValidator';
import { TenantContext } from '../../types';
import { useProductContext } from '../../services/productEngine/ProductContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ProductInputDTO>) => Promise<{ success: boolean; error?: string; validationErrors?: string[] }>;
  initialData?: ProductRecord | null;
  tenant: TenantContext;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  tenant,
}) => {
  const { categories, brands, units } = useProductContext();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<Partial<ProductInputDTO>>({
    sku: '',
    barcode: '',
    productName: '',
    description: '',
    unit: PRODUCT_DEFAULTS.UNIT,
    basePrice: PRODUCT_DEFAULTS.BASE_PRICE,
    sellingPrice: PRODUCT_DEFAULTS.SELLING_PRICE,
    minimumStock: PRODUCT_DEFAULTS.MINIMUM_STOCK,
    status: PRODUCT_DEFAULTS.STATUS,
    categoryId: null,
    brandId: null,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku,
        barcode: initialData.barcode || '',
        productName: initialData.productName,
        description: initialData.description || '',
        unit: initialData.unit,
        basePrice: initialData.basePrice,
        sellingPrice: initialData.sellingPrice,
        minimumStock: initialData.minimumStock,
        status: initialData.status,
        categoryId: initialData.categoryId || null,
        brandId: initialData.brandId || null,
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: '',
        productName: '',
        description: '',
        unit: PRODUCT_DEFAULTS.UNIT,
        basePrice: 0,
        sellingPrice: 0,
        minimumStock: PRODUCT_DEFAULTS.MINIMUM_STOCK,
        status: 'active',
        categoryId: categories.length > 0 ? categories[0].id : null,
        brandId: brands.length > 0 ? brands[0].id : null,
      });
    }
    setValidationErrors([]);
    setServerError(null);
  }, [initialData, isOpen, categories, brands]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProductInputDTO, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setValidationErrors([]);
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setServerError(null);

    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    const selectedBrand = brands.find((b) => b.id === formData.brandId);

    const payload = {
      organizationId: tenant.organizationId,
      sku: (formData.sku || '').trim().toUpperCase(),
      barcode: formData.barcode ? formData.barcode.trim() : null,
      productName: (formData.productName || '').trim(),
      description: formData.description ? formData.description.trim() : null,
      unit: formData.unit || 'PCS',
      basePrice: Number(formData.basePrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      minimumStock: Number(formData.minimumStock) || 0,
      status: formData.status || 'active',
      categoryId: formData.categoryId || null,
      categoryName: selectedCat ? selectedCat.name : null,
      brandId: formData.brandId || null,
      brandName: selectedBrand ? selectedBrand.name : null,
    };

    // Client-side Zod validation check
    const validation = ProductValidator.validate(payload);
    if (!validation.success) {
      setValidationErrors('errors' in validation ? validation.errors : []);
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit(payload);
      if (res.success) {
        onClose();
      } else {
        if (res.validationErrors && res.validationErrors.length > 0) {
          setValidationErrors(res.validationErrors);
        } else {
          setServerError(res.error || 'Failed to save product record');
        }
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditMode ? 'Edit Catalog Product Record' : 'Register Catalog Product Item'}
              </h2>
              <p className="text-xs text-slate-400">
                Tenant: <span className="text-slate-200 font-mono">{tenant.organizationName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Server / Validation Error Alerts */}
          {(serverError || validationErrors.length > 0) && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Product Validation Issues</span>
              </div>
              {serverError && <p className="text-xs">{serverError}</p>}
              {validationErrors.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-300/90 font-mono">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Category & Brand Master Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-blue-400" />
                Category Classification
              </label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => handleChange('categoryId', e.target.value || null)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                Manufacturer Brand
              </label>
              <select
                value={formData.brandId || ''}
                onChange={(e) => handleChange('brandId', e.target.value || null)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
              >
                <option value="">Unbranded</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKU & Barcode Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                SKU Code <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                placeholder="e.g. PHX-EVO-PRO"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">Barcode (EAN/UPC)</label>
              <input
                type="text"
                value={formData.barcode || ''}
                onChange={(e) => handleChange('barcode', e.target.value)}
                placeholder="e.g. 88091234001"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              Product Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.productName || ''}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="e.g. Phoenix Industrial Edge Sensor Node"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">Description</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter product specs, technical notes, or sales description..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Unit, Minimum Stock, Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Measurement Unit <span className="text-indigo-400">*</span>
              </label>
              <select
                value={formData.unit || 'PCS'}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">Minimum Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.minimumStock ?? 0}
                onChange={(e) => handleChange('minimumStock', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Base Cost Price ({tenant.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice ?? 0}
                onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Selling Price ({tenant.currency}) <span className="text-indigo-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.sellingPrice ?? 0}
                onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>RLS Tenant Isolation Enforced</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Update Product' : 'Register Product'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

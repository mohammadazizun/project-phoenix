/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Catalog Detail View Drawer Component with Tabbed Sub-Views (v3.5)
 */

import React, { useState } from 'react';
import {
  X,
  Package,
  Barcode,
  Shield,
  Edit3,
  Trash2,
  Tag,
  DollarSign,
  FolderTree,
  Bookmark,
  Image as ImageIcon,
  Sliders,
  Database,
  Plus,
  Check,
  Star,
  Globe,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { ProductRecord, CatalogSettings } from '../../services/productEngine/types';
import { ProductMapper } from '../../services/productEngine/ProductMapper';
import { CatalogMapper } from '../../services/productEngine/CatalogMapper';
import { TenantContext } from '../../types';
import { useProductContext } from '../../services/productEngine/ProductContext';

interface ProductDetailDrawerProps {
  product: ProductRecord | null;
  onClose: () => void;
  onEdit: (product: ProductRecord) => void;
  onDelete: (product: ProductRecord) => void;
  tenant: TenantContext;
}

type TabType = 'overview' | 'images' | 'taxonomy' | 'metadata' | 'settings';

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  tenant,
}) => {
  const {
    categories,
    brands,
    assignCategoryAndBrand,
    addImage,
    removeImage,
    setPrimaryImage,
    updateProductTags,
    updateProductMetadata,
    updateProductSettings,
  } = useProductContext();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Image addition state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);

  // Taxonomy assignment state
  const [selectedCatId, setSelectedCatId] = useState(product?.categoryId || '');
  const [selectedBrandId, setSelectedBrandId] = useState(product?.brandId || '');
  const [isUpdatingTaxonomy, setIsUpdatingTaxonomy] = useState(false);

  // Metadata state
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');

  // Settings state
  const [settings, setSettings] = useState<CatalogSettings>(
    product?.settings || {
      allowDiscounts: true,
      isTaxable: true,
      taxRate: 10,
      trackSerialNumbers: false,
      barcodeType: 'EAN-13',
      allowBackorders: false,
      defaultLeadTimeDays: 7,
    }
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  if (!product) return null;

  const statusMeta = ProductMapper.getStatusMeta(product.status);
  const profitMargin = product.sellingPrice - product.basePrice;
  const marginPercentage = product.sellingPrice > 0 ? (profitMargin / product.sellingPrice) * 100 : 0;
  const primaryImgUrl = CatalogMapper.getPrimaryImageUrl(product);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setIsAddingImage(true);
    await addImage(product.id, newImageUrl.trim(), newImageAlt.trim() || undefined);
    setNewImageUrl('');
    setNewImageAlt('');
    setIsAddingImage(false);
  };

  const handleSaveTaxonomy = async () => {
    setIsUpdatingTaxonomy(true);
    await assignCategoryAndBrand(
      product.id,
      selectedCatId || null,
      selectedBrandId || null
    );
    setIsUpdatingTaxonomy(false);
  };

  const handleAddMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaKey.trim()) return;
    const currentMeta = product.metadata || {};
    const updatedMeta = { ...currentMeta, [metaKey.trim()]: metaValue.trim() };
    await updateProductMetadata(product.id, updatedMeta);
    setMetaKey('');
    setMetaValue('');
  };

  const handleDeleteMetadata = async (keyToDelete: string) => {
    const currentMeta = { ...(product.metadata || {}) };
    delete currentMeta[keyToDelete];
    await updateProductMetadata(product.id, currentMeta);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    await updateProductSettings(product.id, settings);
    setIsSavingSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <img
                src={primaryImgUrl}
                alt={product.productName}
                className="w-12 h-12 rounded-lg object-cover border border-slate-800 bg-slate-950 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate max-w-[240px]">
                    {product.productName}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusMeta.bgColor} ${statusMeta.color} ${statusMeta.borderColor}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                  <span>SKU: {product.sku}</span>
                  {product.categoryName && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400">{product.categoryName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800/80 pt-2 -mb-5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'images'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Gallery ({product.images?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'taxonomy'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Category & Brand
            </button>

            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'metadata'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Attributes
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>
        </div>

        {/* Drawer Body Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Description & Master Metadata */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-200">Product Description</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {product.description || 'No detailed product description entered for this catalog item.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs border-t border-slate-800/60">
                  {product.barcode && (
                    <span className="flex items-center gap-1 text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      <Barcode className="w-3.5 h-3.5 text-indigo-400" />
                      {product.barcode}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-bold text-slate-200">
                    Unit: {product.unit}
                  </span>
                  {product.brandName && (
                    <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      {product.brandName}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags Cloud */}
              {product.tags && product.tags.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-400" />
                    <span>Catalog Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800/80 text-slate-200 border border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Margin Matrix */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Financials & Margin Matrix</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Base Cost Price</div>
                    <div className="text-base font-bold text-slate-300 font-mono mt-1">
                      {ProductMapper.formatCurrency(product.basePrice, tenant.currency)}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Selling Price</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                      {ProductMapper.formatCurrency(product.sellingPrice, tenant.currency)}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase">Estimated Margin</span>
                    <div className="text-sm font-bold text-indigo-200 mt-0.5">
                      {ProductMapper.formatCurrency(profitMargin, tenant.currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">
                      {marginPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Metadata */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Tenant Isolation & Row Security</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span>Organization Scope:</span>
                  <span className="text-slate-300">{product.organizationId}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Created:</span>
                  <span>{new Date(product.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Last Modified:</span>
                  <span>{new Date(product.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE GALLERY */}
          {activeTab === 'images' && (
            <div className="space-y-5">
              {/* Add New Image Form */}
              <form onSubmit={handleAddImage} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>Attach Catalog Image URL</span>
                </h4>

                <div className="space-y-2">
                  <input
                    type="url"
                    required
                    placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Alt text description (optional)"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingImage || !newImageUrl.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach Image
                  </button>
                </div>
              </form>

              {/* Existing Gallery Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Catalog Assets ({product.images?.length || 0})
                </h4>

                {(!product.images || product.images.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No media assets attached yet. Enter an image URL above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {product.images.map((img) => (
                      <div
                        key={img.id}
                        className={`relative group rounded-xl border overflow-hidden bg-slate-950 ${
                          img.isPrimary ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.altText || 'Catalog image'}
                          className="w-full h-32 object-cover"
                          referrerPolicy="no-referrer"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          {img.isPrimary && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow">
                              <Star className="w-2.5 h-2.5 fill-current" /> Primary
                            </span>
                          )}
                        </div>

                        {/* Controls Overlay */}
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {!img.isPrimary && (
                            <button
                              onClick={() => setPrimaryImage(product.id, img.id)}
                              className="p-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-medium hover:bg-indigo-500 transition-colors"
                              title="Set as Primary"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(product.id, img.id)}
                            className="p-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-medium hover:bg-rose-500 transition-colors"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY & BRAND */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-blue-400" />
                  <span>Category & Brand Classification</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Product Category</label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Product Brand</label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
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

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveTaxonomy}
                    disabled={isUpdatingTaxonomy}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isUpdatingTaxonomy ? 'Saving...' : 'Update Assignments'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: METADATA ATTRIBUTES */}
          {activeTab === 'metadata' && (
            <div className="space-y-5">
              {/* Add Custom Attribute */}
              <form onSubmit={handleAddMetadata} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Add Key-Value Attribute</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Attribute Key (e.g. rackUnit)"
                    value={metaKey}
                    onChange={(e) => setMetaKey(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Value (e.g. 4U)"
                    value={metaValue}
                    onChange={(e) => setMetaValue(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!metaKey.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Attribute
                  </button>
                </div>
              </form>

              {/* Attributes Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Attribute Key</th>
                      <th className="px-4 py-2.5">Value</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(!product.metadata || Object.keys(product.metadata).length === 0) ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                          No custom metadata attributes defined.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(product.metadata).map(([k, v]) => (
                        <tr key={k} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-emerald-400 font-medium">{k}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-200">{String(v)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => handleDeleteMetadata(k)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                              title="Delete attribute"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span>Catalog Behavior Settings</span>
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <span className="text-xs font-medium text-slate-200">Allow Promotional Discounts</span>
                    <input
                      type="checkbox"
                      checked={settings.allowDiscounts}
                      onChange={(e) => setSettings({ ...settings, allowDiscounts: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <span className="text-xs font-medium text-slate-200">Taxable Item</span>
                    <input
                      type="checkbox"
                      checked={settings.isTaxable}
                      onChange={(e) => setSettings({ ...settings, isTaxable: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  {settings.isTaxable && (
                    <div className="pl-3 border-l-2 border-indigo-500/30">
                      <label className="block text-xs font-medium text-slate-300 mb-1">Standard Tax Rate (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={settings.taxRate}
                        onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                    <span className="text-xs font-medium text-slate-200">Track Item Serial Numbers</span>
                    <input
                      type="checkbox"
                      checked={settings.trackSerialNumbers}
                      onChange={(e) => setSettings({ ...settings, trackSerialNumbers: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Barcode Standard Format</label>
                    <select
                      value={settings.barcodeType}
                      onChange={(e) => setSettings({ ...settings, barcodeType: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="EAN-13">EAN-13 (Standard)</option>
                      <option value="UPC-A">UPC-A (North America)</option>
                      <option value="CODE-128">CODE-128 (Industrial)</option>
                      <option value="QR">QR Code (Matrix)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onDelete(product);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold transition-all cursor-pointer text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Soft Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

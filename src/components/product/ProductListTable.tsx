/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Catalog List Table with Image Thumbnails, Category & Brand Badges (v3.5)
 */

import React from 'react';
import {
  Package,
  Barcode,
  Shield,
  Info,
  Building2,
  Eye,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  FolderTree,
  Bookmark,
  Image as ImageIcon,
} from 'lucide-react';
import { ProductRecord, ProductSortField, ProductSortOrder } from '../../services/productEngine/types';
import { ProductMapper } from '../../services/productEngine/ProductMapper';
import { CatalogMapper } from '../../services/productEngine/CatalogMapper';
import { TenantContext } from '../../types';

interface ProductListTableProps {
  products: ProductRecord[];
  tenant: TenantContext;
  onViewProduct?: (product: ProductRecord) => void;
  onEditProduct?: (product: ProductRecord) => void;
  onDeleteProduct?: (product: ProductRecord) => void;
  sortField?: ProductSortField;
  sortOrder?: ProductSortOrder;
  onToggleSort?: (field: ProductSortField) => void;
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  products,
  tenant,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  sortField,
  sortOrder,
  onToggleSort,
}) => {
  const renderSortIndicator = (field: ProductSortField) => {
    if (!sortField || sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-400 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-400 font-bold" />
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Product Catalog Foundation Master List</h3>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            {products.length} Items Listed
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tenant: {tenant.organizationId}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 select-none">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Asset</th>
              <th
                onClick={() => onToggleSort && onToggleSort('sku')}
                className={`py-3 px-4 ${onToggleSort ? 'cursor-pointer hover:text-white transition-colors group' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <span>SKU / Barcode</span>
                  {renderSortIndicator('sku')}
                </div>
              </th>

              <th
                onClick={() => onToggleSort && onToggleSort('productName')}
                className={`py-3 px-4 ${onToggleSort ? 'cursor-pointer hover:text-white transition-colors group' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <span>Product Catalog Item</span>
                  {renderSortIndicator('productName')}
                </div>
              </th>

              <th className="py-3 px-4">Category & Brand</th>
              <th className="py-3 px-4">Unit</th>

              <th
                onClick={() => onToggleSort && onToggleSort('basePrice')}
                className={`py-3 px-4 text-right ${onToggleSort ? 'cursor-pointer hover:text-white transition-colors group' : ''}`}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Base Cost</span>
                  {renderSortIndicator('basePrice')}
                </div>
              </th>

              <th
                onClick={() => onToggleSort && onToggleSort('sellingPrice')}
                className={`py-3 px-4 text-right ${onToggleSort ? 'cursor-pointer hover:text-white transition-colors group' : ''}`}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Selling Price</span>
                  {renderSortIndicator('sellingPrice')}
                </div>
              </th>

              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {products.map((item) => {
              const statusMeta = ProductMapper.getStatusMeta(item.status);
              const primaryImgUrl = CatalogMapper.getPrimaryImageUrl(item);

              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Primary Image Asset Thumbnail */}
                  <td className="py-3 px-3 text-center">
                    <img
                      src={primaryImgUrl}
                      alt={item.productName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-800 bg-slate-950 mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </td>

                  {/* SKU / Barcode */}
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-indigo-400">{item.sku}</span>
                      {item.barcode ? (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Barcode className="w-3 h-3 text-slate-500" />
                          {item.barcode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono italic">No Barcode</span>
                      )}
                    </div>
                  </td>

                  {/* Product Name & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-white leading-tight">{item.productName}</div>
                    {item.description && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.description}</div>
                    )}
                  </td>

                  {/* Category & Brand Badges */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      {item.categoryName ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          <FolderTree className="w-2.5 h-2.5" />
                          {item.categoryName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Uncategorized</span>
                      )}

                      {item.brandName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          <Bookmark className="w-2.5 h-2.5" />
                          {item.brandName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                      {item.unit}
                    </span>
                  </td>

                  {/* Base Price */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {ProductMapper.formatCurrency(item.basePrice, tenant.currency)}
                  </td>

                  {/* Selling Price */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    {ProductMapper.formatCurrency(item.sellingPrice, tenant.currency)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusMeta.bgColor} ${statusMeta.color} ${statusMeta.borderColor}`}
                    >
                      {statusMeta.label}
                    </span>
                  </td>

                  {/* CRUD Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onViewProduct && (
                        <button
                          onClick={() => onViewProduct(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Product Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEditProduct && (
                        <button
                          onClick={() => onEditProduct(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Product Record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {onDeleteProduct && (
                        <button
                          onClick={() => onDeleteProduct(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Soft Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Product Catalog active for organization {tenant.organizationName}</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          PROJECT PHOENIX EXECUTION-014
        </div>
      </div>
    </div>
  );
};

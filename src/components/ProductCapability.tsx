/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Catalog Foundation Capability View Shell (v3.5)
 */

import React, { useState } from 'react';
import { TenantContext, BusinessEvent } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useProductBrowsing } from '../hooks/useProductBrowsing';
import { ProductPageHeader } from './product/ProductPageHeader';
import { CatalogSummaryCard } from './product/CatalogSummaryCard';
import { ProductQuickActionPlaceholder } from './product/ProductQuickActionPlaceholder';
import { ProductToolbar } from './product/ProductToolbar';
import { ProductFilterPanel } from './product/ProductFilterPanel';
import { ProductPagination } from './product/ProductPagination';
import { ProductNoResultsState } from './product/ProductNoResultsState';
import { ProductListTable } from './product/ProductListTable';
import { ProductEmptyState } from './product/ProductEmptyState';
import { ProductLoadingState } from './product/ProductLoadingState';
import { ProductErrorState } from './product/ProductErrorState';
import { ProductFormModal } from './product/ProductFormModal';
import { ProductDetailDrawer } from './product/ProductDetailDrawer';
import { ProductDeleteConfirmModal } from './product/ProductDeleteConfirmModal';

// Master Data Modals
import { CategoryManagerModal } from './product/CategoryManagerModal';
import { BrandManagerModal } from './product/BrandManagerModal';
import { UnitManagerModal } from './product/UnitManagerModal';
import { TagManagerModal } from './product/TagManagerModal';

import { ProductRecord } from '../services/productEngine/types';
import { ProductInputDTO } from '../services/productEngine/ProductValidator';
import { ProductProvider, useProductContext } from '../services/productEngine/ProductContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ProductCapabilityProps {
  tenant: TenantContext;
  onEmitEvent?: (event: BusinessEvent) => void;
}

const ProductCapabilityInner: React.FC<ProductCapabilityProps> = ({ tenant, onEmitEvent }) => {
  const { summary: catalogSummary } = useProductContext();

  const {
    products,
    summary,
    loading,
    error,
    notification,
    clearNotification,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(tenant, onEmitEvent);

  // Integrated Product Browsing Pipeline (Search, Filter, Sort, Pagination, URL State)
  const browsing = useProductBrowsing(products);

  // UI Control States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductRecord | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductRecord | null>(null);

  // Master Data Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Handlers for Form Submissions & CRUD Mutations
  const handleCreateSubmit = async (input: Partial<ProductInputDTO>) => {
    return await createProduct(input);
  };

  const handleUpdateSubmit = async (input: Partial<ProductInputDTO>) => {
    if (!editingProduct) return { success: false, error: 'No product selected for update' };
    return await updateProduct(editingProduct.id, input);
  };

  const handleDeleteConfirm = async (id: string) => {
    return await deleteProduct(id);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium shadow-lg transition-all animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={clearNotification}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Shell Header */}
      <ProductPageHeader tenant={tenant} />

      {/* Catalog Master Summary Card */}
      <CatalogSummaryCard
        summary={catalogSummary || summary}
        organizationId={tenant.organizationId}
      />

      {/* Quick Action Control Bar */}
      <ProductQuickActionPlaceholder
        onAddProduct={() => {
          setEditingProduct(null);
          setIsFormOpen(true);
        }}
      />

      {/* Product Browsing Toolbar */}
      <ProductToolbar
        searchInput={browsing.searchInput}
        onSearchChange={browsing.setSearchInput}
        onClearSearch={browsing.clearSearch}
        isSearching={browsing.isSearching}
        selectedStatus={browsing.filterCriteria.status || 'all'}
        onStatusChange={browsing.setStatus}
        sortField={browsing.sortCriteria.field}
        sortOrder={browsing.sortCriteria.order}
        onSortChange={browsing.setSort}
        isFilterPanelOpen={isFilterPanelOpen}
        onToggleFilterPanel={() => setIsFilterPanelOpen((prev) => !prev)}
        activeFilterCount={browsing.activeFilterCount}
        hasActiveSearchOrFilter={browsing.hasActiveSearchOrFilter}
        onResetAll={browsing.resetAll}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onOpenBrandManager={() => setIsBrandModalOpen(true)}
        onOpenUnitManager={() => setIsUnitModalOpen(true)}
        onOpenTagManager={() => setIsTagModalOpen(true)}
      />

      {/* Expandable Filter Panel */}
      <ProductFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        criteria={browsing.filterCriteria}
        onUnitChange={browsing.setUnit}
        onPriceRangeChange={browsing.setPriceRange}
        onDateRangeChange={browsing.setDateRange}
        onResetFilters={browsing.resetFilters}
        tenant={tenant}
      />

      {/* Main Catalog Dataset View Shell */}
      {loading ? (
        <ProductLoadingState />
      ) : error ? (
        <ProductErrorState message={error} onRetry={refresh} />
      ) : products.length === 0 ? (
        <ProductEmptyState tenant={tenant} />
      ) : browsing.totalRecords === 0 ? (
        <ProductNoResultsState
          searchTerm={browsing.searchInput}
          filterCriteria={browsing.filterCriteria}
          onResetAll={browsing.resetAll}
        />
      ) : (
        <div className="space-y-4">
          <ProductListTable
            products={browsing.paginatedProducts}
            tenant={tenant}
            onViewProduct={(p) => setViewingProduct(p)}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsFormOpen(true);
            }}
            onDeleteProduct={(p) => setDeletingProduct(p)}
            sortField={browsing.sortCriteria.field}
            sortOrder={browsing.sortCriteria.order}
            onToggleSort={browsing.toggleSort}
          />

          {/* Reusable Pagination Footer */}
          <ProductPagination
            currentPage={browsing.page}
            totalPages={browsing.totalPages}
            totalRecords={browsing.totalRecords}
            startIndex={browsing.startIndex}
            endIndex={browsing.endIndex}
            pageSize={browsing.pageSize}
            onPageSizeChange={browsing.setPageSize}
            onGoToPage={browsing.goToPage}
            onNextPage={browsing.nextPage}
            onPrevPage={browsing.prevPage}
            onFirstPage={browsing.firstPage}
            onLastPage={browsing.lastPage}
            hasNextPage={browsing.hasNextPage}
            hasPrevPage={browsing.hasPrevPage}
          />
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateSubmit : handleCreateSubmit}
        initialData={editingProduct}
        tenant={tenant}
      />

      {/* View Detail Drawer */}
      <ProductDetailDrawer
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={(p) => {
          setEditingProduct(p);
          setIsFormOpen(true);
        }}
        onDelete={(p) => setDeletingProduct(p)}
        tenant={tenant}
      />

      {/* Delete Confirmation Modal */}
      <ProductDeleteConfirmModal
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Master Data Management Modals */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <BrandManagerModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      <UnitManagerModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
      />

      <TagManagerModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />
    </div>
  );
};

export const ProductCapability: React.FC<ProductCapabilityProps> = (props) => {
  return (
    <ProductProvider tenant={props.tenant} onEmitEvent={props.onEmitEvent}>
      <ProductCapabilityInner {...props} />
    </ProductProvider>
  );
};

import React, { useState } from 'react';
import { CRMContact, BusinessEvent, TenantContext } from '../types';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerTable } from './customer/CustomerTable';
import { CustomerFormDialog } from './customer/CustomerFormDialog';
import { CustomerDetailDrawer } from './customer/CustomerDetailDrawer';
import { CustomerDeleteConfirmation } from './customer/CustomerDeleteConfirmation';
import { CustomerFormData } from '../services/customerValidation';
import { customerImportExportSchema } from '../services/customerImportExportSchema';
import { ImportWizardModal } from './importExport/ImportWizardModal';
import { ExportOptionsModal } from './importExport/ExportOptionsModal';
import { ImportHistoryModal } from './importExport/ImportHistoryModal';
import { Timeline } from './timeline/Timeline';
import { ReceivableWidget } from './receivables/ReceivableWidget';
import {
  Users,
  Plus,
  Building2,
  List,
  Kanban,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  UserCheck,
  Upload,
  Download,
  History,
  Activity,
  Receipt,
} from 'lucide-react';

interface CrmCapabilityProps {
  tenant: TenantContext;
  contacts: CRMContact[];
  onAddContact: (contact: CRMContact) => void;
  onEmitEvent: (event: BusinessEvent) => void;
}

export const CrmCapability: React.FC<CrmCapabilityProps> = ({
  tenant,
  contacts: initialContacts,
  onAddContact,
  onEmitEvent,
}) => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'table' | 'timeline' | 'receivables'>('table');

  // Customer state & CRUD operations via enterprise hook
  const {
    contacts,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    bulkImportCustomers,
  } = useCustomers(tenant, initialContacts, onEmitEvent);

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CRMContact | null>(null);

  // Drawer State
  const [detailCustomer, setDetailCustomer] = useState<CRMContact | null>(null);

  // Delete Confirmation State
  const [deletingCustomer, setDeletingCustomer] = useState<CRMContact | null>(null);

  // Import / Export Engine Modal States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Success Notification banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: CRMContact) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    formData: CustomerFormData
  ): Promise<{ success: boolean; error?: string }> => {
    if (editingCustomer) {
      const res = await updateCustomer(editingCustomer.id, formData);
      if (res.success) {
        showNotification(`Successfully updated customer ${formData.name}.`);
      }
      return res;
    } else {
      const res = await addCustomer(formData);
      if (res.success) {
        showNotification(`Successfully registered customer ${formData.name}.`);
      }
      return res;
    }
  };

  const handleDeleteConfirm = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await deleteCustomer(id);
    if (res.success) {
      showNotification('Customer record marked as inactive (Soft Delete).');
    }
    return res;
  };

  const stages: CRMContact['stage'][] = [
    'Lead',
    'Contacted',
    'Proposal Sent',
    'Negotiation',
    'Customer',
  ];

  return (
    <div className="space-y-6">
      {/* Capability Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">CRM & Customer Management</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              cap_crm v2.0.0 Repository-Aware
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Enterprise customer database with Repository Pattern, soft delete, and organization isolation for{' '}
            <strong className="text-indigo-400 font-bold">{tenant.organizationName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Toggle & Engine Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'pipeline'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('receivables')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'receivables'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                <span>Receivables</span>
              </button>
            </div>

            {/* Import Button */}
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
              title="Import Customers via Engine"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
              title="Export Customers via Engine"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all cursor-pointer"
              title="Import/Export History Audit"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-tight shrink-0 ml-1"
            >
              <Plus className="w-4 h-4" />
              <span>Create Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <CustomerTable
          customers={contacts}
          loading={loading}
          onViewDetail={(c) => setDetailCustomer(c)}
          onEdit={handleOpenEdit}
          onDelete={(c) => setDeletingCustomer(c)}
        />
      ) : viewMode === 'timeline' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <Timeline
            organizationId={tenant.organizationId}
            entityType="Customer"
            maxHeight="max-h-[550px]"
          />
        </div>
      ) : viewMode === 'receivables' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <ReceivableWidget tenant={tenant} />
        </div>
      ) : (
        /* Pipeline Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map((stg) => {
            const stageContacts = contacts.filter((c) => c.stage === stg);
            const stageTotalVal = stageContacts.reduce((sum, c) => sum + c.dealValue, 0);

            return (
              <div
                key={stg}
                className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                    {stg}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">
                    {stageContacts.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-500">
                  ${stageTotalVal.toLocaleString()}
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-1">
                  {stageContacts.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-400 italic">
                      No prospects in {stg}
                    </div>
                  ) : (
                    stageContacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-2 group shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 text-slate-700">
                            {c.customerCode || 'CUST-000'}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setDetailCustomer(c)}
                              title="View Details"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Customer"
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingCustomer(c)}
                              title="Delete Customer"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="font-bold text-xs text-slate-900">{c.name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.company || 'N/A'}</span>
                        </div>

                        <div className="text-xs font-mono font-bold text-indigo-700">
                          ${c.dealValue.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Form Dialog (Create / Edit) */}
      <CustomerFormDialog
        isOpen={isFormOpen}
        customer={editingCustomer}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        isOpen={Boolean(detailCustomer)}
        customer={detailCustomer}
        onClose={() => setDetailCustomer(null)}
        onEdit={(c) => {
          setDetailCustomer(null);
          handleOpenEdit(c);
        }}
      />

      {/* Customer Delete Confirmation Dialog */}
      <CustomerDeleteConfirmation
        isOpen={Boolean(deletingCustomer)}
        customer={deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirmDelete={handleDeleteConfirm}
      />

      {/* Reusable Import Engine Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportOpen}
        schema={customerImportExportSchema}
        existingRecords={contacts}
        organizationId={tenant.organizationId}
        onClose={() => setIsImportOpen(false)}
        onPersist={(candidates) => bulkImportCustomers(candidates)}
        onSuccessComplete={(count) => {
          showNotification(`Engine successfully imported ${count} new customer records!`);
        }}
      />

      {/* Reusable Export Engine Options Modal */}
      <ExportOptionsModal
        isOpen={isExportOpen}
        schema={customerImportExportSchema}
        records={contacts}
        organizationName={tenant.organizationName}
        onClose={() => setIsExportOpen(false)}
        onSuccessNotification={(msg) => showNotification(msg)}
      />

      {/* Import / Export History Log Modal */}
      <ImportHistoryModal
        isOpen={isHistoryOpen}
        moduleName="Customer"
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

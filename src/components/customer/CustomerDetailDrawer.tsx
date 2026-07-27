import React, { useState } from 'react';
import { CRMContact, TenantContext } from '../../types';
import { Timeline } from '../timeline/Timeline';
import { ReceivableWidget } from '../receivables/ReceivableWidget';
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Tag,
  DollarSign,
  FileText,
  UserCheck,
  History,
  Info,
  Receipt,
} from 'lucide-react';

interface CustomerDetailDrawerProps {
  isOpen: boolean;
  customer: CRMContact | null;
  onClose: () => void;
  onEdit: (customer: CRMContact) => void;
  tenant?: TenantContext;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  isOpen,
  customer,
  onClose,
  onEdit,
  tenant = {
    organizationId: 'org_main_001',
    organizationName: 'Project Phoenix Org',
    legalEntity: 'PT Enterprise Indonesia',
    locationId: 'loc_hq',
    locationName: 'Jakarta HQ',
    currency: 'USD',
    taxNumber: 'TAX-9981-00',
  },
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'receivables' | 'timeline'>('details');

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl p-6 space-y-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {customer.customerCode || 'CUST-000'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    customer.status === 'Inactive'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {customer.status || 'Active'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{customer.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('receivables')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'receivables'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Receivables</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <div className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
            {/* Key Deal Metrics */}
            <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Pipeline Stage
                </div>
                <div className="text-sm font-bold text-indigo-400">{customer.stage}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Estimated Deal Value
                </div>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  ${customer.dealValue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2.5 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Contact & Location Details
              </h4>

              <div className="flex items-center gap-2.5 text-slate-200">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">Company / Entity</div>
                  <div className="font-semibold">{customer.company || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-200">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">Email Address</div>
                  <div className="font-mono">{customer.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-200">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">Phone Number</div>
                  <div className="font-mono">{customer.phone}</div>
                </div>
              </div>

              {customer.address && (
                <div className="flex items-start gap-2.5 text-slate-200">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-500">Physical Address</div>
                    <div className="leading-relaxed">{customer.address}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interaction Notes</span>
              </h4>
              <p className="text-slate-300 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                "{customer.notes || 'No custom notes recorded.'}"
              </p>
            </div>

            {/* Audit Trail & Compliance */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>System & Audit Trail</span>
              </h4>

              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Organization Owner:</span>
                <span className="font-mono text-slate-200">
                  {customer.organizationId || 'org_main_001'}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Last Interaction:</span>
                <span className="font-mono text-slate-200">{customer.lastInteraction}</span>
              </div>

              {customer.createdAt && (
                <div className="flex justify-between text-slate-400">
                  <span>Created At:</span>
                  <span className="font-mono text-slate-200">
                    {customer.createdAt.replace('T', ' ').substring(0, 19)}
                  </span>
                </div>
              )}

              {customer.updatedAt && (
                <div className="flex justify-between text-slate-400">
                  <span>Last Modified:</span>
                  <span className="font-mono text-slate-200">
                    {customer.updatedAt.replace('T', ' ').substring(0, 19)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'receivables' ? (
          <div className="flex-1 overflow-y-auto pr-1">
            <ReceivableWidget tenant={tenant} customerId={customer.id} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Timeline
              organizationId={customer.organizationId || 'org_main_001'}
              entityType="Customer"
              entityId={customer.id}
              maxHeight="max-h-[500px]"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onEdit(customer);
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Edit Customer Info
          </button>
        </div>
      </div>
    </div>
  );
};

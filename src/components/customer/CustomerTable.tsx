import React from 'react';
import { CRMContact } from '../../types';
import { Eye, Edit3, Trash2, Building2, Mail, Phone, MapPin, DollarSign, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CustomerTableProps {
  customers: CRMContact[];
  loading: boolean;
  onViewDetail: (customer: CRMContact) => void;
  onEdit: (customer: CRMContact) => void;
  onDelete: (customer: CRMContact) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <p className="text-xs text-slate-500 font-medium">Loading customer database records...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Customers Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are no customer records registered for this organization yet. Click "Create Customer" to add your first client.
        </p>
      </div>
    );
  }

  const getStageBadgeColor = (stage: CRMContact['stage']) => {
    switch (stage) {
      case 'Customer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Negotiation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Proposal Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Churned':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-500">
              <th className="py-3 px-4">Code / Customer</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Deal Value</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {c.customerCode || 'CUST-000'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      {c.address && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 max-w-xs truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{c.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.company || 'N/A'}</span>
                  </div>
                </td>

                <td className="py-3 px-4 space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{c.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStageBadgeColor(
                      c.stage
                    )}`}
                  >
                    {c.stage}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Inactive'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.status === 'Inactive' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    {c.status || 'Active'}
                  </span>
                </td>

                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  ${c.dealValue.toLocaleString()}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onViewDetail(c)}
                      title="View Details"
                      className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      title="Edit Customer"
                      className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      title="Delete Customer"
                      className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

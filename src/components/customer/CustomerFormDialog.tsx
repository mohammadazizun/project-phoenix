import React, { useState, useEffect } from 'react';
import { CRMContact } from '../../types';
import { CustomerFormData, customerSchema } from '../../services/customerValidation';
import { Users, X, AlertCircle } from 'lucide-react';

interface CustomerFormDialogProps {
  isOpen: boolean;
  customer?: CRMContact | null;
  onClose: () => void;
  onSubmit: (formData: CustomerFormData) => Promise<{ success: boolean; error?: string }>;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  isOpen,
  customer,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(customer);

  const [customerCode, setCustomerCode] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [stage, setStage] = useState<CRMContact['stage']>('Lead');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [dealValue, setDealValue] = useState<number>(10000);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setCustomerCode(customer.customerCode || `CUST-${Math.floor(100 + Math.random() * 900)}`);
      setName(customer.name || '');
      setCompany(customer.company || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setStage(customer.stage || 'Lead');
      setStatus(customer.status || 'Active');
      setDealValue(customer.dealValue || 0);
      setNotes(customer.notes || '');
    } else {
      setCustomerCode(`CUST-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setAddress('');
      setStage('Lead');
      setStatus('Active');
      setDealValue(10000);
      setNotes('');
    }
    setFormError(null);
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const formData: CustomerFormData = {
      customerCode,
      name,
      company,
      email,
      phone,
      address,
      stage,
      status,
      dealValue: Number(dealValue) || 0,
      notes,
    };

    // Client-side Zod validation
    const parseResult = customerSchema.safeParse(formData);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((err) => err.message).join('. ');
      setFormError(errorMsg);
      return;
    }

    setSubmitting(true);
    const result = await onSubmit(formData);
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setFormError(result.error || 'Operation failed. Please try again.');
    }
  };

  const stages: CRMContact['stage'][] = [
    'Lead',
    'Contacted',
    'Proposal Sent',
    'Negotiation',
    'Customer',
    'Churned',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Edit Customer Record' : 'Register New Customer'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">{formError}</div>
          </div>
        )}

        {/* Form Body */}
        <form id="customer-form" onSubmit={handleSubmit} className="space-y-3 overflow-y-auto text-xs pr-1 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Customer Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value.toUpperCase())}
                placeholder="e.g. CUST-101"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Aris Thorne"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Cyberdyne Inc"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aris@cyberdyne.io"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 019-2831"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Deal Value ($)</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)}
                placeholder="10000"
                min={0}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                {stages.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 100 Innovation Way, San Francisco, CA"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Interaction Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key notes regarding contact history, requirements or preferences..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            disabled={submitting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Customer' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

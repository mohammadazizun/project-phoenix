import React, { useState } from 'react';
import { CRMContact, BusinessEvent, TenantContext } from '../types';
import { Users, Plus, Building2, Phone, Mail, DollarSign, Calendar, MessageSquare } from 'lucide-react';

interface CrmCapabilityProps {
  tenant: TenantContext;
  contacts: CRMContact[];
  onAddContact: (contact: CRMContact) => void;
  onEmitEvent: (event: BusinessEvent) => void;
}

export const CrmCapability: React.FC<CrmCapabilityProps> = ({
  tenant,
  contacts,
  onAddContact,
  onEmitEvent,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dealValue, setDealValue] = useState(50000);
  const [stage, setStage] = useState<CRMContact['stage']>('Lead');
  const [notes, setNotes] = useState('');

  const handleCreateContact = () => {
    if (!name || !company) return;

    const contactId = `crm_${Date.now()}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newContact: CRMContact = {
      id: contactId,
      name,
      company,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: phone || '+1 (555) 019-2831',
      stage,
      dealValue,
      lastInteraction: formattedDate,
      notes: notes || 'New lead added via CRM Capability.',
    };

    onAddContact(newContact);

    // Emit event
    const event: BusinessEvent = {
      id: `evt_crm_${Date.now()}`,
      eventType: 'crm.lead_created',
      timestamp: now.toISOString(),
      sourceCapability: 'cap_crm',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { contactId, name, company, dealValue, stage },
      correlationId: `corr_crm_${Date.now()}`,
      status: 'processed',
    };
    onEmitEvent(event);

    setShowAddModal(false);
    setName('');
    setCompany('');
  };

  const stages: CRMContact['stage'][] = ['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Customer'];

  return (
    <div className="space-y-6">
      {/* Capability Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">CRM & Customer Pipeline Capability</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              cap_crm v1.5.0
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Account tiering & enterprise pipeline management. Emits <code className="text-indigo-400 font-bold">crm.lead_created</code> & <code className="text-indigo-400 font-bold">crm.deal_won</code> events.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow-sm transition-all cursor-pointer uppercase tracking-tight shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account Lead</span>
        </button>
      </div>

      {/* Pipeline Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stg) => {
          const stageContacts = contacts.filter((c) => c.stage === stg);
          const stageTotalVal = stageContacts.reduce((sum, c) => sum + c.dealValue, 0);

          return (
            <div key={stg} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">{stg}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">
                  {stageContacts.length}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-500">
                ${stageTotalVal.toLocaleString()}
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-1">
                {stageContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-md bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors space-y-1.5"
                  >
                    <div className="font-bold text-xs text-slate-900">{c.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{c.company}</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-indigo-700">
                      ${c.dealValue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2">{c.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Add Enterprise Lead to CRM Pipeline</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Aris Thorne"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Cyberdyne Labs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 cursor-pointer"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Deal Estimate ($ USD)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Interaction Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key details about this deal prospect..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs font-bold">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContact}
                disabled={!name || !company}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 disabled:opacity-50 text-white rounded-lg hover:from-purple-400 cursor-pointer"
              >
                Create Lead & Emit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

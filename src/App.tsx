/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SalesCapability } from './components/SalesCapability';
import { InventoryCapability } from './components/InventoryCapability';
import { FinanceCapability } from './components/FinanceCapability';
import { CrmCapability } from './components/CrmCapability';
import { ProductCapability } from './components/ProductCapability';
import { AiIntelligenceCenter } from './components/AiIntelligenceCenter';
import { CapabilityRegistry } from './components/CapabilityRegistry';
import { EventBusVisualizer } from './components/EventBusVisualizer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { AiAssistantModal } from './components/AiAssistantModal';

import {
  INITIAL_TENANTS,
  INITIAL_WAREHOUSES,
  INITIAL_CAPABILITIES,
  INITIAL_SKUS,
  INITIAL_ORDERS,
  INITIAL_LEDGER_ACCOUNTS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_CRM_CONTACTS,
  INITIAL_EVENTS,
} from './data/initialData';

import { BusinessEvent, Capability, CRMContact, LedgerEntry, SalesOrder, SKU, TenantContext } from './types';

import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const [tenants] = useState<TenantContext[]>(INITIAL_TENANTS);

  const [currentTenant, setCurrentTenant] = useState<TenantContext>(INITIAL_TENANTS[0]);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Platform Data States
  const [capabilities, setCapabilities] = useState<Capability[]>(INITIAL_CAPABILITIES);
  const [skus, setSkus] = useState<SKU[]>(INITIAL_SKUS);
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
  const [accounts, setAccounts] = useState(INITIAL_LEDGER_ACCOUNTS);
  const [entries, setEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [contacts, setContacts] = useState<CRMContact[]>(INITIAL_CRM_CONTACTS);
  const [events, setEvents] = useState<BusinessEvent[]>(INITIAL_EVENTS);

  // Event Dispatcher Engine
  const handleEmitEvent = (event: BusinessEvent) => {
    setEvents((prev) => [...prev, event]);

    // Reactive Handlers across Capabilities
    if (event.eventType === 'sale.completed') {
      // 1. Auto-update Financial Ledger
      const newEntry: LedgerEntry = {
        id: `gl_${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        description: `Automated posting for ${event.payload.orderNumber || 'Sale'}`,
        debitAccount: '1010 Cash & Bank Reserve',
        creditAccount: '4010 Sales Revenue (Core OS & Systems)',
        amount: event.payload.totalAmount || 0,
        referenceEventId: event.id,
        status: 'Posted',
      };
      setEntries((prev) => [newEntry, ...prev]);

      // Update cash balance
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.accountCode === '1010') return { ...acc, balance: acc.balance + (event.payload.totalAmount || 0) };
          if (acc.accountCode === '4010') return { ...acc, balance: acc.balance + (event.payload.totalAmount || 0) };
          return acc;
        })
      );
    }
  };

  const handleToggleCapability = (id: string) => {
    setCapabilities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
  };

  const handleAddCapability = (newCap: Capability) => {
    setCapabilities((prev) => [...prev, newCap]);
  };

  const handleAddOrder = (newOrder: SalesOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateStock = (skuId: string, warehouseId: string, delta: number) => {
    setSkus((prev) =>
      prev.map((sku) => {
        if (sku.id === skuId) {
          const currentQty = sku.stockLevels[warehouseId] || 0;
          const updatedQty = Math.max(0, currentQty + delta);
          const newLevels = { ...sku.stockLevels, [warehouseId]: updatedQty };
          const totalQty = (Object.values(newLevels) as number[]).reduce((a, b) => a + b, 0);

          return {
            ...sku,
            stockLevels: newLevels,
            status: totalQty < sku.reorderThreshold ? 'Low Stock' : 'In Stock',
          };
        }
        return sku;
      })
    );
  };

  const handleAddJournalEntry = (entry: LedgerEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const handleAddCrmContact = (contact: CRMContact) => {
    setContacts((prev) => [contact, ...prev]);
  };

  const activeCapabilityCount = capabilities.filter((c) => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <Header
          tenants={tenants}
          currentTenant={currentTenant}
          onSelectTenant={setCurrentTenant}
          eventCount={events.length}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
          activeCapabilityCount={activeCapabilityCount}
        />

        {/* Navigation Bar */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main View Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              tenant={currentTenant}
              orders={orders}
              skus={skus}
              accounts={accounts}
              events={events}
              capabilities={capabilities}
              onNavigate={setActiveTab}
              onQuickAiAsk={() => setIsAiModalOpen(true)}
            />
          )}

          {activeTab === 'products' && (
            <ProductCapability
              tenant={currentTenant}
              onEmitEvent={handleEmitEvent}
            />
          )}

          {activeTab === 'sales' && (
            <SalesCapability
              tenant={currentTenant}
              orders={orders}
              skus={skus}
              onAddOrder={handleAddOrder}
              onEmitEvent={handleEmitEvent}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryCapability
              tenant={currentTenant}
              skus={skus}
              warehouses={INITIAL_WAREHOUSES}
              onUpdateStock={handleUpdateStock}
              onEmitEvent={handleEmitEvent}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceCapability
              tenant={currentTenant}
              accounts={accounts}
              entries={entries}
              onAddEntry={handleAddJournalEntry}
              onEmitEvent={handleEmitEvent}
            />
          )}

          {activeTab === 'crm' && (
            <CrmCapability
              tenant={currentTenant}
              contacts={contacts}
              onAddContact={handleAddCrmContact}
              onEmitEvent={handleEmitEvent}
            />
          )}

          {activeTab === 'ai' && (
            <AiIntelligenceCenter
              tenant={currentTenant}
              orders={orders}
              skus={skus}
              accounts={accounts}
              events={events}
              capabilities={capabilities}
            />
          )}

          {activeTab === 'capabilities' && (
            <CapabilityRegistry
              capabilities={capabilities}
              onToggleCapability={handleToggleCapability}
              onAddCapability={handleAddCapability}
            />
          )}

          {activeTab === 'events' && (
            <EventBusVisualizer
              tenant={currentTenant}
              events={events}
              onEmitEvent={handleEmitEvent}
            />
          )}

          {activeTab === 'architecture' && <ArchitectureDocs />}
        </main>
      </div>

      {/* Professional Polish Bottom Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between text-[10px] font-mono text-slate-500 mt-8">
        <div className="flex gap-4 sm:gap-6">
          <span className="hidden sm:inline">ARCH: CLOUD NATIVE</span>
          <span>DB: MULTI-TENANT</span>
          <span>API: RESTFUL / EVENT-DRIVEN</span>
        </div>
        <div className="text-slate-600 font-bold uppercase tracking-tight">
          System Status: Enterprise Operational
        </div>
      </footer>

      {/* Global Slide-Over AI Copilot Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        tenant={currentTenant}
      />
    </div>
  );
}

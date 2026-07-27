import React, { useState } from 'react';
import { SalesOrder, SKU, BusinessEvent, TenantContext } from '../types';
import { ShoppingCart, Plus, CheckCircle2, FileText, ArrowRight, DollarSign, Package } from 'lucide-react';

interface SalesCapabilityProps {
  tenant: TenantContext;
  orders: SalesOrder[];
  skus: SKU[];
  onAddOrder: (order: SalesOrder) => void;
  onEmitEvent: (event: BusinessEvent) => void;
}

export const SalesCapability: React.FC<SalesCapabilityProps> = ({
  tenant,
  orders,
  skus,
  onAddOrder,
  onEmitEvent,
}) => {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Wire Transfer' | 'POS Cash' | 'Net 30'>('Credit Card');
  const [selectedCart, setSelectedCart] = useState<{ sku: SKU; quantity: number }[]>([]);

  const handleAddToCart = (sku: SKU) => {
    setSelectedCart((prev) => {
      const existing = prev.find((item) => item.sku.id === sku.id);
      if (existing) {
        return prev.map((item) => (item.sku.id === sku.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        return [...prev, { sku, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (skuId: string) => {
    setSelectedCart((prev) => prev.filter((item) => item.sku.id !== skuId));
  };

  const subtotal = selectedCart.reduce((sum, item) => sum + item.sku.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCompleteSale = () => {
    if (!customerName || selectedCart.length === 0) return;

    const orderId = `ord_${Date.now()}`;
    const orderNum = `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: SalesOrder = {
      id: orderId,
      orderNumber: orderNum,
      customerName,
      customerEmail: customerEmail || 'customer@enterprise.com',
      date: formattedDate,
      items: selectedCart.map((c) => ({
        skuId: c.sku.id,
        skuName: c.sku.name,
        quantity: c.quantity,
        unitPrice: c.sku.unitPrice,
      })),
      subtotal,
      tax,
      total,
      status: 'Invoiced',
      paymentMethod,
      warehouseId: 'wh_sf_main',
    };

    // 1. Add order to state
    onAddOrder(newOrder);

    // 2. Emit `sale.completed` Event to system
    const correlationId = `corr_${Date.now()}`;
    const saleEvent: BusinessEvent = {
      id: `evt_${Date.now()}`,
      eventType: 'sale.completed',
      timestamp: now.toISOString(),
      sourceCapability: 'cap_sales',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        orderNumber: orderNum,
        customerName,
        totalAmount: total,
        itemsCount: selectedCart.length,
        paymentMethod,
      },
      correlationId,
      status: 'processed',
    };
    onEmitEvent(saleEvent);

    // Reset form & modal
    setSelectedCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setShowNewOrderModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Capability Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Sales & POS Engine Capability</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              cap_sales v2.1.0
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Executes B2B orders & POS transactions. Emits <code className="text-indigo-400 font-bold">sale.completed</code> events to trigger inventory reservation and ledger journal postings.
          </p>
        </div>

        <button
          onClick={() => setShowNewOrderModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow-sm transition-all cursor-pointer uppercase tracking-tight shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Order / Checkout</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Order Lifecycle State Machine ({orders.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Organization: {tenant.organizationName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-3">Order Number</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">State Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div>{order.customerName}</div>
                    <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{order.date}</td>
                  <td className="px-6 py-4 text-slate-600">{order.paymentMethod}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.status === 'Invoiced' || order.status === 'Fulfilled'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span>Execute New B2B Sale / POS Transaction</span>
              </h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Customer / Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Enterprise Corp"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Customer Email</label>
                <input
                  type="email"
                  placeholder="procurement@apex.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="POS Cash">POS Cash</option>
                  <option value="Net 30">Net 30 Terms</option>
                </select>
              </div>
            </div>

            {/* Catalog SKU Selection */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                Select Items from Catalog
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {skus.map((sku) => (
                  <div
                    key={sku.id}
                    className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{sku.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sku.skuCode} | ${sku.unitPrice}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(sku)}
                      className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] rounded hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            {selectedCart.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider">Order Items Summary</h4>
                <div className="space-y-2">
                  {selectedCart.map((item) => (
                    <div key={item.sku.id} className="flex items-center justify-between text-slate-300">
                      <span>
                        {item.sku.name} x {item.quantity}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">
                          ${(item.sku.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.sku.id)}
                          className="text-red-400 hover:underline text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-2 space-y-1 font-mono text-right">
                  <div className="text-slate-400">Subtotal: ${subtotal.toFixed(2)}</div>
                  <div className="text-slate-400">Tax (8%): ${tax.toFixed(2)}</div>
                  <div className="text-base font-bold text-amber-400">Total: ${total.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={!customerName || selectedCart.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg hover:from-amber-400 hover:to-orange-500 shadow-md cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Process Sale & Emit Event</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

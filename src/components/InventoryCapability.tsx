import React, { useState } from 'react';
import { SKU, Warehouse, BusinessEvent, TenantContext } from '../types';
import { Boxes, AlertTriangle, ArrowUpDown, Plus, ShieldCheck, Warehouse as WarehouseIcon } from 'lucide-react';

interface InventoryCapabilityProps {
  tenant: TenantContext;
  skus: SKU[];
  warehouses: Warehouse[];
  onUpdateStock: (skuId: string, warehouseId: string, delta: number) => void;
  onEmitEvent: (event: BusinessEvent) => void;
}

export const InventoryCapability: React.FC<InventoryCapabilityProps> = ({
  tenant,
  skus,
  warehouses,
  onUpdateStock,
  onEmitEvent,
}) => {
  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('wh_sf_main');
  const [adjustQty, setAdjustQty] = useState<number>(10);

  const handleApplyAdjustment = () => {
    if (!selectedSku) return;

    onUpdateStock(selectedSku.id, selectedWarehouse, adjustQty);

    // Emit event
    const now = new Date();
    const event: BusinessEvent = {
      id: `evt_${Date.now()}`,
      eventType: 'inventory.adjusted',
      timestamp: now.toISOString(),
      sourceCapability: 'cap_inventory',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        skuCode: selectedSku.skuCode,
        skuName: selectedSku.name,
        warehouseId: selectedWarehouse,
        deltaQuantity: adjustQty,
      },
      correlationId: `corr_inv_${Date.now()}`,
      status: 'processed',
    };
    onEmitEvent(event);

    setSelectedSku(null);
  };

  return (
    <div className="space-y-6">
      {/* Capability Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Boxes className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Inventory & Stock Matrix Capability</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              cap_inventory v2.0.1
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Multi-warehouse stock level management & reorder threshold automation. Emits <code className="text-indigo-400 font-bold">inventory.adjusted</code> & <code className="text-indigo-400 font-bold">inventory.reorder_triggered</code> events.
          </p>
        </div>
      </div>

      {/* Warehouse Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-md bg-indigo-50 text-indigo-600">
              <WarehouseIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">{wh.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{wh.code}</div>
              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{wh.address}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SKU Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            SKU Catalog & Warehouse Quantity Matrix
          </h3>
          <span className="text-xs text-slate-400 font-medium">Total SKUs: {skus.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-3">SKU Code</th>
                <th className="px-6 py-3">Item Description</th>
                <th className="px-6 py-3">Unit Price / Cost</th>
                <th className="px-6 py-3">West Coast (SF)</th>
                <th className="px-6 py-3">East Coast (NY)</th>
                <th className="px-6 py-3">Tokyo Hub</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {skus.map((sku) => (
                <tr key={sku.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700">{sku.skuCode}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{sku.name}</div>
                    <div className="text-[10px] text-slate-400">{sku.category}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">
                    <div className="text-slate-900 font-bold">${sku.unitPrice.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">Cost: ${sku.unitCost.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {sku.stockLevels['wh_sf_main'] ?? 0}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {sku.stockLevels['wh_ny_east'] ?? 0}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {sku.stockLevels['wh_tokyo_01'] ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        sku.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {sku.status === 'In Stock' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {sku.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedSku(sku)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-amber-400" />
                <span>Adjust Stock: {selectedSku.skuCode}</span>
              </h3>
              <button onClick={() => setSelectedSku(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Warehouse</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none cursor-pointer"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Stock Adjustment (+ Add / - Deduct)</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs font-bold">
              <button
                onClick={() => setSelectedSku(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 rounded-lg hover:from-amber-400 cursor-pointer"
              >
                Apply & Emit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

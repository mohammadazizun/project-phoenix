import React, { useState } from 'react';
import { BusinessEvent, TenantContext } from '../types';
import { Radio, Activity, Search, Filter, Play, CheckCircle2, Copy, FileCode } from 'lucide-react';

interface EventBusVisualizerProps {
  tenant: TenantContext;
  events: BusinessEvent[];
  onEmitEvent: (event: BusinessEvent) => void;
}

export const EventBusVisualizer: React.FC<EventBusVisualizerProps> = ({
  tenant,
  events,
  onEmitEvent,
}) => {
  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const [customEventType, setCustomEventType] = useState('inventory.reorder_triggered');
  const [customSource, setCustomSource] = useState('cap_inventory');
  const [customPayload, setCustomPayload] = useState('{\n  "sku": "PHX-EVO-PRO",\n  "reorderQty": 50\n}');

  const eventTypes = [
    'All',
    'sale.completed',
    'inventory.adjusted',
    'finance.entry_posted',
    'crm.lead_created',
    'ai.insight_generated',
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.eventType.toLowerCase().includes(search.toLowerCase()) ||
      evt.sourceCapability.toLowerCase().includes(search.toLowerCase()) ||
      evt.correlationId.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedEventType === 'All' || evt.eventType === selectedEventType;
    return matchesSearch && matchesType;
  });

  const handleEmitTestEvent = () => {
    try {
      const parsedPayload = JSON.parse(customPayload);
      const now = new Date();
      const newEvent: BusinessEvent = {
        id: `evt_dev_${Date.now()}`,
        eventType: customEventType,
        timestamp: now.toISOString(),
        sourceCapability: customSource,
        tenantId: tenant.organizationId,
        entityLocation: tenant.locationName,
        payload: parsedPayload,
        correlationId: `corr_dev_${Date.now()}`,
        status: 'processed',
      };
      onEmitEvent(newEvent);
    } catch (err) {
      alert('Invalid JSON payload format!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Capability Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-lg font-bold text-white">Event Bus & Audit Stream Visualizer</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              cap_audit v1.1.0
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time event stream inspector. Every operational business action produces one or more immutable Events mapped by correlation IDs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 font-bold">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Total Stream Logs: {events.length}</span>
        </div>
      </div>

      {/* Main Grid: Event Stream Table + Test Event Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Event Log Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
          {/* Controls: Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search event type, correlation ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedEventType(type)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                    selectedEventType === type
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Event Stream List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {filteredEvents.slice().reverse().map((evt) => {
              const isExpanded = expandedEventId === evt.id;

              return (
                <div
                  key={evt.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{evt.eventType}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white text-slate-600 border border-slate-200">
                        {evt.sourceCapability}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{evt.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Correlation ID: {evt.correlationId}</span>
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      {isExpanded ? 'Hide Payload' : 'Inspect JSON Payload'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto">
                      <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (1 col): Custom Event Simulator */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Event Dispatch Simulator</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Emit custom events to test system capability consumers and event handlers.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Event Type</label>
              <input
                type="text"
                value={customEventType}
                onChange={(e) => setCustomEventType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Source Capability ID</label>
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">JSON Payload</label>
              <textarea
                rows={5}
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleEmitTestEvent}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-md flex items-center justify-center gap-2 hover:bg-indigo-500 cursor-pointer shadow-sm uppercase tracking-tight"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Dispatch Event to Stream</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

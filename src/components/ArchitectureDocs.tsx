import React from 'react';
import { BookOpen, Layers, ShieldCheck, Cpu, Radio, Database, CheckCircle2, Terminal } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const layers = [
    {
      name: 'Presentation Layer',
      color: 'border-amber-500/40 bg-amber-500/5 text-amber-400',
      description: 'Responsive, accessible, business-focused Web / Mobile / AI Agent client interfaces.',
      components: ['React 19 SPA', 'Tailwind CSS v4', 'Executive AI Copilot Drawer', 'Capability Dashboards'],
    },
    {
      name: 'Application Layer',
      color: 'border-blue-500/40 bg-blue-500/5 text-blue-400',
      description: 'API First routing, request validation, authentication context propagation, and event routing.',
      components: ['Express Full-Stack Server', 'Vite Middleware', 'RESTful API Contracts', 'Event Bus Dispatcher'],
    },
    {
      name: 'Business Layer',
      color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
      description: 'Domain capabilities containing all operational business rules and state machine logic.',
      components: ['Sales & POS Capability', 'Multi-Warehouse Inventory', 'Double-Entry Finance Ledger', 'CRM Pipeline'],
    },
    {
      name: 'Core Layer',
      color: 'border-purple-500/40 bg-purple-500/5 text-purple-400',
      description: 'System-wide platform primitives and capability orchestration engine.',
      components: ['Capability Registry', 'Tenant & Legal Entity Hierarchy', 'Immutable Audit Stream', 'RBAC Security'],
    },
    {
      name: 'Infrastructure Layer',
      color: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-400',
      description: 'Serverless Cloud Run containers, Docker sandboxing, and background task processing.',
      components: ['Cloud Run Container Ingress', 'Port 3000 Routing', 'Environment Security', 'HMR Control'],
    },
    {
      name: 'Database Layer',
      color: 'border-orange-500/40 bg-orange-500/5 text-orange-400',
      description: 'Normalized data structures, history tracking, soft delete, and multi-tenant scoping.',
      components: ['Structured Event Log', 'Chart of Accounts Ledger', 'SKU Catalog Matrix', 'Audit Trail Storage'],
    },
  ];

  const corePrinciples = [
    'Modular & Capability-Driven',
    'API First Integration',
    'AI Native Reasoning',
    'Cloud Native Scale',
    'Event-Driven Pipeline',
    'Secure by Default',
    'Multi-Tenant Ready',
    'Mobile First Design',
  ];

  return (
    <div className="space-y-6">
      {/* Capability Banner */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-indigo-600 text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-white">Project Phoenix Architecture & System Specification</h2>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            Specification 00_SYSTEM.md v1.0.0
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Project Phoenix is an AI-Native Business Operating System. The platform is designed to be infinitely extensible through independent, reusable, testable capabilities that communicate through an event-driven bus.
        </p>
      </div>

      {/* Core Architectural Principles */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Core System Design Principles</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {corePrinciples.map((principle) => (
            <div key={principle} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-800">{principle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layered System Architecture diagram */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Layered Architecture Breakdown</span>
        </h3>

        <div className="space-y-3">
          {layers.map((layer, idx) => (
            <div key={layer.name} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">0{idx + 1}.</span>
                  <span className="font-bold text-sm text-slate-900">{layer.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Layer Specification
                </span>
              </div>
              <p className="text-xs text-slate-600">{layer.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {layer.components.map((comp) => (
                  <span key={comp} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thinking Order & Development Workflow */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>Engineering Thinking Order Workflow</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2 font-mono text-indigo-700 font-bold bg-slate-50 p-4 rounded-md border border-slate-200 overflow-x-auto text-xs">
          <span>Understand</span> → <span>Analyze</span> → <span>Question</span> → <span>Design</span> → <span>Review</span> → <span>Validate</span> → <span>Implement</span> → <span>Test</span> → <span>Document</span>
        </div>
      </div>

      {/* Engineering Role Specifications Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Project Phoenix Governance & Engineering Manuals</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { id: '00_SYSTEM', title: 'System Architecture', role: 'Core Platform Spec', desc: 'Defines system capabilities, event bus, and multi-tenant domain boundaries.' },
            { id: 'EXEC-001', title: 'Execution 001 Foundation', role: 'Project Initialization Base', desc: 'Establishes clean scalable directory structure, layout architecture, global providers & error boundaries.' },
            { id: 'EXEC-005', title: 'Execution 005 Customer CRUD', role: 'Repository-Aware Enterprise CRM', desc: 'Implements Customer Repository, Service Layer, Zod Validation, Soft Delete & Multi-Tenant RLS isolation.' },
            { id: '01A_PRINCIPLES', title: 'Engineering Principles', role: 'Golden Rule & Mindset', desc: 'Design for future expansion without overengineering. Quality over speed.' },
            { id: '02_ARCHITECT', title: 'Software Architect', role: 'Principal Architect', desc: 'Clean architecture, domain isolation, event contracts, and SOLID principles.' },
            { id: '03_PRODUCT', title: 'Product Manager', role: 'Senior Product Manager', desc: 'Business workflows, user impact, acceptance criteria, and feature scopes.' },
            { id: '04_DATABASE', title: 'Database Architect', role: 'Principal DB Architect', desc: 'Normalized schema, immutable audit streams, soft delete, and tenant isolation.' },
            { id: '05_BACKEND', title: 'Backend Engineer', role: 'Senior Backend Engineer', desc: 'Thin controllers, rich domain services, transactions, and API contracts.' },
            { id: '06_FRONTEND', title: 'Frontend Engineer', role: 'Senior Frontend Engineer', desc: 'Accessible UI, responsive design, state management, and mobile-first UX.' },
            { id: '07_UI_UX', title: 'UI/UX Designer', role: 'Senior UI/UX Designer', desc: 'Predictable navigation, clear visual hierarchy, and actionable dashboards.' },
            { id: '08_AI_ENGINEER', title: 'AI Engineer', role: 'Principal AI Engineer', desc: 'AI Gateway, structured output schemas, context injection, and model routing.' },
            { id: '09_SECURITY', title: 'Security Engineer', role: 'Principal Security Spec', desc: 'Zero Trust, RBAC, secret management, input validation, and OWASP controls.' },
            { id: '10_QA_ENGINEER', title: 'QA Engineer', role: 'Principal QA Engineer', desc: 'Test pyramid, regression suites, API validation, and release quality gates.' },
            { id: '11_DEVOPS', title: 'DevOps Engineer', role: 'Principal DevOps Spec', desc: 'CI/CD automation, IaC, Cloud Run containerization, observability & recovery.' },
            { id: '12_TECH_WRITER', title: 'Technical Writer', role: 'Principal Tech Writer', desc: 'System documentation, API specs, release notes, runbooks, and developer guides.' },
            { id: '13_CODE_REVIEWER', title: 'Code Reviewer', role: 'Principal Code Reviewer', desc: 'PR governance, architecture compliance, security audit, and tech debt management.' },
            { id: '17_CAPABILITY', title: 'Capability Planner', role: 'Strategic Product Architect', desc: 'Decomposes business requirements into independent, testable MVP capabilities.' },
            { id: '18_ORCHESTRATOR', title: 'Implementation Orchestrator', role: 'Master Orchestrator', desc: 'Transforms project definitions into complete, working, production-ready software.' },
            { id: '19_BLUEPRINT', title: 'Application Blueprint', role: 'Official MVP Scope Spec', desc: 'Defines official MVP bounds, features, DB modules, limits, and success metrics for UMKM.' },
            { id: '19_INTEGRATION', title: 'Final Integration', role: 'Final Integration Orchestrator', desc: 'Integrates all completed capabilities into a unified, secure, production-ready release candidate.' },
            { id: '20_MVP_RELEASE', title: 'MVP Release Authority', role: 'Final Release Authority', desc: 'Evaluates business, functional, security, and operational readiness for production deployment.' },
          ].map((doc) => (
            <div key={doc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{doc.title}</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-semibold">
                  {doc.id}
                </span>
              </div>
              <div className="text-[11px] font-medium text-indigo-600">{doc.role}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{doc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

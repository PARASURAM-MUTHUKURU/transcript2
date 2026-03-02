import React from 'react';
import { Search, MessageSquare, Phone, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Audit } from '../types';
import { AuditSkeleton } from './Skeleton';

interface CallHistorySidebarProps {
  audits: Audit[];
  selectedAudit: Audit | null;
  setSelectedAudit: (audit: Audit) => void;
  setShowNewAuditModal: (show: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  loading?: boolean;
}

export const CallHistorySidebar = ({
  audits,
  selectedAudit,
  setSelectedAudit,
  setShowNewAuditModal,
  collapsed,
  setCollapsed,
  loading = false
}: CallHistorySidebarProps) => {
  return (
    <aside className={cn(
      "border-r border-brand-border bg-brand-surface flex flex-col transition-all duration-300 relative",
      collapsed ? "w-16" : "w-80"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-brand-surface border border-brand-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary z-10 shadow-lg transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={cn("p-6 space-y-6 overflow-hidden", collapsed && "opacity-0 pointer-events-none")}>
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold tracking-tight text-text-primary">Call Audits</h2>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Audio Recording History</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-60" size={14} />
          <input
            type="text"
            placeholder="Search recordings..."
            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-brand-accent outline-none transition-all"
          />
        </div>

        <div className="flex p-1 bg-brand-bg rounded-xl border border-brand-border">
          {['All', 'Flagged', 'Critical'].map(tab => (
            <button
              key={tab}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                tab === 'All' ? "bg-brand-accent text-white" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto px-3 space-y-1 pb-6", collapsed && "hidden")}>
        {loading ? (
          <>
            <AuditSkeleton />
            <AuditSkeleton />
            <AuditSkeleton />
          </>
        ) : (
          audits.map(audit => (
            <button
              key={audit.id}
              onClick={() => setSelectedAudit(audit)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all group relative border",
                selectedAudit?.id === audit.id
                  ? "bg-brand-card border-brand-border shadow-lg"
                  : "hover:bg-brand-card/50 border-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    audit.type === 'chat' ? "bg-brand-border text-text-secondary opacity-70" : "bg-brand-red/10 text-brand-red"
                  )}>
                    {audit.type === 'chat' ? <MessageSquare size={12} /> : <Phone size={12} />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-text-primary">#{audit.id + 4800}</span>
                    <span className="text-[10px] text-text-secondary font-medium">6m 14s</span>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black",
                  audit.overall_score > 80 ? "bg-brand-green/10 text-brand-green" : audit.overall_score > 60 ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-red/10 text-brand-red"
                )}>
                  {audit.overall_score}%
                </div>
              </div>
              <p className="text-xs text-text-secondary font-semibold truncate mb-2">{audit.agent_name}</p>
              {audit.violations && audit.violations.length > 0 && (
                <div className="flex items-center gap-1.5 text-brand-red text-[9px] font-black uppercase tracking-widest">
                  <AlertCircle size={10} />
                  {audit.violations.length} Violations
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Collapsed View Icons */}
      {collapsed && (
        <div className="flex-1 flex flex-col items-center pt-20 gap-4">
          {audits.map(audit => (
            <button
              key={audit.id}
              onClick={() => setSelectedAudit(audit)}
              className={cn(
                "p-3 rounded-xl transition-all",
                selectedAudit?.id === audit.id ? "bg-brand-accent text-white" : "text-text-secondary hover:bg-brand-card"
              )}
            >
              {audit.type === 'chat' ? <MessageSquare size={16} /> : <Phone size={16} />}
            </button>
          ))}
        </div>
      )}

      <div className={cn("p-4 border-t border-brand-border", collapsed && "p-2")}>
        <button
          onClick={() => setShowNewAuditModal(true)}
          className={cn(
            "w-full bg-brand-accent text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-2",
            collapsed ? "h-12 w-12 p-0" : "py-3"
          )}
        >
          <Plus size={collapsed ? 20 : 16} />
          {!collapsed && "New Audit"}
        </button>
      </div>
    </aside>
  );
};

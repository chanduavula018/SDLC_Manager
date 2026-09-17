import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface DetailTab {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status?: string;
  badgeType?: 'status' | 'priority' | 'role';
  overviewItems: { label: string; value: React.ReactNode }[];
  tabs?: DetailTab[];
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  status,
  badgeType = 'status',
  overviewItems,
  tabs = [],
}) => {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0]?.id || 'overview');

  useEffect(() => {
    if (tabs.length > 0) {
      setActiveTab(tabs[0].id);
    } else {
      setActiveTab('overview');
    }
  }, [isOpen, tabs.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl glass-modal border-l border-[var(--border-color)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--border-color)] bg-slate-500/10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
                {status && <StatusBadge status={status} type={badgeType} />}
              </div>
              {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs if available */}
          {tabs.length > 0 && (
            <div className="px-6 border-b border-[var(--border-color)] flex space-x-4 overflow-x-auto bg-slate-500/5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Overview
              </button>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-500/20 text-[var(--text-primary)]">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' || tabs.length === 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {overviewItems.map((item, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                        {item.label}
                      </span>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{item.value || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              tabs.find((t) => t.id === activeTab)?.content
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border-color)] bg-slate-500/10 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Enterprise SDLC &amp; DevOps Inspector</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

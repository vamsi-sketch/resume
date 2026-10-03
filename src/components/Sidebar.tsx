import React from 'react';
import { LayoutDashboard, Briefcase, Upload, Award, FileCode2, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'job' | 'upload' | 'results' | 'codebase';
  setActiveTab: (tab: 'dashboard' | 'job' | 'upload' | 'results' | 'codebase') => void;
  screenedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, screenedCount }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'job' as const, label: 'Job Descriptions', icon: Briefcase },
    { id: 'upload' as const, label: 'Upload Resumes', icon: Upload },
    { id: 'results' as const, label: 'Candidate Results', icon: Award, badge: screenedCount > 0 ? screenedCount : undefined },
    { id: 'codebase' as const, label: 'Python & MongoDB Docs', icon: FileCode2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100">
          AI
        </div>
        <div>
          <div className="font-bold text-slate-900 leading-tight tracking-tight">ResumeAI</div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Candidate Matcher</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>NLP Semantic Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Sentence-level cosine vector matching &amp; ontology extraction
        </p>
      </div>
    </aside>
  );
};

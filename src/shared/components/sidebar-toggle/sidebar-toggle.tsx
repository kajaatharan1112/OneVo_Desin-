import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ collapsed, onToggle }) => {
  return (
    <button
      type="button"
      className="sidebar-toggle"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-controls="app-sidebar"
      aria-label={collapsed ? 'Expand sidebar menu' : 'Minimize sidebar menu'}
      title={collapsed ? 'Expand menu' : 'Minimize menu'}
    >
      {collapsed ? <ChevronRight size={18} strokeWidth={2.25} /> : <ChevronLeft size={18} strokeWidth={2.25} />}
    </button>
  );
};

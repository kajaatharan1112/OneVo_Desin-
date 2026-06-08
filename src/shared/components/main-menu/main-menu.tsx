import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  Users, 
  Clock, 
  MessageSquare, 
  Inbox, 
  PieChart, 
  Briefcase,
  Contact,
  Building2
} from 'lucide-react';
import { MainMenuItem } from './main-menu-item';

interface MainMenuProps {
  currentView: 'employee' | 'tenant';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentView,
  activeTab,
  setActiveTab,
  collapsed = false
}) => {
  const tenantItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Project', icon: <FolderOpen size={20} /> },
    { label: 'Calendar', icon: <Calendar size={20} /> },
    { label: 'People', icon: <Users size={20} /> },
    { label: 'Members', icon: <Contact size={20} /> },
    { label: 'Attendance', icon: <Clock size={20} /> },
    { label: 'Requests', icon: <Inbox size={20} /> },
    { label: 'Reports', icon: <PieChart size={20} /> },
    { label: 'Organization', icon: <Building2 size={20} /> }
  ];

  const employeeItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Workspace', icon: <Briefcase size={20} /> },
    { label: 'Calendar', icon: <Calendar size={20} /> },
    { label: 'People', icon: <Users size={20} /> },
    { label: 'Attendance', icon: <Clock size={20} /> },
    { label: 'Chat', icon: <MessageSquare size={20} /> },
    { label: 'Reports', icon: <PieChart size={20} /> }
  ];

  const menuItems = currentView === 'tenant' ? tenantItems : employeeItems;

  useEffect(() => {
    setActiveTab(menuItems[0].label);
  }, [currentView]);

  return (
    <nav className="main-menu" aria-label="Main menu">
      <span className="main-menu__label">Main Menu</span>

      {menuItems.map((item) => (
        <MainMenuItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.label}
          collapsed={collapsed}
          onClick={() => setActiveTab(item.label)}
        />
      ))}
    </nav>
  );
};

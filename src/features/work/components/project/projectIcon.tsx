import React from 'react';
import {
  Activity,
  FolderKanban,
  Layers,
  Server,
  Smartphone,
  Users,
  type LucideIcon,
} from 'lucide-react';

const PROJECT_ICON_MAP: Record<string, LucideIcon> = {
  layers: Layers,
  server: Server,
  smartphone: Smartphone,
  users: Users,
  activity: Activity,
  folder: FolderKanban,
};

interface ProjectIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const ProjectIcon: React.FC<ProjectIconProps> = ({ icon, size = 16, className }) => {
  const Icon = PROJECT_ICON_MAP[icon] ?? FolderKanban;
  return <Icon size={size} className={className} aria-hidden="true" />;
};

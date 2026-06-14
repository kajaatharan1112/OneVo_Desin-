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

const EMOJI_PATTERN = /^[\p{Extended_Pictographic}\u2600-\u27BF]/u;

export const ProjectIcon: React.FC<ProjectIconProps> = ({ icon, size = 16, className }) => {
  if (EMOJI_PATTERN.test(icon) || (icon.length <= 2 && !PROJECT_ICON_MAP[icon])) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">
        {icon}
      </span>
    );
  }
  const Icon = PROJECT_ICON_MAP[icon] ?? FolderKanban;
  return <Icon size={size} className={className} aria-hidden="true" />;
};

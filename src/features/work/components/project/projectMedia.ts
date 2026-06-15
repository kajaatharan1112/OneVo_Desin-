import type { CSSProperties } from 'react';

export type ProjectIconType = 'emoji' | 'icon';

const EMOJI_PATTERN = /^[\p{Extended_Pictographic}\u2600-\u27BF]/u;
const KNOWN_ICON_IDS = new Set(['folder', 'layers', 'server', 'smartphone', 'activity', 'users']);

export function resolveProjectIconType(icon: string): ProjectIconType {
  if (EMOJI_PATTERN.test(icon) || (icon.length <= 2 && !KNOWN_ICON_IDS.has(icon))) {
    return 'emoji';
  }
  return 'icon';
}

export interface ProjectCoverFields {
  coverImage: string | null;
  coverColor: string;
}

export function projectCoverStyle(project: ProjectCoverFields): CSSProperties {
  if (project.coverImage) {
    return {
      backgroundImage: `url(${project.coverImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {
    background: `linear-gradient(135deg, ${project.coverColor} 0%, color-mix(in srgb, ${project.coverColor} 72%, #000) 100%)`,
  };
}

export function projectIconSurfaceStyle(
  project: ProjectCoverFields & { iconColor?: string | null },
): CSSProperties {
  const tint = project.iconColor ?? project.coverColor;
  return { background: `color-mix(in srgb, ${tint} 14%, var(--surface))` };
}

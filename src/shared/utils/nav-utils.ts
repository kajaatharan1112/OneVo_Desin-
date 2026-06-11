import type { NavItem } from '../components/main-menu/main-menu';

export function findNavItem(items: NavItem[], activeTab: string): NavItem | undefined {
  return items.find((item) => item.label === activeTab);
}

export function getDefaultSubItemId(navItem: NavItem | undefined): string {
  return navItem?.subSections[0]?.items[0]?.id ?? '';
}

export function resolveSubItemId(
  navItem: NavItem | undefined,
  subItemId: string
): string {
  if (!navItem?.subSections.length) return '';

  const isValid = navItem.subSections.some((section) =>
    section.items.some((item) => item.id === subItemId)
  );

  return isValid ? subItemId : getDefaultSubItemId(navItem);
}

export function getSubItemLabel(
  navItem: NavItem | undefined,
  subItemId: string
): string | undefined {
  const resolvedId = resolveSubItemId(navItem, subItemId);
  if (!navItem || !resolvedId) return undefined;

  for (const section of navItem.subSections) {
    const match = section.items.find((item) => item.id === resolvedId);
    if (match) return match.label;
  }

  return undefined;
}

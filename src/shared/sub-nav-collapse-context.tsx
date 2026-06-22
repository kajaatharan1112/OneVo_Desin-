import { createContext, useContext } from 'react';

interface SubNavCollapseContextValue {
  hasSubNav: boolean;
  subNavCollapsed: boolean;
  onExpand: () => void;
}

const SubNavCollapseContext = createContext<SubNavCollapseContextValue>({
  hasSubNav: false,
  subNavCollapsed: false,
  onExpand: () => {},
});

export const SubNavCollapseProvider = SubNavCollapseContext.Provider;
export const useSubNavCollapse = () => useContext(SubNavCollapseContext);

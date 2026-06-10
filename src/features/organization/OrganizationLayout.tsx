import React from 'react';
import { Outlet } from 'react-router-dom';
import { OrgToast } from './components/OrgToast';

export const OrganizationLayout: React.FC = () => (
  <>
    <Outlet />
    <OrgToast />
  </>
);

import React, { useEffect } from 'react';
import { useWork } from './context/work-context';
import { CreateWorkspaceDrawer } from './components/CreateWorkspaceDrawer';
import { ManageWorkspacesDrawer } from './components/ManageWorkspacesDrawer';
import { CreateProjectDrawer } from './components/CreateProjectDrawer';
import { MyWorkPage } from './pages/MyWorkPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

interface WorkRoutesProps {
  activeSubItemId: string;
}

export const WorkRoutes: React.FC<WorkRoutesProps> = ({ activeSubItemId }) => {
  const { selectedProjectId, closeProject } = useWork();

  useEffect(() => () => closeProject(), [closeProject]);

  if (selectedProjectId) {
    return (
      <>
        <ProjectDetailPage />
        <CreateWorkspaceDrawer />
        <ManageWorkspacesDrawer />
        <CreateProjectDrawer />
      </>
    );
  }

  let page: React.ReactNode;
  switch (activeSubItemId) {
    case 'projects':
      page = <ProjectsPage />;
      break;
    case 'documents':
      page = <DocumentsPage />;
      break;
    case 'my-work':
    default:
      page = <MyWorkPage />;
      break;
  }

  return (
    <>
      {page}
      <CreateWorkspaceDrawer />
      <ManageWorkspacesDrawer />
      <CreateProjectDrawer />
    </>
  );
};

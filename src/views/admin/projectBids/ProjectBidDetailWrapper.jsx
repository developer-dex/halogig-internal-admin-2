import React from 'react';
import ProjectBidDetail from './ProjectBidDetail';

export default function ProjectBidDetailWrapper() {
  // For /project-bids route, only show: Client Info, Freelancer Info, Project Info, SOW
  const visibleTabs = ['Client Info', 'Freelancer Info', 'Project Info', 'SOW'];
  
  return (
    <ProjectBidDetail
      visibleTabs={visibleTabs}
      backRoute="/admin/project-bids"
      breadcrumbLabel="Project Bids"
    />
  );
}


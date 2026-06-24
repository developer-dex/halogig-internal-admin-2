import React from 'react';
import ProjectBidDetail from './ProjectBidDetail';

export default function ProjectBidDetailWrapper() {
  // Show: Client Info, Freelancer Info, Project Info, Bid Info (SOW modification + approval), SOW, Milestones
  const visibleTabs = ['Client Info', 'Billing Info', 'Freelancer Info', 'Project Info', 'Bid Info', 'SOW', 'Milestones'];
  
  return (
    <ProjectBidDetail
      visibleTabs={visibleTabs}
      backRoute="/admin/project-bids"
      breadcrumbLabel="Project Bids"
    />
  );
}


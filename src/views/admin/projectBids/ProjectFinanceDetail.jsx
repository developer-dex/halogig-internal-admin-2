import React from 'react';
import ProjectBidDetail from './ProjectBidDetail';

export default function ProjectFinanceDetail() {
  const visibleTabs = ['Client Info', 'Billing Info', 'Freelancer Info', 'Project Info', 'Bid Info', 'SOW', 'Milestones'];
  
  return (
    <ProjectBidDetail
      visibleTabs={visibleTabs}
      backRoute="/admin/project-finance"
      breadcrumbLabel="Project Finance"
    />
  );
}


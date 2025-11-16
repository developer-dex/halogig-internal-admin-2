import React from 'react';
import ProjectBidDetail from './ProjectBidDetail';

export default function ProjectDeliveryDetail() {
  const visibleTabs = ['Client Info', 'Freelancer Info', 'Project Info', 'Milestones'];
  
  return (
    <ProjectBidDetail
      visibleTabs={visibleTabs}
      backRoute="/admin/project-delivery"
      breadcrumbLabel="Project Delivery"
    />
  );
}


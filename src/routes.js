import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdDashboard,
  MdPeople,
  MdWork,
  MdFolder,
  MdGavel,
  MdContacts,
  MdWeb,
  MdChat,
  MdAnalytics,
  MdHistory,
  MdLock,
  MdHome,
  MdPerson,
  MdBarChart,
  MdOutlineShoppingCart,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';
import RTL from 'views/admin/rtl';
import PostProject from 'views/admin/projects';
import ProjectBids from 'views/admin/projectBids';

// Auth Imports
import SignInCentered from 'views/auth/signIn';

// Admin Page Imports
import ClientList from 'views/admin/clients';
import FreelancerList from 'views/admin/freelancers';
import ProjectList from 'views/admin/projects';
import ContactList from 'views/admin/contacts';
import WebsiteData from 'views/admin/websiteData';
import WebsiteDataDetails from 'views/admin/websiteData/WebsiteDataDetails';
import SiteAnalytics from 'views/admin/siteAnalytics';
const ProjectBidsPage = () => <ProjectBids />;
const ContactsPage = () => <ContactList />;
const WebsiteDataPage = () => <WebsiteData />;
const ChatRoomsPage = () => <div>Chat Rooms Page - Coming Soon</div>;
const SiteAnalyticsPage = () => <SiteAnalytics />;
const LogManagerPage = () => <div>Log Manager Page - Coming Soon</div>;

const routes = [
  // Auth Routes (hidden from sidebar)
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    component: <SignInCentered />,
    hidden: true, // Hide from sidebar navigation
  },
  {
    category: 'Registration',
    layout: '/admin',
    items: [
      {
        name: 'Freelancers',
        layout: '/admin',
        path: '/freelancers',
        icon: <Icon as={MdWork} width="20px" height="20px" color="inherit" />,
        component: <FreelancerList />,
      },
    ],
  },
  // {
  //   name: 'Main Dashboard',
  //   layout: '/admin',
  //   path: '/default',
  //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  //   component: <MainDashboard />,
  // },
  // {
  //   category: 'Main',
  //   layout: '/admin',
  //   items: [
  //     {
  //       name: 'Access Dashboard',
  //       layout: '/admin',
  //       path: '/dashboard',
  //       icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
  //       component: <MainDashboard />,
  //     },
  //   ],
  // },
  {
    category: 'Management',
    layout: '/admin',
    items: [
      {
        name: 'Online Clients',
        layout: '/admin',
        path: '/online-clients',
        icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
        component: <ClientList />,
      },
      {
        name: 'Offline Clients',
        layout: '/admin',
        path: '/offline-clients',
        icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
        component: <ClientList />,
      },
      {
        name: 'Freelancers',
        layout: '/admin',
        path: '/freelancers',
        icon: <Icon as={MdWork} width="20px" height="20px" color="inherit" />,
        component: <FreelancerList />,
      },
      {
        name: 'Online Projects',
        layout: '/admin',
        path: '/online-projects',
        icon: <Icon as={MdFolder} width="20px" height="20px" color="inherit" />,
        component: <ProjectList />,
      },
      {
        name: 'Offline Projects',
        layout: '/admin',
        path: '/offline-projects',
        icon: <Icon as={MdFolder} width="20px" height="20px" color="inherit" />,
        component: <ProjectList />,
      },
      {
        name: 'Project Bids',
        layout: '/admin',
        path: '/project-bids',
        icon: <Icon as={MdGavel} width="20px" height="20px" color="inherit" />,
        component: <ProjectBidsPage />,
      },
    ],
  },
  {
    category: 'Proposal',
    layout: '/admin',
    items: [
      {
        name: 'Project Bids',
        layout: '/admin',
        path: '/project-bids',
        icon: <Icon as={MdGavel} width="20px" height="20px" color="inherit" />,
        component: <ProjectBidsPage />,
      },
    ],
  },
  {
    category: 'Marketing',
    layout: '/admin',
    items: [
      {
        name: 'Website Data',
        layout: '/admin',
        path: '/website-data',
        icon: <Icon as={MdWeb} width="20px" height="20px" color="inherit" />,
        component: <WebsiteDataPage />,
      },
      {
        name: 'Site Analytics',
        layout: '/admin',
        path: '/site-analytics',
        icon: <Icon as={MdAnalytics} width="20px" height="20px" color="inherit" />,
        component: <SiteAnalyticsPage />,
      },
    ],
  },
  {
    category: 'Communication',
    layout: '/admin',
    items: [
      {
        name: 'Contacts',
        layout: '/admin',
        path: '/contact',
        icon: <Icon as={MdContacts} width="20px" height="20px" color="inherit" />,
        component: <ContactsPage />,
      },
      {
        name: 'Chat Rooms',
        layout: '/admin',
        path: '/chat',
        icon: <Icon as={MdChat} width="20px" height="20px" color="inherit" />,
        component: <ChatRoomsPage />,
      },
    ],
  },

];

export default routes;

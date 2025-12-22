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
  MdPowerSettingsNew,
  MdAttachMoney,
  MdArticle,
  MdScience,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';
import RTL from 'views/admin/rtl';
import PostProject from 'views/admin/projects';
import ProjectBids from 'views/admin/projectBids';
import ProjectFinance from 'views/admin/projectBids/ProjectFinance';
import ProjectDelivery from 'views/admin/projectBids/ProjectDelivery';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import VerifyOtp from 'views/auth/verifyOtp';

// Admin Page Imports
import ClientList from 'views/admin/clients';
import FreelancerList from 'views/admin/freelancers';
import ProjectList from 'views/admin/projects';
import ContactList from 'views/admin/contacts';
import WebsiteData from 'views/admin/websiteData';
import WebsiteDataDetails from 'views/admin/websiteData/WebsiteDataDetails';
import SiteAnalytics from 'views/admin/siteAnalytics';
import ChatRoom from 'views/admin/chatRoom';
import UserChatRoom from 'views/admin/userChatRoom';
import Blog from 'views/admin/blog';
import EmailDomainAnalysis from 'views/admin/ai';
const ProjectBidsPage = () => <ProjectBids />;
const ProjectFinancePage = () => <ProjectFinance />;
const ProjectDeliveryPage = () => <ProjectDelivery />;
const ContactsPage = () => <ContactList />;
const WebsiteDataPage = () => <WebsiteData />;
const ChatRoomsPage = () => <ChatRoom />;
const UserChatRoomsPage = () => <UserChatRoom />;
const SiteAnalyticsPage = () => <SiteAnalytics />;
const BlogPage = () => <Blog />;
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
    name: 'Verify OTP',
    layout: '/auth',
    path: '/verify-otp',
    component: <VerifyOtp />,
    hidden: true, // Hide from sidebar navigation
  },
  // Dashboard at the top
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
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
        name: 'Clients',
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
      }
    ],
  },
  {
    category: 'Finance',
    layout: '/admin',
    items: [
     
      {
        name: 'Project Finance',
        layout: '/admin',
        path: '/project-finance',
        icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
        component: <ProjectFinancePage />,
      }
    ],
  },
  {
    category: 'Delivery',
    layout: '/admin',
    items: [
      {
        name: 'Project Delivery',
        layout: '/admin',
        path: '/project-delivery',
        icon: <Icon as={MdWork} width="20px" height="20px" color="inherit " />,
        component: <ProjectDeliveryPage />,
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
        name: 'Blog',
        layout: '/admin',
        path: '/blog',
        icon: <Icon as={MdArticle} width="20px" height="20px" color="inherit" />,
        component: <BlogPage />,
      },
      {
        name: 'Visitor Analytics',
        layout: '/admin',
        path: '/site-analytics',
        icon: <Icon as={MdAnalytics} width="20px" height="20px" color="inherit" />,
        component: <SiteAnalyticsPage />,
      },
    ],
  },
  {
    category: 'AI',
    layout: '/admin',
    items: [
      {
        name: 'Email Domain Analysis',
        layout: '/admin',
        path: '/ai/email-domain-analysis',
        icon: <Icon as={MdScience} width="20px" height="20px" color="inherit" />,
        component: <EmailDomainAnalysis />,
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
      // {
      //   name: 'User Chat Rooms',
      //   layout: '/admin',
      //   path: '/user-chat-rooms',
      //   icon: <Icon as={MdChat} width="20px" height="20px" color="inherit" />,
      //   component: <UserChatRoomsPage />,
      // },
    ],
  },

];

export default routes;

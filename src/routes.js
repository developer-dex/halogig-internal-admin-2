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
  MdSupport,
  MdAssignment,
  MdCleaningServices,
  MdDataset,
  MdCampaign,
  MdOutlineReportProblem,
} from 'react-icons/md';
import { FaGoogle, FaLinkedin, FaTwitter } from 'react-icons/fa';

// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';
import RTL from 'views/admin/rtl';
import PostProject from 'views/admin/projects';
import ProjectBids from 'views/admin/projectBids';
import HalogigBids from 'views/admin/projectBids/HalogigBids';
import NewOrder from 'views/admin/projectBids/NewOrder';
import Payments from 'views/admin/projectBids/Payments';
import FreelancerPayments from 'views/admin/projectBids/FreelancerPayments';
import ProjectDelivery from 'views/admin/projectBids/ProjectDelivery';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import VerifyOtp from 'views/auth/verifyOtp';

// Admin Page Imports
import ClientList from 'views/admin/clients';
import FreelancerList from 'views/admin/freelancers';
import ReferralPartnerList from 'views/admin/referralPartners';
import SalesReferralLeadList from 'views/admin/salesReferral';
import DisputesList from 'views/admin/disputes';
import ProjectList from 'views/admin/projects';
import ContactList from 'views/admin/contacts';
import WebsiteData from 'views/admin/websiteData';
import WebsiteDataDetails from 'views/admin/websiteData/WebsiteDataDetails';
import SiteAnalytics from 'views/admin/siteAnalytics';
import ChatRoom from 'views/admin/chatRoom';
import UserChatRoom from 'views/admin/userChatRoom';
import Blog from 'views/admin/blog';
import EmailDomainAnalysis from 'views/admin/ai';
import EmailClearens from 'views/admin/ai/EmailClearens';
import CentralDataRecords from 'views/admin/ai/CentralDataRecords';
import DraftCampaigns from 'views/admin/ai/DraftCampaigns';
import EmailDomainAnalysisV2 from 'views/admin/ai2';
import EmailClearensV2 from 'views/admin/ai2/EmailClearens';
import CentralDataRecordsV2 from 'views/admin/ai2/CentralDataRecords';
import DraftCampaignsV2 from 'views/admin/ai2/DraftCampaigns';
import InstantlyAnalytics from 'views/admin/instantlyAnalytics';
import FreelancerTickets from 'views/admin/freelancerTickets';
import ClientTickets from 'views/admin/clientTickets';
import HalogigTestimonials from 'views/admin/testimonials';
import WebsiteTestimonials from 'views/admin/testimonials/WebsiteTestimonials';
import AdminProjects from 'views/admin/adminProjects';
import WebRotData from 'views/admin/webRotData';
import LinkedInAccessToken from 'views/admin/linkedinAccessToken';
import Google from 'views/admin/google';
import TwitterAccessToken from 'views/admin/twitterAccessToken';
import CategoryManagement from 'views/admin/taxonomy/CategoryManagement';
import SubCategoryManagement from 'views/admin/taxonomy/SubCategoryManagement';
import TechnologyManagement from 'views/admin/taxonomy/TechnologyManagement';
import Admins from 'views/admin/admins/Admins';
const ProjectBidsPage = () => <ProjectBids />;
const HalogigBidsPage = () => <HalogigBids />;
const NewOrderPage = () => <NewOrder />;
const PaymentsPage = () => <Payments />;
const FreelancerPaymentsPage = () => <FreelancerPayments />;
const ProjectDeliveryPage = () => <ProjectDelivery />;
const ContactsPage = () => <ContactList />;
const WebsiteDataPage = () => <WebsiteData />;
const ChatRoomsPage = () => <ChatRoom />;
const UserChatRoomsPage = () => <UserChatRoom />;
const SiteAnalyticsPage = () => <SiteAnalytics />;
const BlogPage = () => <Blog />;
const LogManagerPage = () => <div>Log Manager Page - Coming Soon</div>;

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  // Auth Routes (hidden from sidebar)
  {
    category: 'Security',
    layout: '/admin',
    items: [
      {
        name: 'Admins',
        layout: '/admin',
        path: '/admins',
        icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
        component: <Admins />,
      },
    ],
  },
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
      {
        name: 'Referral Partners',
        layout: '/admin',
        path: '/referral-partners',
        icon: <Icon as={MdWork} width="20px" height="20px" color="inherit" />,
        component: <ReferralPartnerList />,
      },
    ],
  },
  {
    category: 'Website Modules',
    layout: '/admin',
    items: [
      {
        name: 'Category',
        layout: '/admin',
        path: '/cat-tech-management/categories',
        icon: <Icon as={MdFolder} width="20px" height="20px" color="inherit" />,
        component: <CategoryManagement />,
      },
      {
        name: 'Sub Category',
        layout: '/admin',
        path: '/cat-tech-management/sub-categories',
        icon: <Icon as={MdContacts} width="20px" height="20px" color="inherit" />,
        component: <SubCategoryManagement />,
      },
      {
        name: 'Technology',
        layout: '/admin',
        path: '/cat-tech-management/technologies',
        icon: <Icon as={MdScience} width="20px" height="20px" color="inherit" />,
        component: <TechnologyManagement />,
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
        path: '/freelancers-management',
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
      {
        name: 'Sales Referral Leads',
        layout: '/admin',
        path: '/sales-referral-leads',
        icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
        component: <SalesReferralLeadList />,
      },
      {
        name: 'Disputes',
        layout: '/admin',
        path: '/disputes',
        icon: <Icon as={MdOutlineReportProblem} width="20px" height="20px" color="inherit" />,
        component: <DisputesList />,
      }
    ]
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
      {
        name: 'Halogig Bids',
        layout: '/admin',
        path: '/halogig-bids',
        icon: <Icon as={MdGavel} width="20px" height="20px" color="inherit" />,
        component: <HalogigBidsPage />,
      }
    ],
  },
  {
    category: 'Finance',
    layout: '/admin',
    items: [
     
      {
        name: 'New Order',
        layout: '/admin',
        path: '/new-order',
        icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
        component: <NewOrderPage />,
      },
      {
        name: 'Payments',
        layout: '/admin',
        path: '/payments',
        icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
        component: <PaymentsPage />,
      },
      {
        name: 'Freelancer Payments',
        layout: '/admin',
        path: '/freelancer-payments',
        icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
        component: <FreelancerPaymentsPage />,
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
        name: 'AI Website Data',
        layout: '/admin',
        path: '/ai-website-data',
        icon: <Icon as={MdWeb} width="20px" height="20px" color="inherit" />,
        component: <WebRotData />,
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
      {
        name: 'Projects',
        layout: '/admin',
        path: '/ai/admin-projects',
        icon: <Icon as={MdFolder} width="20px" height="20px" color="inherit" />,
        component: <AdminProjects />,
      },
      {
        name: 'Instantly Analytics',
        layout: '/admin',
        path: '/ai/instantly-analytics',
        icon: <Icon as={MdAnalytics} width="20px" height="20px" color="inherit" />,
        component: <InstantlyAnalytics />,
      },
      {
        name: 'Email Clearance',
        layout: '/admin',
        path: '/ai/email-clearens',
        icon: <Icon as={MdCleaningServices} width="20px" height="20px" color="inherit" />,
        component: <EmailClearens />,
      },
      {
        name: 'Central Data Records',
        layout: '/admin',
        path: '/ai/central-data-records',
        icon: <Icon as={MdDataset} width="20px" height="20px" color="inherit" />,
        component: <CentralDataRecords />,
      },
      {
        name: 'Draft Campaigns',
        layout: '/admin',
        path: '/ai/draft-campaigns',
        icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
        component: <DraftCampaigns />,
      },
    ],
  },
  {
    category: 'AI 2',
    layout: '/admin',
    items: [
      {
        name: 'Email Domain Analysis (V2)',
        layout: '/admin',
        path: '/ai2/email-domain-analysis',
        icon: <Icon as={MdScience} width="20px" height="20px" color="inherit" />,
        component: <EmailDomainAnalysisV2 />,
      },
      {
        name: 'Projects',
        layout: '/admin',
        path: '/ai2/admin-projects',
        icon: <Icon as={MdFolder} width="20px" height="20px" color="inherit" />,
        component: <AdminProjects />,
      },
      {
        name: 'Instantly Analytics',
        layout: '/admin',
        path: '/ai2/instantly-analytics',
        icon: <Icon as={MdAnalytics} width="20px" height="20px" color="inherit" />,
        component: <InstantlyAnalytics />,
      },
      {
        name: 'Email Clearance (V2)',
        layout: '/admin',
        path: '/ai2/email-clearens',
        icon: <Icon as={MdCleaningServices} width="20px" height="20px" color="inherit" />,
        component: <EmailClearensV2 />,
      },
      {
        name: 'Central Data Records (V2)',
        layout: '/admin',
        path: '/ai2/central-data-records',
        icon: <Icon as={MdDataset} width="20px" height="20px" color="inherit" />,
        component: <CentralDataRecordsV2 />,
      },
      {
        name: 'Draft Campaigns (V2)',
        layout: '/admin',
        path: '/ai2/draft-campaigns',
        icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
        component: <DraftCampaignsV2 />,
      },
    ],
  },
  {
    category: 'Token Management',
    layout: '/admin',
    items: [
      {
        name: 'Google',
        layout: '/admin',
        path: '/google',
        icon: <Icon as={FaGoogle} width="20px" height="20px" color="inherit" />,
        component: <Google />,
      },
      {
        name: 'LinkedIn Access Token',
        layout: '/admin',
        path: '/linkedin-access-token',
        icon: <Icon as={FaLinkedin} width="20px" height="20px" color="inherit" />,
        component: <LinkedInAccessToken />,
      },
      {
        name: 'Twitter Access Token',
        layout: '/admin',
        path: '/twitter-access-token',
        icon: <Icon as={FaTwitter} width="20px" height="20px" color="inherit" />,
        component: <TwitterAccessToken />,
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
  {
    category: 'Customer Service',
    layout: '/admin',
    items: [
      {
        name: 'Freelancer Tickets',
        layout: '/admin',
        path: '/freelancer-tickets',
        icon: <Icon as={MdSupport} width="20px" height="20px" color="inherit" />,
        component: <FreelancerTickets />,
      },
      {
        name: 'Clients Tickets',
        layout: '/admin',
        path: '/client-tickets',
        icon: <Icon as={MdSupport} width="20px" height="20px" color="inherit" />,
        component: <ClientTickets />,
      },
    ],
  },
  {
    category: 'Testimonial',
    layout: '/admin',
    items: [
      {
        name: 'Halogig',
        layout: '/admin',
        path: '/testimonials/halogig',
        icon: <Icon as={MdArticle} width="20px" height="20px" color="inherit" />,
        component: <HalogigTestimonials />,
      },
      {
        name: 'Website',
        layout: '/admin',
        path: '/testimonials/website',
        icon: <Icon as={MdArticle} width="20px" height="20px" color="inherit" />,
        component: <WebsiteTestimonials />,
      },
    ],
  }

];

export default routes;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Spinner,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Avatar,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  MdArrowBack,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdPublic,
  MdCalendarToday,
  MdAttachMoney,
  MdWork,
  MdDescription,
  MdCategory,
  MdSchedule,
  MdLanguage,
  MdInfo,
  MdTrendingUp,
  MdAccountCircle,
  MdAssignment,
  MdCheckCircle,
  MdHourglassEmpty,
  MdFlag,
  MdHome,
} from 'react-icons/md';
import {
  getProjectBidDetails,
  clearCurrentBid,
  approveMilestoneByAdmin,
  clearApproveMilestoneState,
} from '../../../features/admin/projectBidsSlice';
import { showSuccess, showError } from '../../../helpers/messageHelper';

export default function ProjectBidDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Get data from Redux store
  const { currentBid, isApprovingMilestone, approveMilestoneSuccess, approveMilestoneError } = 
    useSelector((state) => state.projectBidsReducer);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.800');
  const tabBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchBidDetails = async () => {
    setIsLoading(true);
    try {
      await dispatch(getProjectBidDetails(bidId));
    } catch (error) {
      console.error('Error fetching bid details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bidId) {
      fetchBidDetails();
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentBid());
    };
  }, [dispatch, bidId]);

  // Handle success/error states for milestone approval
  useEffect(() => {
    if (approveMilestoneSuccess) {
      showSuccess('Milestone approved successfully!');
      dispatch(clearApproveMilestoneState());
      fetchBidDetails();
    }
    if (approveMilestoneError) {
      showError('Failed to approve milestone');
      dispatch(clearApproveMilestoneState());
    }
  }, [approveMilestoneSuccess, approveMilestoneError, dispatch]);

  // Helper function to get status colors
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'orange.100', color: 'orange.700', border: 'orange.300' };
      case 'accepted':
        return { bg: 'green.100', color: 'green.700', border: 'green.300' };
      case 'rejected':
        return { bg: 'red.100', color: 'red.700', border: 'red.300' };
      case 'in_progress':
        return { bg: 'blue.100', color: 'blue.700', border: 'blue.300' };
      case 'completed':
        return { bg: 'green.100', color: 'green.700', border: 'green.300' };
      default:
        return { bg: 'gray.100', color: 'gray.700', border: 'gray.300' };
    }
  };

  // Helper function to render info item
  const renderInfoItem = (icon, label, value, fullWidth = false, isLink = false) => {
    if (!value && value !== 0 && value !== false) return null;

    return (
      <Box gridColumn={fullWidth ? 'span 2' : 'span 1'}>
        <VStack align="start" spacing={2} p={4} bg={tabBg} borderRadius="md" h="full">
          <HStack spacing={2}>
            <Box color="brand.500">{icon}</Box>
            <Text fontSize="sm" fontWeight="600" color="gray.500">
              {label}
            </Text>
          </HStack>
          {isLink ? (
            <Link href={value} target="_blank" rel="noopener noreferrer" color="brand.500" fontSize="sm" wordBreak="break-all">
              {value}
            </Link>
          ) : (
            <Text fontSize="sm" fontWeight="500" color={textColor} wordBreak="break-word">
              {value}
            </Text>
          )}
        </VStack>
      </Box>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewSalesOrder = (milestoneIndex) => {
    const milestone = currentBid?.milestones?.[milestoneIndex] || currentBid?.sow?.milestones?.[milestoneIndex];
    const milestoneId = milestone?.id || milestone?.milestone_id || milestoneIndex;
    navigate(`/admin/salesorder/${milestoneId}/${bidId}`);
  };

  const handleGenerateInvoice = (milestoneIndex) => {
    const milestone = currentBid?.milestones?.[milestoneIndex] || currentBid?.sow?.milestones?.[milestoneIndex];
    const milestoneId = milestone?.id || milestone?.milestone_id || milestoneIndex;
    navigate(`/admin/invoice/${milestoneId}/${bidId}`);
  };

  const handleOrderApproved = async (milestoneIndex) => {
    try {
      const milestone = currentBid?.milestones?.[milestoneIndex] || currentBid?.sow?.milestones?.[milestoneIndex];
      const milestoneId = milestone?.id || milestone?.milestone_id || milestoneIndex;
      
      if (!milestoneId) {
        showError('Milestone ID not found');
        return;
      }

      await dispatch(approveMilestoneByAdmin(milestoneId));
    } catch (error) {
      console.error('Error approving milestone:', error);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Box>
    );
  }

  if (!currentBid) {
    return (
      <Box>
        <Card mb="20px" bg={cardBg}>
          <Box p="24px">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">
                  <HStack spacing={1}>
                    <MdHome />
                    <Text>Home</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/project-bids">
                  <HStack spacing={1}>
                    <MdAssignment />
                    <Text>Project Bids</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>
                  <HStack spacing={1}>
                    <MdInfo />
                    <Text>Bid #{bidId}</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </Box>
        </Card>

        <Card bg={cardBg}>
          <Box p="24px" textAlign="center">
            <Alert status="error" mb={4}>
              <AlertIcon />
              Bid not found
            </Alert>
            <Button
              leftIcon={<MdArrowBack />}
              colorScheme="brand"
              onClick={() => navigate('/admin/project-bids')}
            >
              Back to Project Bids
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumb */}
      <Card mb="20px" bg={cardBg}>
        <Box p="24px">
          <Flex justify="space-between" align="center">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">
                  <HStack spacing={1}>
                    <MdHome />
                    <Text>Home</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/project-bids">
                  <HStack spacing={1}>
                    <MdAssignment />
                    <Text>Project Bids</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>
                  <HStack spacing={1}>
                    <MdInfo />
                    <Text>Bid #{bidId}</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Button
              leftIcon={<MdArrowBack />}
              variant="outline"
              onClick={() => navigate('/admin/project-bids')}
            >
              Back to Project Bids
            </Button>
          </Flex>
        </Box>
      </Card>

      {/* Main Content */}
      <Card bg={cardBg}>
        <Box p="24px">
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="brand">
            <TabList>
              <Tab>Client Info</Tab>
              <Tab>Billing Info</Tab>
              <Tab>Freelancer Info</Tab>
              <Tab>Project Info</Tab>
              <Tab>Bid Info</Tab>
              <Tab>SOW</Tab>
              <Tab>Milestones</Tab>
            </TabList>

            <TabPanels>
              {/* Client Info Tab */}
              <TabPanel>
                <VStack align="start" spacing={6}>
                  <HStack spacing={3}>
                    <MdPerson size="24px" color="var(--chakra-colors-brand-500)" />
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      Client Information
                    </Text>
                  </HStack>
                  <Divider />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    {renderInfoItem(
                      <MdPerson />,
                      'Client Name',
                      `${currentBid.ClientProject?.User?.first_name || ''} ${currentBid.ClientProject?.User?.last_name || ''}`.trim()
                    )}
                    {renderInfoItem(
                      <MdEmail />,
                      'Client Email',
                      currentBid.ClientProject?.User?.email
                    )}
                    {renderInfoItem(
                      <MdPhone />,
                      'Client Mobile',
                      currentBid.ClientProject?.User?.mobile
                    )}
                    {renderInfoItem(
                      <MdBusiness />,
                      'Company Name',
                      currentBid.ClientProject?.User?.company_name || '--'
                    )}
                    {renderInfoItem(
                      <MdPublic />,
                      'Gender',
                      currentBid.ClientProject?.User?.gender || '--'
                    )}
                    {renderInfoItem(
                      <MdPublic />,
                      'Country',
                      currentBid.ClientProject?.User?.country || '--'
                    )}
                    {renderInfoItem(
                      <MdLocationOn />,
                      'State',
                      currentBid.ClientProject?.User?.state || '--'
                    )}
                    {renderInfoItem(
                      <MdLocationOn />,
                      'City',
                      currentBid.ClientProject?.User?.city || '--'
                    )}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Billing Info Tab */}
              <TabPanel>
                <VStack align="start" spacing={6}>
                  <HStack spacing={3}>
                    <MdAttachMoney size="24px" color="var(--chakra-colors-brand-500)" />
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      Billing Information
                    </Text>
                  </HStack>
                  <Divider />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    {renderInfoItem(
                      <MdPerson />,
                      'Billing Name',
                      currentBid.ClientProject?.User?.billingDetails?.billing_name || '--'
                    )}
                    {renderInfoItem(
                      <MdEmail />,
                      'Billing Email',
                      currentBid.ClientProject?.User?.billingDetails?.billing_email || '--'
                    )}
                    {renderInfoItem(
                      <MdPhone />,
                      'Billing Contact Number',
                      currentBid.ClientProject?.User?.billingDetails?.billing_contact_number || '--'
                    )}
                    {renderInfoItem(
                      <MdLocationOn />,
                      'Billing Address',
                      currentBid.ClientProject?.User?.billingDetails?.billing_address || '--',
                      true
                    )}
                    {renderInfoItem(
                      <MdLocationOn />,
                      'Billing State',
                      currentBid.ClientProject?.User?.billingDetails?.billing_state || '--'
                    )}
                    {renderInfoItem(
                      <MdPublic />,
                      'Billing Country',
                      currentBid.ClientProject?.User?.billingDetails?.billing_country || '--'
                    )}
                    {renderInfoItem(
                      <MdDescription />,
                      'GST Number',
                      currentBid.ClientProject?.User?.billingDetails?.gst_number || '--'
                    )}
                  </SimpleGrid>
                  {currentBid.ClientProject?.User?.billingDetails?.gst_exemted_file && (
                    <Box p={4} bg={tabBg} borderRadius="md" w="full">
                      <VStack align="start" spacing={2}>
                        <HStack spacing={2}>
                          <MdDescription color="var(--chakra-colors-brand-500)" />
                          <Text fontSize="sm" fontWeight="600" color="gray.500">
                            GST Exempted File
                          </Text>
                        </HStack>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="brand"
                          onClick={() => window.open(currentBid.ClientProject?.User?.billingDetails?.gst_exemted_file, '_blank')}
                        >
                          View File
                        </Button>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Freelancer Info Tab */}
              <TabPanel>
                <VStack align="start" spacing={6}>
                  <HStack spacing={3}>
                    <MdPerson size="24px" color="var(--chakra-colors-brand-500)" />
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      Freelancer Information
                    </Text>
                  </HStack>
                  <Divider />
                  
                  {/* Freelancer Profile Header */}
                  <Flex align="center" gap={4} p={4} bg={tabBg} borderRadius="md" w="full">
                    <Avatar
                      size="lg"
                      src={currentBid.freelancer?.profile_image}
                      name={`${currentBid.freelancer?.first_name || ''} ${currentBid.freelancer?.last_name || ''}`}
                    />
                    <VStack align="start" spacing={2}>
                      <Text fontSize="lg" fontWeight="700" color={textColor}>
                        {`${currentBid.freelancer?.first_name || ''} ${currentBid.freelancer?.last_name || ''}`.trim()}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {currentBid.freelancer?.email}
                      </Text>
                      {currentBid.freelancer?.status && (
                        <Badge
                          {...getStatusColors(currentBid.freelancer.status)}
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {currentBid.freelancer.status}
                        </Badge>
                      )}
                    </VStack>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    {renderInfoItem(
                      <MdPhone />,
                      'Mobile',
                      currentBid.freelancer?.mobile
                    )}
                    {renderInfoItem(
                      <MdLocationOn />,
                      'Location',
                      currentBid.freelancer?.city && currentBid.freelancer?.state
                        ? `${currentBid.freelancer.city}, ${currentBid.freelancer.state}, ${currentBid.freelancer.country}`
                        : '--'
                    )}
                    {renderInfoItem(
                      <MdAccountCircle />,
                      'Username',
                      currentBid.freelancer?.pseudoName || currentBid.freelancer?.username || '--'
                    )}
                    {renderInfoItem(
                      <MdBusiness />,
                      'Company',
                      currentBid.freelancer?.company_name || '--'
                    )}
                    {renderInfoItem(
                      <MdPublic />,
                      'Gender',
                      currentBid.freelancer?.gender || '--'
                    )}
                    {renderInfoItem(
                      <MdCalendarToday />,
                      'Joined Date',
                      formatDate(currentBid.freelancer?.createdAt)
                    )}
                    {currentBid.freelancer?.key_skills && renderInfoItem(
                      <MdWork />,
                      'Key Skills',
                      currentBid.freelancer.key_skills,
                      true
                    )}
                    {currentBid.freelancer?.bio && renderInfoItem(
                      <MdDescription />,
                      'Bio',
                      currentBid.freelancer.bio,
                      true
                    )}
                    {currentBid.freelancer?.aboutme && renderInfoItem(
                      <MdDescription />,
                      'About Me',
                      currentBid.freelancer.aboutme,
                      true
                    )}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Project Info Tab */}
              <TabPanel>
                <VStack align="start" spacing={6}>
                  <HStack spacing={3}>
                    <MdWork size="24px" color="var(--chakra-colors-brand-500)" />
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      Project Information
                    </Text>
                  </HStack>
                  <Divider />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    {renderInfoItem(
                      <MdDescription />,
                      'Project Title',
                      currentBid.ClientProject?.project_title,
                      true
                    )}
                    {renderInfoItem(
                      <MdCategory />,
                      'Category',
                      currentBid.ClientProject?.Category?.name
                    )}
                    {renderInfoItem(
                      <MdAttachMoney />,
                      'Budget Range',
                      currentBid.ClientProject?.project_amount_min && currentBid.ClientProject?.project_amount_max
                        ? `${formatCurrency(currentBid.ClientProject.project_amount_min)} - ${formatCurrency(currentBid.ClientProject.project_amount_max)}`
                        : '--'
                    )}
                    {renderInfoItem(
                      <MdSchedule />,
                      'Duration',
                      currentBid.ClientProject?.project_duration_min && currentBid.ClientProject?.project_duration_max
                        ? `${currentBid.ClientProject.project_duration_min} - ${currentBid.ClientProject.project_duration_max} days`
                        : '--'
                    )}
                    {renderInfoItem(
                      <MdWork />,
                      'Engagement Model',
                      currentBid.ClientProject?.model_engagement || '--'
                    )}
                    {renderInfoItem(
                      <MdLanguage />,
                      'Technology Preference',
                      currentBid.ClientProject?.technologty_pre || '--'
                    )}
                    {renderInfoItem(
                      <MdPublic />,
                      'Currency',
                      `${currentBid.ClientProject?.currency_symbol || ''} ${currentBid.ClientProject?.currency_type || ''}`.trim() || '--'
                    )}
                    {renderInfoItem(
                      <MdCalendarToday />,
                      'Posted Date',
                      formatDate(currentBid.ClientProject?.createdAt)
                    )}
                    {renderInfoItem(
                      <MdCalendarToday />,
                      'Last Updated',
                      formatDate(currentBid.ClientProject?.updatedAt)
                    )}
                    {currentBid.ClientProject?.project_summary && renderInfoItem(
                      <MdDescription />,
                      'Project Summary',
                      currentBid.ClientProject.project_summary,
                      true
                    )}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Bid Info Tab */}
              <TabPanel>
                <VStack align="start" spacing={6}>
                  <HStack spacing={3}>
                    <MdInfo size="24px" color="var(--chakra-colors-brand-500)" />
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      Bid Information
                    </Text>
                  </HStack>
                  <Divider />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    {renderInfoItem(
                      <MdAttachMoney />,
                      'Bid Amount',
                      formatCurrency(currentBid.bid_amount)
                    )}
                    {renderInfoItem(
                      <MdSchedule />,
                      'Delivery Timeline',
                      currentBid.delivery_timeline ? `${currentBid.delivery_timeline} days` : '--'
                    )}
                    {renderInfoItem(
                      <MdLanguage />,
                      'Technology Preference',
                      currentBid.technologty_pre || '--'
                    )}
                    {renderInfoItem(
                      <MdCalendarToday />,
                      'Submitted Date',
                      formatDate(currentBid.createdAt)
                    )}
                    {renderInfoItem(
                      <MdCalendarToday />,
                      'Last Updated',
                      formatDate(currentBid.updatedAt)
                    )}
                    {renderInfoItem(
                      <MdTrendingUp />,
                      'Lead Status',
                      currentBid.lead_status === '2' ? 'Active' : 'Inactive'
                    )}
                    {currentBid.message && renderInfoItem(
                      <MdDescription />,
                      'Bid Message',
                      currentBid.message,
                      true
                    )}
                    {currentBid.gst_note && renderInfoItem(
                      <MdDescription />,
                      'GST Note',
                      currentBid.gst_note,
                      true
                    )}
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* SOW Tab */}
              <TabPanel>
                {currentBid.sow ? (
                  <VStack align="start" spacing={6}>
                    <HStack spacing={3}>
                      <MdAssignment size="24px" color="var(--chakra-colors-brand-500)" />
                      <Text fontSize="xl" fontWeight="700" color={textColor}>
                        Statement of Work (SOW)
                      </Text>
                      {currentBid.sow.status && (
                        <Badge
                          {...getStatusColors(currentBid.sow.status)}
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {currentBid.sow.status}
                        </Badge>
                      )}
                    </HStack>
                    <Divider />
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                      {renderInfoItem(
                        <MdPerson />,
                        'User ID',
                        currentBid.sow.user_id
                      )}
                      {renderInfoItem(
                        <MdWork />,
                        'Project ID',
                        currentBid.sow.project_id
                      )}
                      {renderInfoItem(
                        <MdHourglassEmpty />,
                        'Hours Proposed',
                        currentBid.sow.hours_proposed ? `${currentBid.sow.hours_proposed} hours` : '0 hours'
                      )}
                      {renderInfoItem(
                        <MdCalendarToday />,
                        'Created Date',
                        formatDate(currentBid.sow.createdAt)
                      )}
                      {renderInfoItem(
                        <MdCalendarToday />,
                        'Last Updated',
                        formatDate(currentBid.sow.updatedAt)
                      )}
                      {currentBid.sow.scope_of_work && renderInfoItem(
                        <MdDescription />,
                        'Scope of Work',
                        currentBid.sow.scope_of_work,
                        true
                      )}
                      {currentBid.sow.customer_objective && renderInfoItem(
                        <MdFlag />,
                        'Customer Objective',
                        currentBid.sow.customer_objective,
                        true
                      )}
                      {currentBid.sow.remarks && renderInfoItem(
                        <MdDescription />,
                        'Remarks',
                        currentBid.sow.remarks,
                        true
                      )}
                    </SimpleGrid>
                  </VStack>
                ) : (
                  <Box textAlign="center" py="40px">
                    <Text fontSize="lg" color="gray.400">
                      No Statement of Work available
                    </Text>
                  </Box>
                )}
              </TabPanel>

              {/* Milestones Tab */}
              <TabPanel>
                {currentBid.sow?.milestones && currentBid.sow.milestones.length > 0 ? (
                  <VStack align="start" spacing={6}>
                    <HStack spacing={3}>
                      <MdCheckCircle size="24px" color="var(--chakra-colors-brand-500)" />
                      <Text fontSize="xl" fontWeight="700" color={textColor}>
                        Project Milestones ({currentBid.sow.milestones.length})
                      </Text>
                    </HStack>
                    <Divider />

                    {/* Milestones Grid */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="full">
                      {currentBid.milestones?.map((milestone, index) => (
                        <Card key={index} bg={tabBg} borderRadius="md">
                          <Box p={6}>
                            <VStack align="start" spacing={4}>
                              <Flex justify="space-between" align="center" w="full">
                                <Text fontSize="lg" fontWeight="700" color={textColor}>
                                  Milestone {index + 1}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge
                                    colorScheme={milestone.is_paid ? 'green' : 'orange'}
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                  >
                                    {milestone.is_paid ? 'Paid' : 'Unpaid'}
                                  </Badge>
                                  <Badge
                                    colorScheme="brand"
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                  >
                                    {formatCurrency(milestone.amount)}
                                  </Badge>
                                </HStack>
                              </Flex>
                              
                              <Text fontSize="sm" color={textColor}>
                                {milestone.scope}
                              </Text>

                              <HStack spacing={4}>
                                <HStack spacing={1}>
                                  <MdHourglassEmpty color="var(--chakra-colors-gray-500)" />
                                  <Text fontSize="sm" color="gray.500">
                                    {milestone.hours} hours
                                  </Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <MdAttachMoney color="var(--chakra-colors-gray-500)" />
                                  <Text fontSize="sm" color="gray.500">
                                    {formatCurrency(milestone.amount)}
                                  </Text>
                                </HStack>
                              </HStack>

                              {milestone.is_paid && (
                                <VStack spacing={2} w="full">
                                  <Button
                                    size="sm"
                                    colorScheme="brand"
                                    variant="outline"
                                    w="full"
                                    onClick={() => handleViewSalesOrder(index)}
                                  >
                                    View Sales Order
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="brand"
                                    variant="outline"
                                    w="full"
                                    onClick={() => handleGenerateInvoice(index)}
                                  >
                                    View Invoice
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    w="full"
                                    onClick={() => handleOrderApproved(index)}
                                    isDisabled={isApprovingMilestone || milestone.admin_approved_date != null}
                                    isLoading={isApprovingMilestone}
                                    loadingText="Approving..."
                                  >
                                    {milestone.admin_approved_date ? 'Approved' : 'Order Approved'}
                                  </Button>
                                </VStack>
                              )}
                            </VStack>
                          </Box>
                        </Card>
                      ))}
                    </SimpleGrid>

                    {/* Milestones Summary */}
                    <Card bg={tabBg} borderRadius="md" w="full">
                      <Box p={6}>
                        <Text fontSize="lg" fontWeight="700" color={textColor} mb={4}>
                          Milestones Summary
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Total Milestones
                            </Text>
                            <Text fontSize="2xl" fontWeight="700" color={textColor}>
                              {currentBid.sow.milestones.length}
                            </Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Total Hours
                            </Text>
                            <Text fontSize="2xl" fontWeight="700" color={textColor}>
                              {currentBid.sow.milestones.reduce((total, milestone) =>
                                total + parseInt(milestone.hours || 0), 0
                              )} hours
                            </Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Total Amount
                            </Text>
                            <Text fontSize="2xl" fontWeight="700" color="brand.500">
                              {formatCurrency(
                                currentBid.sow.milestones.reduce((total, milestone) =>
                                  total + parseFloat(milestone.amount || 0), 0
                                )
                              )}
                            </Text>
                          </VStack>
                        </SimpleGrid>
                      </Box>
                    </Card>
                  </VStack>
                ) : (
                  <Box textAlign="center" py="40px">
                    <Text fontSize="lg" color="gray.400">
                      No milestones available
                    </Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
}

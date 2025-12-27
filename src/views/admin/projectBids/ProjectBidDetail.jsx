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
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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
  MdEdit,
  MdSave,
  MdCancel,
} from 'react-icons/md';
import {
  getProjectBidDetails,
  clearCurrentBid,
  approveMilestoneByAdmin,
  clearApproveMilestoneState,
  updateProjectBid,
  clearUpdateBidState,
  approveProjectBidByAdmin,
  clearApproveBidState,
  updateMilestoneByAdmin,
  clearUpdateMilestoneState,
} from '../../../features/admin/projectBidsSlice';
import { showSuccess, showError } from '../../../helpers/messageHelper';

export default function ProjectBidDetail({ visibleTabs = null, backRoute = '/admin/project-bids', breadcrumbLabel = 'Project Bids' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // State for editable admin bid fields
  const [isEditingBid, setIsEditingBid] = useState(false);
  const [editedBidData, setEditedBidData] = useState({
    admin_modified_bid_amount: '',
    admin_modified_delivery_timeline: '',
    admin_modified_message: '',
    approved_by_admin: false
  });
  
  // State for editable admin milestone fields
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [editedMilestones, setEditedMilestones] = useState({});
  const [milestoneFieldErrors, setMilestoneFieldErrors] = useState({});
  
  // State for approval confirmation modal
  const { isOpen: isApprovalModalOpen, onOpen: onApprovalModalOpen, onClose: onApprovalModalClose } = useDisclosure();
  
  // Define all available tabs
  const allTabs = ['Client Info', 'Billing Info', 'Freelancer Info', 'Project Info', 'Bid Info', 'SOW', 'Milestones'];
  
  // Determine which tabs to show
  const tabsToShow = visibleTabs || allTabs;
  
  // Map tab names to indices for activeTab
  const tabIndexMap = tabsToShow.reduce((acc, tab, index) => {
    acc[tab] = index;
    return acc;
  }, {});

  // Get data from Redux store
  const { currentBid, isApprovingMilestone, approveMilestoneSuccess, approveMilestoneError, isUpdatingBid, updateBidSuccess, updateBidError, isApprovingBid, approveBidSuccess, approveBidError, isUpdatingMilestone, updateMilestoneSuccess, updateMilestoneError } = 
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

  // Handle success/error states for bid update
  useEffect(() => {
    if (updateBidSuccess) {
      showSuccess('Bid updated successfully!');
      dispatch(clearUpdateBidState());
      fetchBidDetails();
      setIsEditingBid(false);
    }
    if (updateBidError) {
      showError('Failed to update bid');
      dispatch(clearUpdateBidState());
    }
  }, [updateBidSuccess, updateBidError, dispatch]);

  // Handle success/error states for bid approval
  useEffect(() => {
    if (approveBidSuccess) {
      showSuccess('Bid approved successfully!');
      dispatch(clearApproveBidState());
      fetchBidDetails();
      onApprovalModalClose();
    }
    if (approveBidError) {
      showError('Failed to approve bid');
      dispatch(clearApproveBidState());
    }
  }, [approveBidSuccess, approveBidError, dispatch, onApprovalModalClose]);

  // Handle success/error states for milestone update
  useEffect(() => {
    if (updateMilestoneSuccess) {
      showSuccess('Milestones updated successfully!');
      dispatch(clearUpdateMilestoneState());
      fetchBidDetails();
      setIsEditingMilestones(false);
      setEditedMilestones({});
      setMilestoneFieldErrors({});
    }
    if (updateMilestoneError) {
      showError('Failed to update milestones');
      dispatch(clearUpdateMilestoneState());
    }
  }, [updateMilestoneSuccess, updateMilestoneError, dispatch]);

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

  // Handle bid editing functions
  const handleEditBid = () => {
    setEditedBidData({
      admin_modified_bid_amount: currentBid?.admin_modified_bid_amount ? parseFloat(currentBid.admin_modified_bid_amount).toString() : '',
      admin_modified_delivery_timeline: currentBid?.admin_modified_delivery_timeline || '',
      admin_modified_message: currentBid?.admin_modified_message || '',
      approved_by_admin: currentBid?.approved_by_admin || false
    });
    setIsEditingBid(true);
  };

  const handleCancelEdit = () => {
    setIsEditingBid(false);
    setEditedBidData({
      admin_modified_bid_amount: '',
      admin_modified_delivery_timeline: '',
      admin_modified_message: '',
      approved_by_admin: false
    });
  };

  const handleSaveBid = async () => {
    try {
      // Validate minimum character limit for admin message
      if (editedBidData.admin_modified_message && editedBidData.admin_modified_message.length < 100) {
        showError('Bid Message Admin must be at least 100 characters long');
        return;
      }

      // Prepare data for API call
      const apiData = {
        ...editedBidData,
        // Ensure bid amount is sent as string
        admin_modified_bid_amount: editedBidData.admin_modified_bid_amount ? 
          parseFloat(editedBidData.admin_modified_bid_amount).toString() : ''
      };

      // Call API to update bid data
      await dispatch(updateProjectBid({ 
        projectBidId: bidId, 
        bidData: apiData 
      }));
    } catch (error) {
      console.error('Error saving bid data:', error);
    }
  };

  const handleBidDataChange = (field, value) => {
    setEditedBidData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle bid approval
  const handleApproveBid = async () => {
    try {
      await dispatch(approveProjectBidByAdmin(bidId));
    } catch (error) {
      console.error('Error approving bid:', error);
    }
  };

  // Handle milestone editing functions
  const handleEditMilestones = () => {
    const initialMilestones = (currentBid?.milestones || []).reduce((acc, m) => {
      acc[m.id] = {
        admin_hours: m.admin_hours ? String(m.admin_hours) : '',
        admin_scope: m.admin_scope || '',
        admin_amount: m.admin_amount ? parseFloat(m.admin_amount).toString() : '',
      };
      return acc;
    }, {});
    setEditedMilestones(initialMilestones);
    setMilestoneFieldErrors({});
    setIsEditingMilestones(true);
  };

  const handleCancelEditMilestones = () => {
    setIsEditingMilestones(false);
    setEditedMilestones({});
    setMilestoneFieldErrors({});
  };

  const handleMilestoneDataChange = (milestoneId, field, value) => {
    setEditedMilestones(prev => {
      const next = {
        ...prev,
        [milestoneId]: {
          ...(prev[milestoneId] || {}),
          [field]: value,
        },
      };

      // Live validation: totals must match admin_modified_* if provided
      const sumAdminHours = Object.values(next).reduce((t, m) => t + (parseInt(m.admin_hours || 0) || 0), 0);
      const sumAdminAmount = Object.values(next).reduce((t, m) => t + (parseFloat(m.admin_amount || 0) || 0), 0);

      const targetHours = currentBid?.admin_modified_delivery_timeline ? parseInt(currentBid.admin_modified_delivery_timeline) : null;
      const targetAmount = currentBid?.admin_modified_bid_amount ? parseFloat(currentBid.admin_modified_bid_amount) : null;

      // Inline errors: attach to the field being edited
      setMilestoneFieldErrors(prevErrs => {
        const nextErrs = { ...prevErrs };
        const errsForThis = { ...(nextErrs[milestoneId] || {}) };
        if (field === 'admin_hours') {
          if (targetHours !== null && !Number.isNaN(targetHours) && sumAdminHours !== targetHours) {
            errsForThis.admin_hours = `Total hours must equal ${targetHours}`;
          } else {
            errsForThis.admin_hours = '';
          }
        }
        if (field === 'admin_amount') {
          if (targetAmount !== null && !Number.isNaN(targetAmount) && Number(sumAdminAmount.toFixed(2)) !== Number(targetAmount.toFixed(2))) {
            errsForThis.admin_amount = `Total amount must equal ${targetAmount.toFixed(2)}`;
          } else {
            errsForThis.admin_amount = '';
          }
        }
        nextErrs[milestoneId] = errsForThis;
        return nextErrs;
      });

      return next;
    });
  };

  const handleSaveMilestones = async () => {
    try {
      // Prevent save if totals do not match admin_modified_* when present
      const sumAdminHours = Object.values(editedMilestones || {}).reduce((t, m) => t + (parseInt(m.admin_hours || 0) || 0), 0);
      const sumAdminAmount = Object.values(editedMilestones || {}).reduce((t, m) => t + (parseFloat(m.admin_amount || 0) || 0), 0);
      const targetHours = currentBid?.admin_modified_delivery_timeline ? parseInt(currentBid.admin_modified_delivery_timeline) : null;
      const targetAmount = currentBid?.admin_modified_bid_amount ? parseFloat(currentBid.admin_modified_bid_amount) : null;

      // If mismatched, set inline errors under all related fields and block save
      const hoursMismatch = targetHours !== null && !Number.isNaN(targetHours) && sumAdminHours !== targetHours;
      const amountMismatch = targetAmount !== null && !Number.isNaN(targetAmount) && Number(sumAdminAmount.toFixed(2)) !== Number(targetAmount.toFixed(2));

      if (hoursMismatch || amountMismatch) {
        setMilestoneFieldErrors(() => {
          const errs = {};
          Object.keys(editedMilestones || {}).forEach((mid) => {
            errs[mid] = {
              admin_hours: hoursMismatch ? `Total hours must equal ${targetHours}` : '',
              admin_amount: amountMismatch ? `Total amount must equal ${targetAmount?.toFixed(2)}` : '',
            };
          });
          return errs;
        });
        return;
      }

      const updates = Object.entries(editedMilestones || {})
        .map(([milestoneId, values]) => {
          const payload = {
            admin_scope: values.admin_scope ?? '',
            admin_hours: values.admin_hours ?? '',
            admin_amount: values.admin_amount ? parseFloat(values.admin_amount).toString() : '',
          };
          return dispatch(updateMilestoneByAdmin({ milestoneId, data: payload }));
        })
        .filter(Boolean);

      if (updates.length === 0) {
        setIsEditingMilestones(false);
        return;
      }

      await Promise.all(updates);
    } catch (error) {
      console.error('Error saving milestones:', error);
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
                <BreadcrumbLink href={backRoute}>
                  <HStack spacing={1}>
                    <MdAssignment />
                    <Text>{breadcrumbLabel}</Text>
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
              onClick={() => navigate(backRoute)}
            >
              Back to {breadcrumbLabel}
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
                <BreadcrumbLink href={backRoute}>
                  <HStack spacing={1}>
                    <MdAssignment />
                    <Text>{breadcrumbLabel}</Text>
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
              onClick={() => navigate(backRoute)}
            >
              Back to {breadcrumbLabel}
            </Button>
          </Flex>
        </Box>
      </Card>

      {/* Main Content */}
      <Card bg={cardBg}>
        <Box p="24px">
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="brand">
            <TabList>
              {tabsToShow.includes('Client Info') && <Tab>Client Info</Tab>}
              {tabsToShow.includes('Billing Info') && <Tab>Billing Info</Tab>}
              {tabsToShow.includes('Freelancer Info') && <Tab>Freelancer Info</Tab>}
              {tabsToShow.includes('Project Info') && <Tab>Project Info</Tab>}
              {tabsToShow.includes('Bid Info') && <Tab>Bid Info</Tab>}
              {tabsToShow.includes('SOW') && <Tab>SOW</Tab>}
              {tabsToShow.includes('Milestones') && <Tab>Milestones</Tab>}
            </TabList>

            <TabPanels>
              {/* Client Info Tab */}
              {tabsToShow.includes('Client Info') && <TabPanel>
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
              </TabPanel>}

              {/* Billing Info Tab */}
              {tabsToShow.includes('Billing Info') && <TabPanel>
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
              </TabPanel>}

              {/* Freelancer Info Tab */}
              {tabsToShow.includes('Freelancer Info') && <TabPanel>
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
              </TabPanel>}

              {/* Project Info Tab */}
              {tabsToShow.includes('Project Info') && <TabPanel>
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
              </TabPanel>}

              {/* Bid Info Tab */}
              {tabsToShow.includes('Bid Info') && <TabPanel>
                <VStack align="start" spacing={6}>
                  <Flex justify="space-between" align="center" w="full">
                    <HStack spacing={3}>
                      <MdInfo size="24px" color="var(--chakra-colors-brand-500)" />
                      <Text fontSize="xl" fontWeight="700" color={textColor}>
                        Bid Information
                      </Text>
                    </HStack>
                    {currentBid?.ClientProject?.created_by_admin && (
                      <HStack spacing={2}>
                        {!isEditingBid ? (
                          <>
                            <Button
                              leftIcon={<MdCheckCircle />}
                              colorScheme={currentBid?.approved_by_admin === true ? 'gray' : 'green'}
                              size="sm"
                              onClick={onApprovalModalOpen}
                              isDisabled={currentBid?.approved_by_admin === true}
                              title={currentBid?.approved_by_admin === true ? 'Bid already approved' : 'Approve bid'}
                              variant={currentBid?.approved_by_admin === true ? 'solid' : 'solid'}
                            >
                              {currentBid?.approved_by_admin === true ? 'Already Approved' : 'Approved'}
                            </Button>
                            <IconButton
                              aria-label="Edit bid"
                              icon={<MdEdit />}
                              colorScheme="brand"
                              variant="outline"
                              onClick={handleEditBid}
                            />
                          </>
                        ) : (
                          <>
                            <IconButton
                              aria-label="Save bid"
                              icon={<MdSave />}
                              colorScheme="green"
                              onClick={handleSaveBid}
                              isLoading={isUpdatingBid}
                              isDisabled={isUpdatingBid}
                            />
                            <IconButton
                              aria-label="Cancel edit"
                              icon={<MdCancel />}
                              colorScheme="red"
                              variant="outline"
                              onClick={handleCancelEdit}
                              isDisabled={isUpdatingBid}
                            />
                          </>
                        )}
                      </HStack>
                    )}
                  </Flex>
                  <Divider />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    {renderInfoItem(
                      <MdAttachMoney />,
                      'Bid Amount',
                      formatCurrency(currentBid.bid_amount)
                    )}
                    
                    {/* Bid Amount Admin - Only show if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Box gridColumn="span 1">
                        <VStack align="start" spacing={2} p={4} bg={tabBg} borderRadius="md" h="full">
                          <HStack spacing={2}>
                            <Box color="brand.500"><MdAttachMoney /></Box>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Bid Amount Admin
                            </Text>
                          </HStack>
                          {isEditingBid ? (
                            <Input
                              type="number"
                              value={editedBidData.admin_modified_bid_amount}
                              onChange={(e) => handleBidDataChange('admin_modified_bid_amount', e.target.value)}
                              placeholder="Enter admin bid amount"
                              size="sm"
                            />
                          ) : (
                            <Text fontSize="sm" fontWeight="500" color={textColor}>
                              {currentBid.admin_modified_bid_amount ? formatCurrency(parseFloat(currentBid.admin_modified_bid_amount)) : '--'}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {renderInfoItem(
                      <MdSchedule />,
                      'Delivery Timeline',
                      currentBid.delivery_timeline ? `${currentBid.delivery_timeline} days` : '--'
                    )}

                    {/* Delivery Timeline Admin - Only show if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Box gridColumn="span 1">
                        <VStack align="start" spacing={2} p={4} bg={tabBg} borderRadius="md" h="full">
                          <HStack spacing={2}>
                            <Box color="brand.500"><MdSchedule /></Box>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Delivery Timeline Admin
                            </Text>
                          </HStack>
                          {isEditingBid ? (
                            <Input
                              type="number"
                              value={editedBidData.admin_modified_delivery_timeline}
                              onChange={(e) => handleBidDataChange('admin_modified_delivery_timeline', e.target.value)}
                              placeholder="Enter admin delivery days"
                              size="sm"
                            />
                          ) : (
                            <Text fontSize="sm" fontWeight="500" color={textColor}>
                              {currentBid.admin_modified_delivery_timeline ? `${currentBid.admin_modified_delivery_timeline} days` : '--'}
                            </Text>
                          )}
                        </VStack>
                      </Box>
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

                    {/* Status - Editable if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Box gridColumn="span 1">
                        <VStack align="start" spacing={2} p={4} bg={tabBg} borderRadius="md" h="full">
                          <HStack spacing={2}>
                            <Box color="brand.500"><MdCheckCircle /></Box>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Status
                            </Text>
                          </HStack>
                          {isEditingBid ? (
                            <Select
                              value={editedBidData.approved_by_admin ? 'true' : 'false'}
                              onChange={(e) => handleBidDataChange('approved_by_admin', e.target.value === 'true')}
                              size="sm"
                            >
                              <option value="false">Pending</option>
                              <option value="true">Approved</option>
                            </Select>
                          ) : (
                            <Text fontSize="sm" fontWeight="500" color={textColor}>
                              {currentBid.approved_by_admin ? 'Approved' : 'Pending'}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {currentBid.message && renderInfoItem(
                      <MdDescription />,
                      'Bid Message',
                      currentBid.message,
                      true
                    )}

                    {/* Bid Message Admin - Editable if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Box gridColumn="span 2">
                        <VStack align="start" spacing={2} p={4} bg={tabBg} borderRadius="md">
                          <HStack spacing={2}>
                            <Box color="brand.500"><MdDescription /></Box>
                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                              Bid Message Admin
                            </Text>
                          </HStack>
                          {isEditingBid ? (
                            <FormControl w="full" isInvalid={editedBidData.admin_modified_message && editedBidData.admin_modified_message.length < 100}>
                              <Textarea
                                value={editedBidData.admin_modified_message}
                                onChange={(e) => handleBidDataChange('admin_modified_message', e.target.value)}
                                placeholder="Enter admin bid message (minimum 100 characters)"
                                size="sm"
                                rows={4}
                              />
                              {editedBidData.admin_modified_message && editedBidData.admin_modified_message.length < 100 && (
                                <FormHelperText color="red.500" fontSize="xs" mt={1}>
                                  Minimum 100 characters required. Current: {editedBidData.admin_modified_message.length}
                                </FormHelperText>
                              )}
                              {editedBidData.admin_modified_message && editedBidData.admin_modified_message.length >= 100 && (
                                <FormHelperText color="gray.500" fontSize="xs" mt={1}>
                                  {editedBidData.admin_modified_message.length} characters
                                </FormHelperText>
                              )}
                            </FormControl>
                          ) : (
                            <Text fontSize="sm" fontWeight="500" color={textColor} wordBreak="break-word">
                              {currentBid.admin_modified_message || '--'}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {currentBid.gst_note && renderInfoItem(
                      <MdDescription />,
                      'GST Note',
                      currentBid.gst_note,
                      true
                    )}
                  </SimpleGrid>
                </VStack>
              </TabPanel>}

              {/* SOW Tab */}
              {tabsToShow.includes('SOW') && <TabPanel>
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
              </TabPanel>}

              {/* Milestones Tab */}
              {tabsToShow.includes('Milestones') && <TabPanel>
                {currentBid.sow?.milestones && currentBid.sow.milestones.length > 0 ? (
                  <VStack align="start" spacing={6}>
                    <Flex justify="space-between" align="center" w="full">
                      <HStack spacing={3}>
                        <MdCheckCircle size="24px" color="var(--chakra-colors-brand-500)" />
                        <Text fontSize="xl" fontWeight="700" color={textColor}>
                          Project Milestones ({currentBid.sow.milestones.length})
                        </Text>
                      </HStack>
                      {currentBid?.ClientProject?.created_by_admin && currentBid.milestones && currentBid.milestones.length > 0 && (
                        <HStack spacing={2}>
                          {!isEditingMilestones ? (
                            <IconButton
                              aria-label="Edit milestones"
                              icon={<MdEdit />}
                              colorScheme="brand"
                              variant="outline"
                              onClick={handleEditMilestones}
                            />
                          ) : (
                            <>
                              <IconButton
                                aria-label="Save milestones"
                                icon={<MdSave />}
                                colorScheme="green"
                                onClick={handleSaveMilestones}
                                isLoading={isUpdatingMilestone}
                                isDisabled={isUpdatingMilestone}
                              />
                              <IconButton
                                aria-label="Cancel edit milestones"
                                icon={<MdCancel />}
                                colorScheme="red"
                                variant="outline"
                                onClick={handleCancelEditMilestones}
                                isDisabled={isUpdatingMilestone}
                              />
                            </>
                          )}
                        </HStack>
                      )}
                    </Flex>
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

                    {/* Admin Project Milestones - Only show if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && currentBid.milestones && currentBid.milestones.length > 0 && (
                      <VStack align="start" spacing={6} w="full" mt={8}>
                        <HStack spacing={3}>
                          <MdCheckCircle size="24px" color="var(--chakra-colors-brand-500)" />
                          <Text fontSize="xl" fontWeight="700" color={textColor}>
                            Admin Project Milestones ({currentBid.milestones.length})
                          </Text>
                        </HStack>
                        <Divider />

                        {/* Admin Milestones Grid */}
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="full">
                          {currentBid.milestones.map((milestone, index) => (
                            <Card key={`admin-${index}`} bg={tabBg} borderRadius="md">
                              <Box p={6}>
                                <VStack align="start" spacing={4}>
                                  <Flex justify="space-between" align="center" w="full">
                                    <Text fontSize="lg" fontWeight="700" color={textColor}>
                                      Admin Milestone {index + 1}
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
                                        {formatCurrency(
                                          isEditingMilestones 
                                            ? parseFloat(editedMilestones[milestone.id]?.admin_amount || 0) 
                                            : parseFloat(milestone.admin_amount || 0)
                                        )}
                                      </Badge>
                                    </HStack>
                                  </Flex>

                                  {/* Scope - Editable */}
                                  {isEditingMilestones ? (
                                    <FormControl w="full">
                                      <Textarea
                                        value={editedMilestones[milestone.id]?.admin_scope || ''}
                                        onChange={(e) => handleMilestoneDataChange(milestone.id, 'admin_scope', e.target.value)}
                                        placeholder="Enter admin scope"
                                        size="sm"
                                        rows={3}
                                      />
                                    </FormControl>
                                  ) : (
                                    <Text fontSize="sm" color={textColor}>
                                      {milestone.admin_scope || '--'}
                                    </Text>
                                  )}

                                  <HStack spacing={4} w="full">
                                    <HStack spacing={1} flex={1}>
                                      <MdHourglassEmpty color="var(--chakra-colors-gray-500)" />
                                      {isEditingMilestones ? (
                                        <FormControl isInvalid={Boolean(milestoneFieldErrors[milestone.id]?.admin_hours)} flex={1}>
                                          <Input
                                            type="number"
                                            value={editedMilestones[milestone.id]?.admin_hours || ''}
                                            onChange={(e) => handleMilestoneDataChange(milestone.id, 'admin_hours', e.target.value)}
                                            placeholder="Hours"
                                            size="sm"
                                          />
                                          {milestoneFieldErrors[milestone.id]?.admin_hours && (
                                            <FormHelperText color="red.500" fontSize="xs" mt={1}>
                                              {milestoneFieldErrors[milestone.id].admin_hours}
                                            </FormHelperText>
                                          )}
                                        </FormControl>
                                      ) : (
                                        <Text fontSize="sm" color="gray.500">
                                          {(milestone.admin_hours ?? '') !== '' ? `${milestone.admin_hours} hours` : '--'}
                                        </Text>
                                      )}
                                    </HStack>
                                    <HStack spacing={1} flex={1}>
                                      <MdAttachMoney color="var(--chakra-colors-gray-500)" />
                                      {isEditingMilestones ? (
                                        <FormControl isInvalid={Boolean(milestoneFieldErrors[milestone.id]?.admin_amount)} flex={1}>
                                          <Input
                                            type="number"
                                            value={editedMilestones[milestone.id]?.admin_amount || ''}
                                            onChange={(e) => handleMilestoneDataChange(milestone.id, 'admin_amount', e.target.value)}
                                            placeholder="Amount"
                                            size="sm"
                                          />
                                          {milestoneFieldErrors[milestone.id]?.admin_amount && (
                                            <FormHelperText color="red.500" fontSize="xs" mt={1}>
                                              {milestoneFieldErrors[milestone.id].admin_amount}
                                            </FormHelperText>
                                          )}
                                        </FormControl>
                                      ) : (
                                        <Text fontSize="sm" color="gray.500">
                                          {formatCurrency(parseFloat(milestone.admin_amount || 0))}
                                        </Text>
                                      )}
                                    </HStack>
                                  </HStack>

                                  {/* Admin actions */}
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

                        {/* Admin Milestones Summary */}
                        <Card bg={tabBg} borderRadius="md" w="full">
                          <Box p={6}>
                            <Text fontSize="lg" fontWeight="700" color={textColor} mb={4}>
                              Admin Milestones Summary
                            </Text>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                              <VStack align="start" spacing={2}>
                                <Text fontSize="sm" fontWeight="600" color="gray.500">
                                  Total Admin Milestones
                                </Text>
                                <Text fontSize="2xl" fontWeight="700" color={textColor}>
                                  {currentBid.milestones.length}
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={2}>
                                <Text fontSize="sm" fontWeight="600" color="gray.500">
                                  Total Admin Hours
                                </Text>
                                <Text fontSize="2xl" fontWeight="700" color={textColor}>
                                  {isEditingMilestones
                                    ? Object.values(editedMilestones).reduce((t, m) => t + (parseInt(m.admin_hours || 0) || 0), 0)
                                    : (currentBid.milestones || []).reduce((total, milestone) =>
                                        total + (parseInt(milestone.admin_hours || 0) || 0), 0
                                      )} hours
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={2}>
                                <Text fontSize="sm" fontWeight="600" color="gray.500">
                                  Total Admin Amount
                                </Text>
                                <Text fontSize="2xl" fontWeight="700" color="brand.500">
                                  {formatCurrency(
                                    isEditingMilestones
                                      ? Object.values(editedMilestones).reduce((t, m) => t + (parseFloat(m.admin_amount || 0) || 0), 0)
                                      : (currentBid.milestones || []).reduce((total, milestone) =>
                                          total + (parseFloat(milestone.admin_amount || 0) || 0), 0
                                        )
                                  )}
                                </Text>
                              </VStack>
                            </SimpleGrid>
                          </Box>
                        </Card>
                      </VStack>
                    )}
                  </VStack>
                ) : (
                  <Box textAlign="center" py="40px">
                    <Text fontSize="lg" color="gray.400">
                      No milestones available
                    </Text>
                  </Box>
                )}
              </TabPanel>}
            </TabPanels>
          </Tabs>
        </Box>
      </Card>

      {/* Approval Confirmation Modal */}
      <Modal isOpen={isApprovalModalOpen} onClose={onApprovalModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Approval</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to approve this project bid? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onApprovalModalClose}
              isDisabled={isApprovingBid}
            >
              No
            </Button>
            <Button
              colorScheme="green"
              onClick={handleApproveBid}
              isLoading={isApprovingBid}
              loadingText="Approving..."
              isDisabled={isApprovingBid}
            >
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

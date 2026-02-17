import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Badge,
  useColorModeValue,
  Tooltip,
  HStack,
  Card,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Avatar,
  Grid,
  GridItem,
  Divider,
  Link,
  Tag,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
} from '@chakra-ui/react';
import { 
  MdVisibility, 
  MdChevronLeft, 
  MdChevronRight,
  MdPerson,
  MdWork,
  MdFolder,
  MdSchool,
  MdCardMembership,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdLanguage,
  MdAttachMoney,
  MdCalendarToday,
  MdLink,
  MdGetApp,
  MdPublic,
  MdDescription,
  MdNotifications,
  MdSchedule,
  MdInfo,
  MdEdit,
  MdAdd,
  MdDelete,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { MdRefresh } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { statusChange } from '../../../features/admin/clientManagementSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import {
  freelancerData,
  freelancerCompleteData,
} from '../../../features/admin/freelancerManagementSlice';
import { postApi, getApi, putApi } from '../../../services/api';
import { config } from '../../../config/config';
import { Country, State, City } from 'country-state-city';
import { apiEndPoints } from '../../../config/path';

function FreelancerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [detailTabIndex, setDetailTabIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const detailsModal = useDisclosure();
  const statusModal = useDisclosure();
  const reminderModal = useDisclosure();
  const reminderViewModal = useDisclosure();
  const emailModal = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reminderData, setReminderData] = useState({
    first_reminder_in_days: '',
    second_reminder_in_days: '',
    third_reminder_in_days: '',
  });
  const [isReminderLoading, setIsReminderLoading] = useState(false);
  const [selectedReminderData, setSelectedReminderData] = useState(null);
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review', 'Suspended'];

  // Determine if this is the Management -> Freelancers page (approved only)
  // Registration -> Freelancers is at /freelancers, Management -> Freelancers is at /freelancers-management
  const isManagementPage = location.pathname === '/admin/freelancers-management';

  // Set filters: Management page shows only approved, Registration shows all others (exclude approved)
  const statusFilter = isManagementPage ? 'approved' : null;
  const excludeStatusFilter = !isManagementPage ? 'approved' : null;

  const {
    isLoading,
    responseData,
    completeData,
    completeDataLoading,
    completeDataError,
  } = useSelector((s) => s.freelancerDataReducer || {});

  const rows = useMemo(() => {
    const list = responseData?.freelancers;
    const arr = Array.isArray(list) ? list : [];
    const total = typeof responseData?.total_count === 'number' ? responseData.total_count : arr.length;
    setTotalCount(total);
    return arr;
  }, [responseData]);

  useEffect(() => {
    dispatch(freelancerData({ page, pageLimit, status: statusFilter, excludeStatus: excludeStatusFilter }));
  }, [dispatch, page, pageLimit, statusFilter, excludeStatusFilter]);

  const openDetails = (userId) => {
    setSelectedFreelancer(userId);
    setDetailTabIndex(0);
    setIsEditMode(false);
    detailsModal.onOpen();
    dispatch(freelancerCompleteData({ userId }));
  };

  const openEditDetails = (userId) => {
    setSelectedFreelancer(userId);
    setDetailTabIndex(0);
    setIsEditMode(true);
    detailsModal.onOpen();
    dispatch(freelancerCompleteData({ userId }));
  };

  const closeDetails = () => {
    detailsModal.onClose();
    setSelectedFreelancer(null);
    setDetailTabIndex(0);
    setIsEditMode(false);
  };

  const openStatus = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setSelectedStatus(freelancer?.status || 'Pending');
    statusModal.onOpen();
  };

  const closeStatus = () => {
    statusModal.onClose();
    setSelectedFreelancer(null);
    setSelectedStatus('');
  };

  const applyStatusChange = async () => {
    if (!selectedFreelancer) return;
    try {
      await dispatch(statusChange({ id: selectedFreelancer.id, apiData: { status: selectedStatus } }));
      showSuccess('Status updated successfully');
      // refetch with current filters
      dispatch(freelancerData({ page, pageLimit, status: statusFilter, excludeStatus: excludeStatusFilter }));
    } catch (e) {
      showError('Failed to update status');
    } finally {
      closeStatus();
    }
  };

  const openReminder = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setReminderData({
      first_reminder_in_days: '',
      second_reminder_in_days: '',
      third_reminder_in_days: '',
    });
    reminderModal.onOpen();
  };

  const closeReminder = () => {
    reminderModal.onClose();
    setSelectedFreelancer(null);
    setReminderData({
      first_reminder_in_days: '',
      second_reminder_in_days: '',
      third_reminder_in_days: '',
    });
  };

  const handleReminderSubmit = async () => {
    if (!selectedFreelancer) return;

    // Validate that at least one reminder day is provided
    if (!reminderData.first_reminder_in_days && !reminderData.second_reminder_in_days && !reminderData.third_reminder_in_days) {
      showError('Please provide at least one reminder day');
      return;
    }

    setIsReminderLoading(true);
    try {
      const apiData = {
        userId: selectedFreelancer.id,
        first_reminder_in_days: reminderData.first_reminder_in_days || null,
        second_reminder_in_days: reminderData.second_reminder_in_days || null,
        third_reminder_in_days: reminderData.third_reminder_in_days || null,
      };

      await postApi(`${config.apiBaseUrl}/admin/profile-complete-reminder`, apiData);
      showSuccess('Profile complete reminder set successfully');
      closeReminder();
      // Refetch freelancer data to update the list
      dispatch(freelancerData({ page, pageLimit, status: statusFilter, excludeStatus: excludeStatusFilter }));
    } catch (error) {
      console.error('Error setting reminder:', error);
      showError(error?.response?.data?.message || 'Failed to set reminder');
    } finally {
      setIsReminderLoading(false);
    }
  };

  const openReminderView = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setSelectedReminderData(freelancer.profile_complete_reminder || null);
    reminderViewModal.onOpen();
  };

  const openEmailModal = (freelancer) => {
    setSelectedFreelancer(freelancer);
    emailModal.onOpen();
  };

  const closeReminderView = () => {
    reminderViewModal.onClose();
    setSelectedFreelancer(null);
    setSelectedReminderData(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return '--';
    }
  };

  // Chakra color mode values (match ClientList look)
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const getStatusColorScheme = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'approved':
      case 'otpverified':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'rejected':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'under review':
      case 'incomplete':
      case 'approval':
      case 'completed':
      case 'complete':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text color={textColor} fontSize="l" fontWeight="700" mb="10px">
            Freelancers
          </Text>

          {isLoading && rows.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                h={{ base: 'calc(100vh - 160px)', md: 'calc(100vh - 130px)', xl: 'calc(100vh - 130px)' }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="1000px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        First Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Last Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Sub Categories
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Location
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Last Login
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        Status
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        View
                      </Th>
                      {!isManagementPage && (
                        <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                          Reminder
                        </Th>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={isManagementPage ? 7 : 8} textAlign="center" py="40px">
                          <Text color="black">No freelancers found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((fr, index) => {
                        // Format sub categories
                        const subCategories = Array.isArray(fr.sub_category_names) && fr.sub_category_names.length > 0
                          ? fr.sub_category_names.join(', ')
                          : '--';

                        // Format location
                        const location = [fr.city, fr.country].filter(Boolean).join(' - ') || '--';

                        // Format last login
                        const lastLoginDate = fr.freelancer_last_login || fr.last_login;
                        let lastLogin = '--';
                        if (lastLoginDate) {
                          try {
                            const date = new Date(lastLoginDate);
                            lastLogin = date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          } catch (e) {
                            lastLogin = '--';
                          }
                        }

                        const statusColors = getStatusColorScheme(fr.status);
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;

                        return (
                          <Tr key={fr.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.first_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.last_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{subCategories}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{location}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{lastLogin}</Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Button
                                size="sm"
                                bg={statusColors.bg}
                                color={statusColors.color}
                                borderColor={statusColors.border}
                                borderWidth="2px"
                                borderRadius="full"
                                fontWeight="normal"
                                fontSize="xs"
                                textTransform="capitalize"
                                _hover={{ opacity: 0.8, transform: 'translateY(-2px)' }}
                                onClick={() => openStatus(fr)}
                              >
                                {fr.status || 'Pending'}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <HStack spacing={2} justify="center">
                                <Tooltip label="View Freelancer Details">
                                  <IconButton
                                    aria-label="View freelancer"
                                    icon={<MdVisibility />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openDetails(fr.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Edit Freelancer Details">
                                  <IconButton
                                    aria-label="Edit freelancer"
                                    icon={<MdEdit />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openEditDetails(fr.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Send Email to Freelancer">
                                  <IconButton
                                    aria-label="Send email"
                                    icon={<MdEmail />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openEmailModal(fr)}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                            {!isManagementPage && (
                              <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                                  <HStack spacing={2} justify="center">
                                    <Tooltip label="Set Profile Complete Reminder">
                                      <IconButton
                                        aria-label="Set reminder"
                                        icon={<MdNotifications />}
                                        size="sm"
                                        variant="ghost"
                                        style={{ color: 'rgb(32, 33, 36)' }}
                                        onClick={() => openReminder(fr)}
                                      />
                                    </Tooltip>
                                    {fr.profile_complete_reminder && (
                                      <Tooltip label="View Reminder Details">
                                        <IconButton
                                          aria-label="View reminder"
                                          icon={<MdInfo />}
                                          size="sm"
                                          variant="ghost"
                                          style={{ color: 'rgb(32, 33, 36)' }}
                                          onClick={() => openReminderView(fr)}
                                        />
                                      </Tooltip>
                                    )}
                                  </HStack>
                                </Td>
                            )}
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
                  </Text>
                  <HStack spacing="8px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                    <Select
                      size="sm"
                      w="80px"
                      value={pageLimit}
                      onChange={(e) => {
                        setPageLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'brand.500' }}
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                    </Select>
                  </HStack>
                </HStack>

                <HStack spacing="8px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1} variant="outline" />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((p) => (
                      <Button key={p} size="sm" variant={page === p ? 'solid' : 'outline'} colorScheme={page === p ? 'brand' : 'gray'} onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    ))}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={page === totalPages} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Card>

      {/* Status Change Modal */}
      <Modal isOpen={statusModal.isOpen} onClose={closeStatus} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {statusOptions.map((status) => (
              <Box key={status} mb="12px">
                <HStack>
                  <input
                    type="checkbox"
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text fontSize="sm" fontWeight="500">{status}</Text>
                </HStack>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeStatus}>Cancel</Button>
            <Button colorScheme="brand" onClick={applyStatusChange}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reminder View Modal */}
      <Modal isOpen={reminderViewModal.isOpen} onClose={closeReminderView} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile Complete Reminder Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReminderData ? (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="600" mb={2} color="gray.600">
                    First Reminder Date
                  </Text>
                  <Text fontSize="md" color={textColor}>
                    {formatDate(selectedReminderData.first_reminder_date) || 'Not set'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" mb={2} color="gray.600">
                    Second Reminder Date
                  </Text>
                  <Text fontSize="md" color={textColor}>
                    {formatDate(selectedReminderData.second_reminder_date) || 'Not set'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" mb={2} color="gray.600">
                    Third Reminder Date
                  </Text>
                  <Text fontSize="md" color={textColor}>
                    {formatDate(selectedReminderData.third_reminder_date) || 'Not set'}
                  </Text>
                </Box>
              </VStack>
            ) : (
              <Text color="gray.500">No reminder data available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeReminderView}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reminder Modal */}
      <Modal isOpen={reminderModal.isOpen} onClose={closeReminder} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Profile Complete Reminder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  First Reminder (Days)
                </FormLabel>
                <NumberInput
                  value={reminderData.first_reminder_in_days || ''}
                  onChange={(valueString, valueNumber) =>
                    setReminderData({
                      ...reminderData,
                      first_reminder_in_days: isNaN(valueNumber) ? '' : valueNumber,
                    })
                  }
                  min={0}
                >
                  <NumberInputField placeholder="Enter days" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Second Reminder (Days)
                </FormLabel>
                <NumberInput
                  value={reminderData.second_reminder_in_days || ''}
                  onChange={(valueString, valueNumber) =>
                    setReminderData({
                      ...reminderData,
                      second_reminder_in_days: isNaN(valueNumber) ? '' : valueNumber,
                    })
                  }
                  min={0}
                >
                  <NumberInputField placeholder="Enter days" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Third Reminder (Days)
                </FormLabel>
                <NumberInput
                  value={reminderData.third_reminder_in_days || ''}
                  onChange={(valueString, valueNumber) =>
                    setReminderData({
                      ...reminderData,
                      third_reminder_in_days: isNaN(valueNumber) ? '' : valueNumber,
                    })
                  }
                  min={0}
                >
                  <NumberInputField placeholder="Enter days" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeReminder} isDisabled={isReminderLoading}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleReminderSubmit}
              isLoading={isReminderLoading}
              loadingText="Saving..."
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Freelancer Detail Modal */}
      <Modal 
        isOpen={detailsModal.isOpen} 
        onClose={closeDetails} 
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <Text fontSize="xl" fontWeight="bold">
              {isEditMode ? 'Edit Freelancer Details' : 'Freelancer Details'}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {completeDataLoading ? (
              <Flex py={10} align="center" justify="center" gap={3}>
                <Spinner size="xl" color="brand.500" />
                <Text>Loading details...</Text>
              </Flex>
            ) : completeDataError ? (
              <Flex py={10} align="center" justify="center" direction="column" gap={3}>
                <Text color="red.500" fontWeight="bold">Failed to load freelancer details</Text>
                <Text color="gray.500">Please try again later</Text>
              </Flex>
            ) : !completeData || Object.keys(completeData).length === 0 ? (
              <Flex py={10} align="center" justify="center">
                <Text color="gray.500">No details available</Text>
              </Flex>
            ) : (
              <FreelancerDetailContent 
                completeData={completeData}
                tabIndex={detailTabIndex}
                onTabChange={setDetailTabIndex}
                isEditMode={isEditMode}
                userId={selectedFreelancer}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <SendFreelancerEmailModal
        isOpen={emailModal.isOpen}
        onClose={() => {
          emailModal.onClose();
          setSelectedFreelancer(null);
        }}
        freelancer={selectedFreelancer}
      />
    </Box>
  );
}

// Modal component to send email to freelancer
const SendFreelancerEmailModal = ({ isOpen, onClose, freelancer }) => {
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
  });
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Reset form when opened or freelancer changes
  useEffect(() => {
    if (isOpen) {
      setEmailForm({
        subject: '',
        message: '',
      });
      setIsEmailSending(false);
    }
  }, [isOpen, freelancer?.id]);

  const handleSendEmail = async () => {
    if (!freelancer) return;

    const trimmedSubject = (emailForm.subject || '').trim();
    const trimmedMessage = (emailForm.message || '').trim();

    if (!trimmedSubject) {
      showError('Please enter email subject');
      return;
    }

    if (!trimmedMessage) {
      showError('Please enter email message');
      return;
    }

    setIsEmailSending(true);
    try {
      const payload = {
        subject: trimmedSubject,
        message: trimmedMessage,
      };

      const response = await postApi(
        `${apiEndPoints.SEND_EMAIL_TO_FREELANCER}/${freelancer.id}/send-email`,
        payload,
      );

      if (response?.data?.success) {
        showSuccess('Email sent successfully');
        onClose();
      } else {
        showError(response?.data?.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email to freelancer:', error);
      showError(error?.response?.data?.message || 'Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send Email to Freelancer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="500">
                Subject
              </FormLabel>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))}
                placeholder="Enter email subject"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="500">
                Message
              </FormLabel>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))}
                placeholder="Enter email message"
                rows={6}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isEmailSending}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSendEmail}
            isLoading={isEmailSending}
            loadingText="Sending..."
          >
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Freelancer Detail Content Component
const FreelancerDetailContent = ({ completeData, tabIndex, onTabChange, isEditMode = false, userId }) => {
  const dispatch = useDispatch();
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  
  // State for editable fields
  const [formData, setFormData] = useState({
    primaryIntroduction: {},
    professionalExperience: {},
    projects: [],
    certifications: [],
    education: [],
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Category and Subcategory states
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showTechnicalExpertise, setShowTechnicalExpertise] = useState(false);
  
  // Technologies states
  const [technologies, setTechnologies] = useState([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(false);
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState('');
  const [technologySearchTerm, setTechnologySearchTerm] = useState('');
  
  // Languages states
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Portuguese', label: 'Portuguese' }
  ];
  
  // Projects states
  const [projectTechnologies, setProjectTechnologies] = useState([]);
  const [projectIndustries, setProjectIndustries] = useState([]);
  const [projectCountryOptions, setProjectCountryOptions] = useState([]);
  const [hideApplicationTypeForProjects, setHideApplicationTypeForProjects] = useState(false);
  
  // Education states
  const [graduationList, setGraduationList] = useState([]);
  const [postGraduationList, setPostGraduationList] = useState([]);
  const [educationValidated, setEducationValidated] = useState(false);
  
  // Year generation functions
  const generateYearOptions = (startYear = 1960, endYear = new Date().getFullYear()) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };
  
  const getTillYearOptions = (fromYear) => {
    if (!fromYear) return generateYearOptions();
    const currentYear = new Date().getFullYear();
    return generateYearOptions(parseInt(fromYear), currentYear);
  };
  
  // Get Post Graduate From year options (should start after Graduation Till year)
  const getPostGraduationFromYearOptions = () => {
    // Find the latest graduation till year
    let latestGraduationYear = 0;
    graduationList.forEach(graduation => {
      if (graduation.year && graduation.year !== '0' && parseInt(graduation.year) > latestGraduationYear) {
        latestGraduationYear = parseInt(graduation.year);
      }
    });
    
    const currentYear = new Date().getFullYear();
    const startYear = latestGraduationYear > 0 ? latestGraduationYear + 1 : 1960;
    return generateYearOptions(startYear, currentYear);
  };
  
  // Degree options
  const graduationDegreeOptions = [
    { value: '1', label: 'Any Engineering' },
    { value: '3', label: 'Any Management' },
    { value: '4', label: 'Any Computers(Degree/Diploma)' },
    { value: '6', label: 'Any Diploma Holders' },
    { value: '8', label: 'Bachelor of Arts' },
    { value: '10', label: 'Bachelor of Business Administration' },
    { value: '11', label: 'Bachelor of Commerce' },
    { value: '14', label: 'Bachelor of Science' },
    { value: '16', label: 'B.Tech/B.E.' },
    { value: '17', label: 'Bachelor of Computer Applications' },
    { value: '22', label: 'Fashion/Designing' },
    { value: '23', label: 'Journalism/Mass Communication' },
  ];
  
  const postGraduationDegreeOptions = [
    { value: '32', label: 'Any Engineering' },
    { value: '34', label: 'Any Management' },
    { value: '40', label: 'Journalism/Mass Comunication' },
    { value: '42', label: 'Master of Arts' },
    { value: '44', label: 'Master of Commerce' },
    { value: '47', label: 'MS/M.Sc' },
    { value: '48', label: 'Master of Technology' },
    { value: '50', label: 'MBA/PGDM' },
    { value: '52', label: 'Master of Computer Applications (M.C.A.)' },
    { value: '56', label: 'PG Diploma' },
    { value: '57', label: 'PR/Advertising' },
  ];
  
  const educationTypeOptions = [
    { value: '2', label: 'Full Time' },
    { value: '3', label: 'Part Time' },
    { value: '4', label: 'Correspondence' },
  ];
  
  // Validation functions
  const isGraduationValid = (graduation) => {
    return (
      graduation.degree &&
      graduation.university_name &&
      graduation.month &&
      graduation.year &&
      graduation.education_type
    );
  };
  
  const isPostGraduationValid = (postGraduation) => {
    return (
      postGraduation.degree &&
      postGraduation.university_name &&
      postGraduation.month &&
      postGraduation.year &&
      postGraduation.education_type
    );
  };
  
  const hasAnyPostGraduationData = () => {
    return postGraduationList.some(postGrad =>
      (postGrad.degree && postGrad.degree !== '') ||
      (postGrad.university_name && postGrad.university_name.trim() !== '') ||
      (postGrad.month && postGrad.month !== '') ||
      (postGrad.year && postGrad.year !== '') ||
      (postGrad.education_type && postGrad.education_type !== '')
    );
  };
  
  // Education handlers
  const handleAddGraduation = () => {
    setGraduationList([
      ...graduationList,
      {
        id: null,
        delete_id: '0',
        education_type: '',
        graduation_type: '3',
        university_name: '',
        month: '',
        year: '',
        degree: '',
      },
    ]);
  };
  
  const handleRemoveGraduation = (index, id) => {
    const list = [...graduationList];
    list.splice(index, 1);
    setGraduationList(list);
    
    // Update formData
    const allEducation = [...list, ...postGraduationList];
    setFormData(prev => ({
      ...prev,
      education: allEducation
    }));
  };
  
  const handleAddPostGraduation = () => {
    setPostGraduationList([
      ...postGraduationList,
      {
        id: null,
        delete_id: '0',
        education_type: '',
        graduation_type: '4',
        university_name: '',
        month: '',
        year: '',
        degree: '',
      },
    ]);
  };
  
  const handleRemovePostGraduation = (index, id) => {
    const list = [...postGraduationList];
    list.splice(index, 1);
    setPostGraduationList(list);
    
    // Update formData
    const allEducation = [...graduationList, ...list];
    setFormData(prev => ({
      ...prev,
      education: allEducation
    }));
  };
  
  const handleGraduationChange = (index, field, value) => {
    const list = [...graduationList];
    list[index][field] = value;
    
    // Reset year when month changes
    if (field === 'month') {
      list[index].year = '';
    }
    
    setGraduationList(list);
    
    // Update formData
    const allEducation = [...list, ...postGraduationList];
    setFormData(prev => ({
      ...prev,
      education: allEducation
    }));
  };
  
  const handlePostGraduationChange = (index, field, value) => {
    const list = [...postGraduationList];
    list[index][field] = value;
    
    // Reset year when month changes
    if (field === 'month') {
      list[index].year = '';
    }
    
    setPostGraduationList(list);
    
    // Update formData
    const allEducation = [...graduationList, ...list];
    setFormData(prev => ({
      ...prev,
      education: allEducation
    }));
  };
  
  // Project type options
  const projectTypeOptions = [
    { value: '1', label: 'Support' },
    { value: '2', label: 'New Development' },
    { value: '3', label: 'New Development Cum Support' },
  ];
  
  // Categories that should hide Application Type field
  const categoriesToHideApplicationType = [
    'UI & Design',
    'Marketing',
    'Content',
    'Infrastructure & Security',
    'Video & Animation'
  ];
  
  // Country, State, City dropdown states
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map(country => ({
      label: country.name,
      value: country.isoCode,
      phoneCode: country.phonecode
    }));
  }, []);
  
  const [countryValue, setCountryValue] = useState(null);
  const [stateValue, setStateValue] = useState(null);
  const [cityValue, setCityValue] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  
  // Initialize form data when completeData changes
  useEffect(() => {
    if (completeData && isEditMode) {
      setFormData({
        primaryIntroduction: completeData.primaryIntroduction || {},
        professionalExperience: completeData.professionalExperience || {},
        projects: completeData.projects?.data || [],
        certifications: completeData.certifications?.data || [],
        education: completeData.education?.data || [],
      });
      
      // Initialize country, state, city dropdowns
      const user = completeData.primaryIntroduction?.user;
      if (user) {
        let countryVal = null;
        let cityVal = null;
        let stateVal = null;
        
        // Handle country - can be ISO code string or object with id
        if (user.country) {
          if (typeof user.country === 'object' && user.country.id) {
            countryVal = user.country.id;
          } else if (typeof user.country === 'string') {
            // Check if it's already an ISO code or needs conversion
            countryVal = user.country;
          }
        }
        
        // Handle city
        if (user.city) {
          cityVal = user.city;
        }
        
        // Handle state - check both state and user_state fields
        if (user.user_state || user.state) {
          stateVal = user.user_state || user.state;
        }
        
        if (countryVal) {
          setCountryValue(countryVal);
          const countryStates = State.getStatesOfCountry(countryVal);
          const stateOptions = countryStates ? countryStates.map(s => ({ 
            label: s.name, 
            value: s.isoCode, 
            countryCode: s.countryCode 
          })) : [];
          setStates(stateOptions);
          
          if (stateVal) {
            setStateValue(stateVal);
            const selectedState = stateOptions.find(s => s.value === stateVal || s.label === stateVal);
            if (selectedState) {
              const stateCities = City.getCitiesOfState(countryVal, selectedState.value);
              const cityOptions = stateCities ? stateCities.map(city => ({ 
                label: city.name, 
                value: city.name, 
                stateCode: city.stateCode, 
                countryCode: city.countryCode 
              })) : [];
              setCities(cityOptions);
            }
          }
          
          if (cityVal) {
            setCityValue(cityVal);
          }
        } else {
          // Reset if no country
          setCountryValue(null);
          setStateValue(null);
          setCityValue(null);
          setStates([]);
          setCities([]);
        }
      }
    }
  }, [completeData, isEditMode]);
  
  // Country, State, City change handlers
  const handleCountryChange = (value) => {
    const selectedCountryData = countryOptions.find(country => country.value === value);
    setSelectedCountry(selectedCountryData);
    setCountryValue(value);
    setStateValue(null);
    setCityValue(null);
    setSelectedCity(null);

    // Load states for selected country
    const countryStates = State.getStatesOfCountry(value);
    const stateOptions = countryStates ? countryStates.map(st => ({
      label: st.name,
      value: st.isoCode,
      countryCode: st.countryCode
    })) : [];
    setStates(stateOptions);
    setCities([]);

    const displayData = formData.primaryIntroduction?.user || {};
    updateFormData('primaryIntroduction', 'user', {
      ...displayData,
      country: selectedCountryData?.value || '',
      state: '',
      city: ''
    });
  };

  const handleStateChange = (value) => {
    setStateValue(value);
    setCityValue(null);
    const selectedState = states.find(st => st.value === value);
    const stateCities = City.getCitiesOfState(countryValue, value);
    const cityOptions = stateCities ? stateCities.map(city => ({
      label: city.name,
      value: city.name,
      stateCode: city.stateCode,
      countryCode: city.countryCode
    })) : [];
    setCities(cityOptions);
    
    const displayData = formData.primaryIntroduction?.user || {};
    updateFormData('primaryIntroduction', 'user', {
      ...displayData,
      state: selectedState?.label || selectedState?.value || '',
      city: ''
    });
  };

  const handleCityChange = (value) => {
    const selectedCityData = cities.find(city => city.value === value);
    setSelectedCity(selectedCityData);
    setCityValue(value);
    
    const displayData = formData.primaryIntroduction?.user || {};
    updateFormData('primaryIntroduction', 'user', {
      ...displayData,
      city: selectedCityData?.label || ''
    });
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await getApi(apiEndPoints.GET_CATEGORIES);
      
      if (Array.isArray(response?.data?.data)) {
        setCategories(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  // Fetch subcategories
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await getApi(`${apiEndPoints.GET_SUBCATEGORIES}/${categoryId}`);
      
      if (Array.isArray(response?.data?.data)) {
        setSubCategories(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setSubCategories(response.data);
      } else if (Array.isArray(response)) {
        setSubCategories(response);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories([]);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryIds([]);
    
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);
    const data = formData.professionalExperience?.data || {};
    
    // Check if the selected category should show Technical Expertise
    let shouldShowTechExpertise = false;
    if (selectedCategory) {
      const categoryName = selectedCategory.name.toLowerCase();
      shouldShowTechExpertise = 
        categoryName.includes('development') || 
        categoryName.includes('it') || 
        categoryName.includes('ai service') || 
        categoryName.includes('engineering');
    }
    
    setShowTechnicalExpertise(shouldShowTechExpertise);
    
    // Clear technical expertise if category doesn't require it
    if (!shouldShowTechExpertise) {
      setSelectedTechnologies([]);
      setTechnologySearchTerm('');
      updateFormData('professionalExperience', 'data', {
        ...data,
        project_category: categoryId,
        project_sub_category: '',
        technologty_pre: ''
      });
    } else {
      updateFormData('professionalExperience', 'data', {
        ...data,
        project_category: categoryId,
        project_sub_category: ''
      });
    }
    
    updateFormData('professionalExperience', 'category', selectedCategory || null);
    
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };
  
  // Handle subcategory change (multi-select)
  const handleSubCategoryChange = (subCategoryId, isChecked) => {
    let updatedIds;
    if (isChecked) {
      updatedIds = [...selectedSubCategoryIds, subCategoryId];
    } else {
      updatedIds = selectedSubCategoryIds.filter(id => id !== subCategoryId);
    }
    setSelectedSubCategoryIds(updatedIds);
    
    const subCategoryString = updatedIds.join(',');
    const data = formData.professionalExperience?.data || {};
    updateFormData('professionalExperience', 'data', {
      ...data,
      project_sub_category: subCategoryString
    });
    
    // Update subCategory in formData
    const selectedSubCats = subCategories.filter(sub => updatedIds.includes(sub.id.toString()));
    updateFormData('professionalExperience', 'subCategory', selectedSubCats.length > 0 ? selectedSubCats[0] : null);
  };
  
  // Reset search terms when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      setSubCategorySearchTerm('');
    }
  }, [selectedCategoryId]);
  
  // Fetch technologies
  const fetchTechnologies = async () => {
    try {
      setIsLoadingTechnologies(true);
      const response = await getApi(apiEndPoints.GET_TECHNOLOGIES);
      
      if (Array.isArray(response?.data?.data)) {
        setTechnologies(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setTechnologies(response.data);
      } else if (Array.isArray(response)) {
        setTechnologies(response);
      } else {
        setTechnologies([]);
      }
    } catch (error) {
      console.error('Error fetching technologies:', error);
      setTechnologies([]);
    } finally {
      setIsLoadingTechnologies(false);
    }
  };
  
  // Handle technology change (multi-select)
  const handleTechnologyChange = (technologyName, isChecked) => {
    let updatedTechnologies;
    if (isChecked) {
      updatedTechnologies = [...selectedTechnologies, technologyName];
    } else {
      updatedTechnologies = selectedTechnologies.filter(tech => tech !== technologyName);
    }
    setSelectedTechnologies(updatedTechnologies);
    
    const technologyString = updatedTechnologies.join(',');
    const data = formData.professionalExperience?.data || {};
    updateFormData('professionalExperience', 'data', {
      ...data,
      technologty_pre: technologyString
    });
  };
  
  // Handle language change (multi-select)
  const handleLanguageChange = (languageValue, isChecked) => {
    let updatedLanguages;
    if (isChecked) {
      updatedLanguages = [...selectedLanguages, languageValue];
    } else {
      updatedLanguages = selectedLanguages.filter(lang => lang !== languageValue);
    }
    setSelectedLanguages(updatedLanguages);
    
    const languageString = updatedLanguages.join(',');
    const data = formData.professionalExperience?.data || {};
    updateFormData('professionalExperience', 'data', {
      ...data,
      languages: languageString
    });
  };
  
  // Fetch project technologies
  const fetchProjectTechnologies = async () => {
    try {
      const response = await getApi(apiEndPoints.GET_TECHNOLOGIES);
      
      if (Array.isArray(response?.data?.data)) {
        setProjectTechnologies(response.data.data.map(item => ({
          label: item.name,
          value: item.name,
        })));
      } else if (Array.isArray(response?.data)) {
        setProjectTechnologies(response.data.map(item => ({
          label: item.name,
          value: item.name,
        })));
      } else if (Array.isArray(response)) {
        setProjectTechnologies(response.map(item => ({
          label: item.name,
          value: item.name,
        })));
      } else {
        setProjectTechnologies([]);
      }
    } catch (error) {
      console.error('Error fetching project technologies:', error);
      setProjectTechnologies([]);
    }
  };
  
  // Fetch project industries
  const fetchProjectIndustries = async () => {
    try {
      const response = await getApi(apiEndPoints.GET_INDUSTRIES);
      
      if (Array.isArray(response?.data?.data)) {
        setProjectIndustries(response.data.data.map(item => ({
          label: item.industry,
          value: item.id.toString(),
        })));
      } else if (Array.isArray(response?.data)) {
        setProjectIndustries(response.data.map(item => ({
          label: item.industry,
          value: item.id.toString(),
        })));
      } else if (Array.isArray(response)) {
        setProjectIndustries(response.map(item => ({
          label: item.industry,
          value: item.id.toString(),
        })));
      } else {
        setProjectIndustries([]);
      }
    } catch (error) {
      console.error('Error fetching project industries:', error);
      setProjectIndustries([]);
    }
  };
  
  // Initialize project country options
  useEffect(() => {
    if (isEditMode) {
      const countries = Country.getAllCountries().map(country => ({
        value: country.name,
        label: country.name,
        isoCode: country.isoCode,
        phoneCode: country.phonecode
      }));
      setProjectCountryOptions(countries);
    }
  }, [isEditMode]);
  
  // Check category to determine if Application Type should be hidden
  useEffect(() => {
    if (completeData && isEditMode && categories.length > 0) {
      const profExp = completeData.professionalExperience;
      if (profExp?.data?.project_category) {
        const selectedCategory = categories.find(cat => 
          cat.id.toString() === profExp.data.project_category.toString()
        );
        if (selectedCategory) {
          const shouldHide = categoriesToHideApplicationType.includes(selectedCategory.name);
          setHideApplicationTypeForProjects(shouldHide);
        }
      }
    }
  }, [completeData, isEditMode, categories]);
  
  // Load categories, technologies, and project data on mount
  useEffect(() => {
    if (isEditMode) {
      fetchCategories();
      fetchTechnologies();
      fetchProjectTechnologies();
      fetchProjectIndustries();
    }
  }, [isEditMode]);
  
  // Initialize category, subcategory, and technologies when data loads
  useEffect(() => {
    if (completeData && isEditMode && categories.length > 0) {
      const profExp = completeData.professionalExperience;
      if (profExp?.data?.project_category) {
        const categoryId = profExp.data.project_category.toString();
        
        // Always set category when data loads (will auto-select in dropdown)
        setSelectedCategoryId(categoryId);
        
        // Check if the loaded category should show Technical Expertise
        const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);
        if (selectedCategory) {
          const categoryName = selectedCategory.name.toLowerCase();
          const shouldShowTechExpertise = 
            categoryName.includes('development') || 
            categoryName.includes('it') || 
            categoryName.includes('ai service') || 
            categoryName.includes('engineering');
          setShowTechnicalExpertise(shouldShowTechExpertise);
        }
        
        // Fetch subcategories
        fetchSubCategories(categoryId);
      } else {
        // Reset if no category in data
        setSelectedCategoryId(null);
        setSelectedSubCategoryIds([]);
        setShowTechnicalExpertise(false);
      }
    }
  }, [completeData, isEditMode, categories]);
  
  // Initialize selected subcategories when subcategories are loaded
  useEffect(() => {
    if (completeData && isEditMode && subCategories.length > 0 && selectedCategoryId) {
      const profExp = completeData.professionalExperience;
      if (profExp?.data?.project_sub_category) {
        const subCategoryIds = profExp.data.project_sub_category.split(',').map(id => id.trim()).filter(id => id);
        // Validate that the IDs exist in the loaded subcategories
        const validIds = subCategoryIds.filter(id => 
          subCategories.some(sub => sub.id.toString() === id)
        );
        if (validIds.length > 0) {
          // Only update if different to avoid unnecessary re-renders
          const currentIds = selectedSubCategoryIds.sort().join(',');
          const newIds = validIds.sort().join(',');
          if (currentIds !== newIds) {
            setSelectedSubCategoryIds(validIds);
          }
        } else if (selectedSubCategoryIds.length > 0) {
          // Clear if no valid IDs found
          setSelectedSubCategoryIds([]);
        }
      } else if (selectedSubCategoryIds.length > 0) {
        // Clear if no subcategories in data
        setSelectedSubCategoryIds([]);
      }
    }
  }, [completeData, isEditMode, subCategories, selectedCategoryId]);
  
  // Initialize selected technologies when technologies are loaded
  useEffect(() => {
    if (completeData && isEditMode && technologies.length > 0) {
      const profExp = completeData.professionalExperience;
      if (profExp?.data?.technologty_pre) {
        const techArray = profExp.data.technologty_pre.split(',').map(tech => tech.trim()).filter(tech => tech);
        // Validate that the technologies exist in the loaded technologies
        const validTechs = techArray.filter(tech => 
          technologies.some(t => t.name === tech)
        );
        if (validTechs.length > 0) {
          // Only update if different to avoid unnecessary re-renders
          const currentTechs = selectedTechnologies.sort().join(',');
          const newTechs = validTechs.sort().join(',');
          if (currentTechs !== newTechs) {
            setSelectedTechnologies(validTechs);
          }
        } else if (selectedTechnologies.length > 0) {
          // Clear if no valid technologies found
          setSelectedTechnologies([]);
        }
      } else if (selectedTechnologies.length > 0) {
        // Clear if no technologies in data
        setSelectedTechnologies([]);
      }
    }
  }, [completeData, isEditMode, technologies]);
  
  // Initialize selected languages when data loads
  useEffect(() => {
    if (completeData && isEditMode) {
      const profExp = completeData.professionalExperience;
      if (profExp?.data?.languages) {
        const langArray = profExp.data.languages.split(',').map(lang => lang.trim()).filter(lang => lang);
        // Only update if different to avoid unnecessary re-renders
        const currentLangs = selectedLanguages.sort().join(',');
        const newLangs = langArray.sort().join(',');
        if (currentLangs !== newLangs) {
          setSelectedLanguages(langArray);
        }
      } else if (selectedLanguages.length > 0) {
        // Clear if no languages in data
        setSelectedLanguages([]);
      }
    }
  }, [completeData, isEditMode]);
  
  // Initialize education data when data loads
  useEffect(() => {
    if (completeData && isEditMode) {
      const eduData = completeData.education;
      if (eduData) {
        // Separate graduation and post-graduation
        const grad = (eduData.graduation || []).map(item => ({
          id: item.id || null,
          delete_id: item.id ? '1' : '0',
          education_type: item.education_type || '',
          graduation_type: item.graduation_type || '3',
          university_name: item.university_name || '',
          month: item.month || '',
          year: item.year || '',
          degree: item.degree || '',
        }));
        
        const postGrad = (eduData.postGraduation || []).map(item => ({
          id: item.id || null,
          delete_id: item.id ? '1' : '0',
          education_type: item.education_type || '',
          graduation_type: item.graduation_type || '4',
          university_name: item.university_name || '',
          month: item.month || '',
          year: item.year || '',
          degree: item.degree || '',
        }));
        
        setGraduationList(grad.length > 0 ? grad : [{
          id: null,
          delete_id: '0',
          education_type: '',
          graduation_type: '3',
          university_name: '',
          month: '',
          year: '',
          degree: '',
        }]);
        
        setPostGraduationList(postGrad.length > 0 ? postGrad : [{
          id: null,
          delete_id: '0',
          education_type: '',
          graduation_type: '4',
          university_name: '',
          month: '',
          year: '',
          degree: '',
        }]);
        
        // Update formData
        setFormData(prev => ({
          ...prev,
          education: [...grad, ...postGrad]
        }));
      } else {
        // Reset if no education data
        setGraduationList([{
          id: null,
          delete_id: '0',
          education_type: '',
          graduation_type: '3',
          university_name: '',
          month: '',
          year: '',
          degree: '',
        }]);
        setPostGraduationList([{
          id: null,
          delete_id: '0',
          education_type: '',
          graduation_type: '4',
          university_name: '',
          month: '',
          year: '',
          degree: '',
        }]);
      }
    } else if (!isEditMode) {
      // Reset when not in edit mode
      setGraduationList([]);
      setPostGraduationList([]);
      setEducationValidated(false);
    }
  }, [completeData, isEditMode]);
  
  const handleUpdate = async (tabName) => {
    if (!userId) {
      showError('No freelancer selected');
      return;
    }

    setIsUpdating(true);
    try {
      if (tabName === 'Primary Introduction') {
        const primaryIntro = formData.primaryIntroduction;
        const userData = primaryIntro?.user || {};
        
        // Prepare the payload with only the fields that can be updated
        const payload = {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          mobile: userData.mobile,
          gender: userData.gender,
          dob: userData.dob,
          doi: userData.doi,
          company_name: userData.company_name,
          gst_number: userData.gst_number,
          country: countryValue,
          state: stateValue,
          city: cityValue,
          designation: userData.designation,
        };

        const response = await putApi(
          `${apiEndPoints.UPDATE_FREELANCER_PRIMARY_INTRODUCTION}/${userId}/primary-introduction`,
          payload
        );

        if (response?.data?.success) {
          showSuccess('Primary Introduction updated successfully');
          // Refresh the complete data
          dispatch(freelancerCompleteData({ userId }));
        } else {
          showError(response?.data?.message || 'Failed to update Primary Introduction');
        }
      } else if (tabName === 'Professional Experience') {
        const profExp = formData.professionalExperience;
        const profExpData = profExp?.data || {};
        
        // Prepare the payload with all professional experience fields
        const payload = {
          profile_headline: profExpData.profile_headline,
          project_category: selectedCategoryId || profExpData.project_category,
          project_sub_category: selectedSubCategoryIds.join(','), // Comma-separated string
          technologty_pre: selectedTechnologies.join(','), // Comma-separated string
          model_engagement: profExpData.model_engagement,
          rateperhour: profExpData.rateperhour,
          rateperhour_2: profExpData.rateperhour_2,
          currency: profExpData.currency,
          languages: profExpData.languages,
          support_project: profExpData.support_project,
          development_project: profExpData.development_project,
          upwork_platform: profExpData.upwork_platform || false,
          upwork_platform_profile_link: profExpData.upwork_platform_profile_link || '',
          fiver_platform: profExpData.fiver_platform || false,
          fiver_platform_profile_link: profExpData.fiver_platform_profile_link || '',
          freelancer_platform: profExpData.freelancer_platform || false,
          freelancer_platform_profile_link: profExpData.freelancer_platform_profile_link || '',
          truelancer_platform: profExpData.truelancer_platform || false,
          truelancer_platform_profile_link: profExpData.truelancer_platform_profile_link || '',
          pph_platform: profExpData.pph_platform || false,
          pph_platform_profile_link: profExpData.pph_platform_profile_link || '',
          other_platform: profExpData.other_platform || '',
          other_platform_profile_link: profExpData.other_platform_profile_link || '',
        };

        const profExpResponse = await putApi(
          `${apiEndPoints.UPDATE_FREELANCER_PROFESSIONAL_EXPERIENCE}/${userId}/professional-experience`,
          payload
        );

        if (profExpResponse?.data?.success) {
          showSuccess('Professional Experience updated successfully');
          // Refresh the complete data
          dispatch(freelancerCompleteData({ userId }));
        } else {
          showError(profExpResponse?.data?.message || 'Failed to update Professional Experience');
        }
      } else if (tabName === 'Projects') {
        const projectsData = formData.projects || [];
        
        // Validate minimum 3 projects requirement
        if (projectsData.length < 3) {
          showError('At least 3 projects are mandatory. Please provide at least 3 projects.');
          setIsUpdating(false);
          return;
        }
        
        // Prepare the payload with inputList array
        const payload = {
          inputList: projectsData.map(project => ({
            id: project.id || null,
            delete_id: project.delete_id || '',
            project_name: project.project_name || '',
            project_type: project.project_type || '',
            is_mobile_platform: project.is_mobile_platform || false,
            is_web_platform: project.is_web_platform || false,
            is_desktop_platform: project.is_desktop_platform || false,
            is_embedding_platform: project.is_embedding_platform || false,
            duration: project.duration || '',
            technologty_pre: project.technologty_pre || '',
            industry: project.industry || '',
            project_details: project.project_details || '',
            project_link: project.project_link || '',
            upload_file: project.upload_file || '',
            project_location: project.project_location || '',
            user_last_path: window.location.pathname
          }))
        };

        const projectsResponse = await putApi(
          `${apiEndPoints.UPDATE_FREELANCER_PROJECTS}/${userId}/projects`,
          payload
        );

        if (projectsResponse?.data?.success) {
          showSuccess('Projects updated successfully');
          // Refresh the complete data
          dispatch(freelancerCompleteData({ userId }));
        } else {
          showError(projectsResponse?.data?.message || 'Failed to update Projects');
        }
      } else if (tabName === 'Education') {
        // Combine graduation and post-graduation lists
        const allEducation = [...graduationList, ...postGraduationList];
        
        // Prepare the payload - send array directly (matching user-side API format)
        const payload = allEducation.map(edu => ({
          id: edu.id || null,
          delete_id: edu.delete_id || '0',
          education_type: edu.education_type || '',
          graduation_type: edu.graduation_type || '',
          university_name: edu.university_name || '',
          month: edu.month || '',
          year: edu.year || '',
          degree: edu.degree || '',
          user_last_path: window.location.pathname
        }));

        const educationResponse = await putApi(
          `${apiEndPoints.UPDATE_FREELANCER_EDUCATION}/${userId}/education`,
          payload
        );

        if (educationResponse?.data?.success) {
          showSuccess('Education updated successfully');
          // Refresh the complete data
          dispatch(freelancerCompleteData({ userId }));
        } else {
          showError(educationResponse?.data?.message || 'Failed to update Education');
        }
      } else {
        // TODO: Implement other tab updates
        showSuccess(`${tabName} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${tabName}:`, error);
      showError(error?.response?.data?.message || `Failed to update ${tabName}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const updateFormData = (section, field, value) => {
    setFormData(prev => {
      if (field === 'user') {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            user: value,
          },
        };
      } else if (field === 'data') {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            data: value,
          },
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };
  
  const updateNestedFormData = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  if (!completeData) {
    return (
      <Flex py={10} align="center" justify="center">
        <Text color="gray.500">No data available</Text>
      </Flex>
    );
  }

  const { primaryIntroduction, professionalExperience, projects, certifications, education, summary } = completeData;

  const formatCurrency = (amount, currency) => {
    if (!amount) return '--';
    return `${currency || '$'} ${amount}`;
  };

  const renderInfoItem = (icon, label, value, fullWidth = false) => {
    if (!value && value !== 0 && value !== false) return null;
    
    return (
      <GridItem colSpan={{ base: 12, md: fullWidth ? 12 : 6, lg: fullWidth ? 12 : 4 }}>
        <VStack align="start" spacing={1} mb={4}>
          <HStack spacing={2}>
            {icon}
            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
              {label}
            </Text>
          </HStack>
          <Text fontSize="sm" fontWeight="500" color={textColor}>
            {value}
          </Text>
        </VStack>
      </GridItem>
    );
  };

  const renderEditableField = (icon, label, value, onChange, fullWidth = false, isTextarea = false) => {
    return (
      <GridItem colSpan={{ base: 12, md: fullWidth ? 12 : 6, lg: fullWidth ? 12 : 4 }}>
        <FormControl mb={4}>
          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
            <HStack spacing={2}>
              {icon}
              <Text>{label}</Text>
            </HStack>
          </FormLabel>
          {isTextarea ? (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              fontSize="sm"
              borderColor={borderColor}
              _hover={{ borderColor: 'brand.500' }}
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
            />
          ) : (
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              fontSize="sm"
              borderColor={borderColor}
              _hover={{ borderColor: 'brand.500' }}
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
            />
          )}
        </FormControl>
      </GridItem>
    );
  };

  const renderPrimaryIntroduction = () => {
    const data = isEditMode ? formData.primaryIntroduction : primaryIntroduction;
    if (!data) {
      return <Text color="gray.500">No primary introduction data available.</Text>;
    }
    
    const { user, designation } = data;
    const userData = user || {};
    const displayData = isEditMode ? formData.primaryIntroduction?.user || userData : userData;

    return (
      <VStack align="stretch" spacing={6}>
        <Card bg={cardBg} p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={4} align="start">
              <Avatar
                size="xl"
                src={displayData.profile_image}
                name={`${displayData.first_name || ''} ${displayData.last_name || ''}`}
                bg="brand.500"
              />
              <VStack align="start" spacing={2} flex={1}>
                {isEditMode ? (
                  <HStack spacing={2} w="100%">
                    <FormControl>
                      <FormLabel fontSize="xs">First Name</FormLabel>
                      <Input
                        value={displayData.first_name || ''}
                        onChange={(e) => updateFormData('primaryIntroduction', 'user', { ...displayData, first_name: e.target.value })}
                        fontSize="sm"
                        borderColor={borderColor}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">Last Name</FormLabel>
                      <Input
                        value={displayData.last_name || ''}
                        onChange={(e) => updateFormData('primaryIntroduction', 'user', { ...displayData, last_name: e.target.value })}
                        fontSize="sm"
                        borderColor={borderColor}
                      />
                    </FormControl>
                  </HStack>
                ) : (
                  <>
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                      {`${displayData.first_name || ''} ${displayData.last_name || ''}`}
                    </Text>
                    <Badge 
                      colorScheme={displayData.status === 'approval' ? 'green' : 'yellow'}
                      variant="solid"
                      fontSize="xs"
                    >
                      {displayData.status || 'Unknown'}
                    </Badge>
                  </>
                )}
              </VStack>
            </HStack>

            <Divider />

            {isEditMode ? (
              <VStack align="stretch" spacing={4}>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  {renderEditableField(
                    <MdEmail />,
                    'Email',
                    displayData.email,
                    (value) => updateFormData('primaryIntroduction', 'user', { ...displayData, email: value })
                  )}
                  {renderEditableField(
                    <MdPhone />,
                    'Mobile',
                    displayData.mobile,
                    (value) => updateFormData('primaryIntroduction', 'user', { ...displayData, mobile: value })
                  )}
                  {renderEditableField(
                    <MdPerson />,
                    'Gender',
                    displayData.gender,
                    (value) => updateFormData('primaryIntroduction', 'user', { ...displayData, gender: value })
                  )}
                  {renderEditableField(
                    <MdBusiness />,
                    'Company',
                    displayData.company_name,
                    (value) => updateFormData('primaryIntroduction', 'user', { ...displayData, company_name: value })
                  )}
                </Grid>
                
                {/* City, State, Country on same line */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                  <GridItem colSpan={{ base: 12, md: 4 }}>
                    <FormControl mb={4}>
                      <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        <HStack spacing={2}>
                          <MdLocationOn />
                          <Text>Country</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        placeholder="Select a country"
                        value={countryValue || ''}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'brand.500' }}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        fontSize="sm"
                      >
                        {countryOptions.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem colSpan={{ base: 12, md: 4 }}>
                    <FormControl mb={4}>
                      <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        <HStack spacing={2}>
                          <MdLocationOn />
                          <Text>State</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        placeholder={states.length > 0 ? "Select a state" : "No states found"}
                        value={stateValue || ''}
                        onChange={(e) => handleStateChange(e.target.value)}
                        isDisabled={!countryValue || states.length === 0}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'brand.500' }}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        fontSize="sm"
                      >
                        {states.length > 0 ? (
                          states.map((state) => (
                            <option key={state.value} value={state.value}>
                              {state.label}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No states found</option>
                        )}
                      </Select>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem colSpan={{ base: 12, md: 4 }}>
                    <FormControl mb={4}>
                      <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        <HStack spacing={2}>
                          <MdLocationOn />
                          <Text>City</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        placeholder={cities.length > 0 ? "Select a city" : "No cities found"}
                        value={cityValue || ''}
                        onChange={(e) => handleCityChange(e.target.value)}
                        isDisabled={!stateValue || cities.length === 0}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'brand.500' }}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        fontSize="sm"
                      >
                        {cities.length > 0 ? (
                          cities.map((city) => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No cities found</option>
                        )}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>
              </VStack>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {renderInfoItem(<MdEmail />, 'Email', displayData.email)}
                {renderInfoItem(<MdPhone />, 'Mobile', displayData.mobile)}
                {renderInfoItem(<MdPerson />, 'Gender', displayData.gender)}
                {renderInfoItem(<MdBusiness />, 'Designation', designation?.name)}
                {renderInfoItem(<MdBusiness />, 'Company', displayData.company_name)}
                {renderInfoItem(<MdLocationOn />, 'Location', 
                  [displayData.city, displayData.state, displayData.country].filter(Boolean).join(', ')
                )}
                {displayData.address && renderInfoItem(<MdLocationOn />, 'Address', displayData.address, true)}
                {displayData.aboutme && renderInfoItem(<MdPerson />, 'About', displayData.aboutme, true)}
              </Grid>
            )}
          </VStack>
        </Card>
        {isEditMode && (
          <Flex justify="flex-end" pt={4}>
            <Button
              colorScheme="brand"
              onClick={() => handleUpdate('Primary Introduction')}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Update Primary Introduction
            </Button>
          </Flex>
        )}
      </VStack>
    );
  };

  const renderProfessionalExperience = () => {
    const data = isEditMode ? formData.professionalExperience?.data || professionalExperience?.data : professionalExperience?.data;
    const category = isEditMode ? formData.professionalExperience?.category || professionalExperience?.category : professionalExperience?.category;
    const subCategory = isEditMode ? formData.professionalExperience?.subCategory || professionalExperience?.subCategory : professionalExperience?.subCategory;
    
    if (!data) {
      return <Text color="gray.500">No professional experience data available.</Text>;
    }

    return (
      <VStack align="stretch" spacing={6}>
        <Card bg={cardBg} p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2} mb={4}>
              <MdWork size={24} color="brand.500" />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Professional Overview
              </Text>
            </HStack>

            {isEditMode ? (
              <VStack align="stretch" spacing={4}>
                {/* Category and Subcategory Section */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <GridItem>
                    <FormControl mb={4}>
                      <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        <HStack spacing={2}>
                          <MdBusiness />
                          <Text>Project Category</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        placeholder="Select a category"
                        value={selectedCategoryId || ''}
                        onChange={handleCategoryChange}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'brand.500' }}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                        fontSize="sm"
                        isDisabled={isLoadingCategories}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl mb={4}>
                      <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        <HStack spacing={2}>
                          <MdBusiness />
                          <Text>Project Sub Category</Text>
                        </HStack>
                      </FormLabel>
                      <Box
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        bg={cardBg}
                      >
                        {subCategories.length > 0 && (
                          <Box p={2} borderBottom="1px solid" borderColor={borderColor}>
                            <Input
                              placeholder="Search subcategories..."
                              value={subCategorySearchTerm}
                              onChange={(e) => setSubCategorySearchTerm(e.target.value)}
                              size="sm"
                              borderColor={borderColor}
                              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                            />
                          </Box>
                        )}
                        <Box
                          p={3}
                          maxH="200px"
                          overflowY="auto"
                        >
                          {subCategories.length > 0 ? (
                            (() => {
                              const filteredSubCategories = subCategories.filter(subCat =>
                                subCat.name.toLowerCase().includes(subCategorySearchTerm.toLowerCase())
                              );
                              return filteredSubCategories.length > 0 ? (
                                <VStack align="start" spacing={2}>
                                  {filteredSubCategories.map((subCategory) => (
                                    <Checkbox
                                      key={subCategory.id}
                                      isChecked={selectedSubCategoryIds.includes(subCategory.id.toString())}
                                      onChange={(e) => handleSubCategoryChange(subCategory.id.toString(), e.target.checked)}
                                      fontSize="sm"
                                      colorScheme="brand"
                                    >
                                      {subCategory.name}
                                    </Checkbox>
                                  ))}
                                </VStack>
                              ) : (
                                <Text fontSize="sm" color="gray.500">
                                  No subcategories found matching "{subCategorySearchTerm}"
                                </Text>
                              );
                            })()
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              {selectedCategoryId ? 'No subcategories found' : 'Please select a category first'}
                            </Text>
                          )}
                        </Box>
                      </Box>
                    </FormControl>
                  </GridItem>
                </Grid>
                
                {/* Other fields */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  {renderEditableField(
                    <MdWork />,
                    'Profile Headline',
                    data.profile_headline,
                    (value) => updateFormData('professionalExperience', 'data', { ...data, profile_headline: value }),
                    true
                  )}
                  {renderEditableField(
                    <MdAttachMoney />,
                    'Rate per Hour',
                    data.rateperhour_2,
                    (value) => updateFormData('professionalExperience', 'data', { ...data, rateperhour_2: value })
                  )}
                </Grid>
                
                {/* Languages Multi-Select */}
                <FormControl mb={4}>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                    <HStack spacing={2}>
                      <MdLanguage />
                      <Text>Languages</Text>
                    </HStack>
                  </FormLabel>
                  <Box
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={3}
                    maxH="200px"
                    overflowY="auto"
                    bg={cardBg}
                  >
                    {languageOptions.length > 0 ? (
                      <VStack align="start" spacing={2}>
                        {languageOptions.map((language) => (
                          <Checkbox
                            key={language.value}
                            isChecked={selectedLanguages.includes(language.value)}
                            onChange={(e) => handleLanguageChange(language.value, e.target.checked)}
                            fontSize="sm"
                            colorScheme="brand"
                          >
                            {language.label}
                          </Checkbox>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No languages available
                      </Text>
                    )}
                  </Box>
                </FormControl>
                
                {/* Technologies Multi-Select (only shown when showTechnicalExpertise is true) */}
                {showTechnicalExpertise && (
                  <FormControl mb={4}>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                      <HStack spacing={2}>
                        <MdBusiness />
                        <Text>Technical Expertise</Text>
                      </HStack>
                    </FormLabel>
                    <Box
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg={cardBg}
                    >
                      {technologies.length > 0 && (
                        <Box p={2} borderBottom="1px solid" borderColor={borderColor}>
                          <Input
                            placeholder="Search technologies..."
                            value={technologySearchTerm}
                            onChange={(e) => setTechnologySearchTerm(e.target.value)}
                            size="sm"
                            borderColor={borderColor}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          />
                        </Box>
                      )}
                      <Box
                        p={3}
                        maxH="200px"
                        overflowY="auto"
                      >
                        {technologies.length > 0 ? (
                          (() => {
                            const filteredTechnologies = technologies.filter(tech =>
                              tech.name.toLowerCase().includes(technologySearchTerm.toLowerCase())
                            );
                            return filteredTechnologies.length > 0 ? (
                              <VStack align="start" spacing={2}>
                                {filteredTechnologies.map((technology) => (
                                  <Checkbox
                                    key={technology.id || technology.name}
                                    isChecked={selectedTechnologies.includes(technology.name)}
                                    onChange={(e) => handleTechnologyChange(technology.name, e.target.checked)}
                                    fontSize="sm"
                                    colorScheme="brand"
                                  >
                                    {technology.name}
                                  </Checkbox>
                                ))}
                              </VStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                No technologies found matching "{technologySearchTerm}"
                              </Text>
                            );
                          })()
                        ) : (
                          <Text fontSize="sm" color="gray.500">
                            {isLoadingTechnologies ? 'Loading technologies...' : 'No technologies found'}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </FormControl>
                )}
              </VStack>
            ) : (
              <>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  {data.profile_headline && renderInfoItem(<MdWork />, 'Profile Headline', data.profile_headline, true)}
                  {renderInfoItem(<MdBusiness />, 'Category', category?.name)}
                  {renderInfoItem(<MdBusiness />, 'Sub Category', subCategory?.name)}
                  {renderInfoItem(<MdAttachMoney />, 'Rate per Hour', formatCurrency(data.rateperhour_2, data.currency?.split('-')[1]))}
                  {renderInfoItem(<MdLanguage />, 'Languages', data.languages)}
                </Grid>

                {data.technologty_pre && (
                  <Box mt={4}>
                    <HStack spacing={2} mb={2}>
                      <MdBusiness size={20} />
                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        Technologies
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexWrap="wrap">
                      {data.technologty_pre.split(',').map((tech, index) => (
                        <Tag key={index} colorScheme="brand" size="sm" borderRadius="md">
                          {tech.trim()}
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                )}
              </>
            )}
          </VStack>
        </Card>

        <Card bg={cardBg} p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2} mb={4}>
              <MdPublic size={24} color="brand.500" />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Platform Links
              </Text>
            </HStack>

            {isEditMode ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                {renderEditableField(
                  <MdLink />,
                  'Upwork Profile Link',
                  data.upwork_platform_profile_link,
                  (value) => updateFormData('professionalExperience', 'data', { ...data, upwork_platform_profile_link: value })
                )}
                {renderEditableField(
                  <MdLink />,
                  'Fiverr Profile Link',
                  data.fiver_platform_profile_link,
                  (value) => updateFormData('professionalExperience', 'data', { ...data, fiver_platform_profile_link: value })
                )}
                {renderEditableField(
                  <MdLink />,
                  'Freelancer Profile Link',
                  data.freelancer_platform_profile_link,
                  (value) => updateFormData('professionalExperience', 'data', { ...data, freelancer_platform_profile_link: value })
                )}
                {renderEditableField(
                  <MdLink />,
                  'PeoplePerHour Profile Link',
                  data.pph_platform_profile_link,
                  (value) => updateFormData('professionalExperience', 'data', { ...data, pph_platform_profile_link: value })
                )}
                {renderEditableField(
                  <MdLink />,
                  'Truelancer Profile Link',
                  data.truelancer_platform_profile_link,
                  (value) => updateFormData('professionalExperience', 'data', { ...data, truelancer_platform_profile_link: value })
                )}
                {renderEditableField(
                  <MdLink />,
                  'Other Platform Profile Link',
                  data.other_platform_profile_link,
                  (value) => updateFormData('professionalExperience', 'data', { ...data, other_platform_profile_link: value })
                )}
              </Grid>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                {[
                  { name: 'Upwork', active: data.upwork_platform, link: data.upwork_platform_profile_link },
                  { name: 'Fiverr', active: data.fiver_platform, link: data.fiver_platform_profile_link },
                  { name: 'Freelancer', active: data.freelancer_platform, link: data.freelancer_platform_profile_link },
                  { name: 'PeoplePerHour', active: data.pph_platform, link: data.pph_platform_profile_link },
                  { name: 'Truelancer', active: data.truelancer_platform, link: data.truelancer_platform_profile_link },
                  { name: data.other_platform || 'Other', active: !!data.other_platform, link: data.other_platform_profile_link }
                ].filter(platform => platform.active).map((platform, index) => (
                  <GridItem key={index}>
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <MdLink size={16} />
                        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                          {platform.name}
                        </Text>
                      </HStack>
                      {platform.link ? (
                        <Link href={platform.link} target="_blank" rel="noopener noreferrer" color="brand.500" fontSize="sm" isExternal>
                          {platform.link}
                        </Link>
                      ) : (
                        <Text fontSize="sm" color={textColor}>Active (No link provided)</Text>
                      )}
                    </VStack>
                  </GridItem>
                ))}
              </Grid>
            )}
          </VStack>
        </Card>
        {isEditMode && (
          <Flex justify="flex-end" pt={4}>
            <Button
              colorScheme="brand"
              onClick={() => handleUpdate('Professional Experience')}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Update Professional Experience
            </Button>
          </Flex>
        )}
      </VStack>
    );
  };

  // Handle project technology change (multi-select per project)
  const handleProjectTechnologyChange = (projectIndex, technologyName, isChecked) => {
    const projects = [...(formData.projects || [])];
    const project = projects[projectIndex] || {};
    const currentTechs = project.technologty_pre ? project.technologty_pre.split(',').map(t => t.trim()).filter(t => t) : [];
    
    let updatedTechs;
    if (isChecked) {
      updatedTechs = [...currentTechs, technologyName];
    } else {
      updatedTechs = currentTechs.filter(tech => tech !== technologyName);
    }
    
    projects[projectIndex] = {
      ...project,
      technologty_pre: updatedTechs.join(',')
    };
    
    setFormData(prev => ({
      ...prev,
      projects
    }));
  };

  const renderProjects = () => {
    const projectsData = isEditMode ? formData.projects : projects?.data;
    const count = isEditMode ? formData.projects?.length : projects?.count;
    
    if (!projectsData || projectsData.length === 0) {
      return <Text color="gray.500">No projects data available.</Text>;
    }

    const getProjectTypeLabel = (projectType) => {
      if (projectType === '1') return 'Support';
      if (projectType === '2') return 'New Development';
      if (projectType === '3') return 'New Development Cum Support';
      return '--';
    };

    return (
      <VStack align="stretch" spacing={4}>
        <Card bg={cardBg} p={6}>
          <HStack spacing={2} mb={4}>
            <MdFolder size={24} color="brand.500" />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Projects ({count || projectsData.length})
            </Text>
          </HStack>

          <VStack align="stretch" spacing={6}>
            {projectsData.map((project, index) => {
              const platforms = [
                { name: 'Web', active: project.is_web_platform },
                { name: 'Mobile', active: project.is_mobile_platform },
                { name: 'Desktop', active: project.is_desktop_platform },
                { name: 'Embedding', active: project.is_embedding_platform }
              ].filter(platform => platform.active);
              
              const hasPlatforms = platforms.length > 0;
              const projectTechs = project.technologty_pre ? project.technologty_pre.split(',').map(t => t.trim()).filter(t => t) : [];

              return (
                <Card key={project.id || index} bg={hoverBg} p={6} border="1px solid" borderColor={borderColor}>
                  <VStack align="stretch" spacing={4}>
                    {isEditMode ? (
                      <>
                        {/* Project Name */}
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Project Name <span style={{ color: 'red' }}>*</span>
                          </FormLabel>
                          <Input
                            value={project.project_name || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 100) {
                                updateNestedFormData('projects', index, 'project_name', value);
                              }
                            }}
                            fontSize="sm"
                            borderColor={borderColor}
                            maxLength={100}
                            _hover={{ borderColor: 'brand.500' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          />
                        </FormControl>

                        {/* Project Type */}
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Project Type <span style={{ color: 'red' }}>*</span>
                          </FormLabel>
                          <Select
                            value={project.project_type || ''}
                            onChange={(e) => updateNestedFormData('projects', index, 'project_type', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            _hover={{ borderColor: 'brand.500' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          >
                            <option value="">Select Project Type</option>
                            {projectTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Application Type - Conditional */}
                        {!hideApplicationTypeForProjects && (
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                              Application Type <span style={{ color: 'red' }}>*</span>
                            </FormLabel>
                            <VStack align="start" spacing={2}>
                              <Checkbox
                                isChecked={project.is_mobile_platform || false}
                                onChange={(e) => updateNestedFormData('projects', index, 'is_mobile_platform', e.target.checked)}
                                fontSize="sm"
                                colorScheme="brand"
                              >
                                Mobile App
                              </Checkbox>
                              <Checkbox
                                isChecked={project.is_web_platform || false}
                                onChange={(e) => updateNestedFormData('projects', index, 'is_web_platform', e.target.checked)}
                                fontSize="sm"
                                colorScheme="brand"
                              >
                                Website
                              </Checkbox>
                              <Checkbox
                                isChecked={project.is_desktop_platform || false}
                                onChange={(e) => updateNestedFormData('projects', index, 'is_desktop_platform', e.target.checked)}
                                fontSize="sm"
                                colorScheme="brand"
                              >
                                Desktop App
                              </Checkbox>
                              <Checkbox
                                isChecked={project.is_embedding_platform || false}
                                onChange={(e) => updateNestedFormData('projects', index, 'is_embedding_platform', e.target.checked)}
                                fontSize="sm"
                                colorScheme="brand"
                              >
                                Embedded Project
                              </Checkbox>
                            </VStack>
                          </FormControl>
                        )}

                        {/* Duration and Technology in a row */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                              Duration (Months) <span style={{ color: 'red' }}>*</span>
                            </FormLabel>
                            <Input
                              type="text"
                              value={project.duration || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                if (value === '' || (parseInt(value) <= 50)) {
                                  updateNestedFormData('projects', index, 'duration', value);
                                }
                              }}
                              fontSize="sm"
                              borderColor={borderColor}
                              maxLength={2}
                              _hover={{ borderColor: 'brand.500' }}
                              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                            />
                          </FormControl>

                          {/* Technology - Conditional */}
                          {!hideApplicationTypeForProjects && (
                            <FormControl>
                              <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                                Technology <span style={{ color: 'red' }}>*</span>
                              </FormLabel>
                              <Box
                                border="1px solid"
                                borderColor={borderColor}
                                borderRadius="md"
                                p={3}
                                maxH="200px"
                                overflowY="auto"
                                bg={cardBg}
                              >
                                {projectTechnologies.length > 0 ? (
                                  <VStack align="start" spacing={2}>
                                    {projectTechnologies.map((tech) => (
                                      <Checkbox
                                        key={tech.value}
                                        isChecked={projectTechs.includes(tech.value)}
                                        onChange={(e) => handleProjectTechnologyChange(index, tech.value, e.target.checked)}
                                        fontSize="sm"
                                        colorScheme="brand"
                                      >
                                        {tech.label}
                                      </Checkbox>
                                    ))}
                                  </VStack>
                                ) : (
                                  <Text fontSize="sm" color="gray.500">
                                    No technologies available
                                  </Text>
                                )}
                              </Box>
                            </FormControl>
                          )}
                        </Grid>

                        {/* Industry */}
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Industry that Product was designed for <span style={{ color: 'red' }}>*</span>
                          </FormLabel>
                          <Select
                            value={project.industry ? project.industry.toString() : ''}
                            onChange={(e) => updateNestedFormData('projects', index, 'industry', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            placeholder="Select a Customer Industry"
                            _hover={{ borderColor: 'brand.500' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          >
                            <option value="">Select Industry</option>
                            {projectIndustries.map(industry => (
                              <option key={industry.value} value={industry.value}>{industry.label}</option>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Project Details */}
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Project Details <span style={{ color: 'red' }}>*</span>
                            <span style={{ fontSize: '12px', marginLeft: '10px', color: '#666', fontWeight: 'normal' }}>
                              (Min 100, Max 300 characters)
                            </span>
                          </FormLabel>
                          <Textarea
                            value={project.project_details || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 300) {
                                updateNestedFormData('projects', index, 'project_details', value);
                              }
                            }}
                            fontSize="sm"
                            borderColor={borderColor}
                            rows={4}
                            minLength={100}
                            maxLength={300}
                            _hover={{ borderColor: 'brand.500' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          />
                          <Text 
                            fontSize="xs" 
                            color={project.project_details && project.project_details.length > 300 ? 'red.500' : 'gray.500'}
                            textAlign="right"
                            mt={1}
                          >
                            {project.project_details ? project.project_details.length : 0}/300
                          </Text>
                        </FormControl>

                        {/* Project Location */}
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Project Location <span style={{ color: 'red' }}>*</span>
                          </FormLabel>
                          <Select
                            value={project.project_location || ''}
                            onChange={(e) => updateNestedFormData('projects', index, 'project_location', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            placeholder="Select Project Location"
                            _hover={{ borderColor: 'brand.500' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          >
                            <option value="">Select Location</option>
                            {projectCountryOptions.map(country => (
                              <option key={country.value} value={country.value}>{country.label}</option>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Project Url */}
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Project Url
                          </FormLabel>
                          <Input
                            value={project.project_link || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                updateNestedFormData('projects', index, 'project_link', value);
                              }
                            }}
                            fontSize="sm"
                            borderColor={borderColor}
                            maxLength={50}
                            _hover={{ borderColor: 'brand.500' }}
                            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                          />
                        </FormControl>
                      </>
                    ) : (
                      <>
                        <Text fontSize="md" fontWeight="bold" color={textColor}>
                          {project.project_name || `Project ${index + 1}`}
                        </Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                          {renderInfoItem(<MdCalendarToday />, 'Duration', project.duration ? `${project.duration} months` : null)}
                          {renderInfoItem(<MdLocationOn />, 'Location', project.project_location)}
                          {renderInfoItem(<MdWork />, 'Type', getProjectTypeLabel(project.project_type))}
                        </Grid>
                        {project.technologty_pre && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <MdBusiness size={16} />
                              <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                                Technologies
                              </Text>
                            </HStack>
                            <HStack spacing={2} flexWrap="wrap">
                              {projectTechs.map((tech, techIndex) => (
                                <Tag key={techIndex} colorScheme="brand" size="sm" borderRadius="md">
                                  {tech}
                                </Tag>
                              ))}
                            </HStack>
                          </Box>
                        )}
                        {hasPlatforms && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <MdPublic size={16} />
                              <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                                Platforms
                              </Text>
                            </HStack>
                            <HStack spacing={2} flexWrap="wrap">
                              {platforms.map((platform, platformIndex) => (
                                <Tag key={platformIndex} variant="outlined" size="sm" borderRadius="md">
                                  {platform.name}
                                </Tag>
                              ))}
                            </HStack>
                          </Box>
                        )}
                        {project.project_details && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <MdDescription size={16} />
                              <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                                Description
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color={textColor} lineHeight="1.6">
                              {project.project_details}
                            </Text>
                          </Box>
                        )}
                        {project.project_link && (
                          <Link 
                            href={project.project_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            color="brand.500"
                            fontSize="sm"
                            isExternal
                          >
                            <HStack spacing={1}>
                              <MdLink />
                              <Text>View Project</Text>
                            </HStack>
                          </Link>
                        )}
                      </>
                    )}
                  </VStack>
                </Card>
              );
            })}
          </VStack>
        </Card>
        {isEditMode && (
          <Flex justify="flex-end" pt={4}>
            <Button
              colorScheme="brand"
              onClick={() => handleUpdate('Projects')}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Update Projects
            </Button>
          </Flex>
        )}
      </VStack>
    );
  };

  const renderCertifications = () => {
    const certsData = isEditMode ? formData.certifications : certifications?.data;
    const count = isEditMode ? formData.certifications?.length : certifications?.count;
    
    if (!certsData || certsData.length === 0) {
      return <Text color="gray.500">No certifications data available.</Text>;
    }

    return (
      <VStack align="stretch" spacing={4}>
        <Card bg={cardBg} p={6}>
          <HStack spacing={2} mb={4}>
            <MdCardMembership size={24} color="brand.500" />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Certifications ({count || certsData.length})
            </Text>
          </HStack>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color={textColor}>Certificate Name</Th>
                  <Th borderColor={borderColor} color={textColor}>Institution</Th>
                  <Th borderColor={borderColor} color={textColor}>Certificate No.</Th>
                  <Th borderColor={borderColor} color={textColor}>From</Th>
                  <Th borderColor={borderColor} color={textColor}>Till</Th>
                </Tr>
              </Thead>
              <Tbody>
                {certsData.map((cert, index) => (
                  <Tr key={cert.certificate_id || index} _hover={{ bg: hoverBg }}>
                    {isEditMode ? (
                      <>
                        <Td borderColor={borderColor}>
                          <Input
                            value={cert.name || ''}
                            onChange={(e) => updateNestedFormData('certifications', index, 'name', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            size="sm"
                          />
                        </Td>
                        <Td borderColor={borderColor}>
                          <Input
                            value={cert.institutename || ''}
                            onChange={(e) => updateNestedFormData('certifications', index, 'institutename', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            size="sm"
                          />
                        </Td>
                        <Td borderColor={borderColor}>
                          <Input
                            value={cert.certificate_no || ''}
                            onChange={(e) => updateNestedFormData('certifications', index, 'certificate_no', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            size="sm"
                          />
                        </Td>
                        <Td borderColor={borderColor}>
                          <Input
                            value={cert.from_date || ''}
                            onChange={(e) => updateNestedFormData('certifications', index, 'from_date', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            size="sm"
                          />
                        </Td>
                        <Td borderColor={borderColor}>
                          <Input
                            value={cert.till_date === '0' ? '' : cert.till_date || ''}
                            onChange={(e) => updateNestedFormData('certifications', index, 'till_date', e.target.value)}
                            fontSize="sm"
                            borderColor={borderColor}
                            size="sm"
                            placeholder="Present"
                          />
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td borderColor={borderColor} color={textColor}>{cert.name || '--'}</Td>
                        <Td borderColor={borderColor} color={textColor}>{cert.institutename || '--'}</Td>
                        <Td borderColor={borderColor} color={textColor}>{cert.certificate_no || '--'}</Td>
                        <Td borderColor={borderColor} color={textColor}>{cert.from_date || '--'}</Td>
                        <Td borderColor={borderColor} color={textColor}>{cert.till_date === '0' ? 'Present' : cert.till_date || '--'}</Td>
                      </>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Card>
        {isEditMode && (
          <Flex justify="flex-end" pt={4}>
            <Button
              colorScheme="brand"
              onClick={() => handleUpdate('Certifications')}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Update Certifications
            </Button>
          </Flex>
        )}
      </VStack>
    );
  };

  const renderEducation = () => {
    const graduation = isEditMode ? graduationList : education?.graduation || [];
    const postGraduation = isEditMode ? postGraduationList : education?.postGraduation || [];
    
    if (!isEditMode && graduation.length === 0 && postGraduation.length === 0) {
      return <Text color="gray.500">No education data available.</Text>;
    }

    const renderGraduationEntry = (element, i) => {
      return (
        <Card key={i} bg={hoverBg} p={4} border="1px solid" borderColor={borderColor} mb={4}>
          <VStack align="stretch" spacing={4}>
            {/* Degree and University Name Row */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  Bachelor's degree <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Select
                  value={element.degree || ''}
                  onChange={(e) => handleGraduationChange(i, 'degree', e.target.value)}
                  fontSize="sm"
                  borderColor={borderColor}
                  placeholder="Select Bachelor's degree"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                >
                  <option value="">Select Bachelor's degree</option>
                  {graduationDegreeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                {educationValidated && (!element.degree || element.degree === '') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select a bachelor's degree.
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  University Name <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Input
                  type="text"
                  value={element.university_name || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      handleGraduationChange(i, 'university_name', value);
                    }
                  }}
                  fontSize="sm"
                  borderColor={borderColor}
                  maxLength={50}
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                />
                {educationValidated && (!element.university_name || element.university_name.trim() === '') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please provide a valid university name.
                  </Text>
                )}
              </FormControl>
            </Grid>

            {/* Year of Graduation and Education Type Row */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  Year of Graduation <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <HStack spacing={2}>
                  <Select
                    value={element.month || ''}
                    onChange={(e) => handleGraduationChange(i, 'month', e.target.value)}
                    fontSize="sm"
                    borderColor={borderColor}
                    placeholder="From"
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                  >
                    <option value="">From</option>
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                  <Select
                    value={element.year || ''}
                    onChange={(e) => handleGraduationChange(i, 'year', e.target.value)}
                    fontSize="sm"
                    borderColor={borderColor}
                    placeholder="Till"
                    isDisabled={!element.month}
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                  >
                    <option value="">Till</option>
                    <option value="0">Pursuing</option>
                    {element.month && getTillYearOptions(element.month).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </HStack>
                {educationValidated && ((!element.month || element.month === '') || (!element.year || element.year === '')) && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select both from and till years.
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  Education Type <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Select
                  value={element.education_type || ''}
                  onChange={(e) => handleGraduationChange(i, 'education_type', e.target.value)}
                  fontSize="sm"
                  borderColor={borderColor}
                  placeholder="Select Education Type"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                >
                  <option value="">Select Education Type</option>
                  {educationTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                {educationValidated && (!element.education_type || element.education_type === '') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select an education type.
                  </Text>
                )}
              </FormControl>
            </Grid>

            {/* Add/Remove Buttons */}
            <HStack spacing={2} justify="flex-start">
              {graduationList.length !== 1 && (
                <IconButton
                  icon={<MdDelete />}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleRemoveGraduation(i, element.id)}
                  aria-label="Remove graduation"
                />
              )}
              {graduationList.length - 1 === i && (
                <IconButton
                  icon={<MdAdd />}
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                  onClick={handleAddGraduation}
                  aria-label="Add graduation"
                />
              )}
            </HStack>
          </VStack>
        </Card>
      );
    };

    const renderPostGraduationEntry = (element, i) => {
      return (
        <Card key={i} bg={hoverBg} p={4} border="1px solid" borderColor={borderColor} mb={4}>
          <VStack align="stretch" spacing={4}>
            {/* Degree and University Name Row */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  Master's degree
                </FormLabel>
                <Select
                  value={element.degree || ''}
                  onChange={(e) => handlePostGraduationChange(i, 'degree', e.target.value)}
                  fontSize="sm"
                  borderColor={borderColor}
                  placeholder="Select Master's degree"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                >
                  <option value="">Select Master's degree</option>
                  {postGraduationDegreeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                {educationValidated && hasAnyPostGraduationData() && (!element.degree || element.degree === '') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select a master's degree.
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  University Name
                </FormLabel>
                <Input
                  type="text"
                  value={element.university_name || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      handlePostGraduationChange(i, 'university_name', value);
                    }
                  }}
                  fontSize="sm"
                  borderColor={borderColor}
                  maxLength={50}
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                />
                {educationValidated && hasAnyPostGraduationData() && (!element.university_name || element.university_name.trim() === '') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please provide a valid university name.
                  </Text>
                )}
              </FormControl>
            </Grid>

            {/* Year of Graduation and Education Type Row */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  Year of Graduation
                </FormLabel>
                <HStack spacing={2}>
                  <Select
                    value={element.month || ''}
                    onChange={(e) => handlePostGraduationChange(i, 'month', e.target.value)}
                    fontSize="sm"
                    borderColor={borderColor}
                    placeholder="From"
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                  >
                    <option value="">From</option>
                    {getPostGraduationFromYearOptions().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                  <Select
                    value={element.year || ''}
                    onChange={(e) => handlePostGraduationChange(i, 'year', e.target.value)}
                    fontSize="sm"
                    borderColor={borderColor}
                    placeholder="Till"
                    isDisabled={!element.month}
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                  >
                    <option value="">Till</option>
                    <option value="0">Pursuing</option>
                    {element.month && getTillYearOptions(element.month).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </HStack>
                {educationValidated && hasAnyPostGraduationData() && ((!element.month || element.month === '') || (!element.year || element.year === '')) && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select both from and till years.
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                  Education Type
                </FormLabel>
                <Select
                  value={element.education_type || ''}
                  onChange={(e) => handlePostGraduationChange(i, 'education_type', e.target.value)}
                  fontSize="sm"
                  borderColor={borderColor}
                  placeholder="Select Education Type"
                  _hover={{ borderColor: 'brand.500' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                >
                  <option value="">Select Education Type</option>
                  {educationTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                {educationValidated && hasAnyPostGraduationData() && (!element.education_type || element.education_type === '') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select an education type.
                  </Text>
                )}
              </FormControl>
            </Grid>

            {/* Add/Remove Buttons */}
            <HStack spacing={2} justify="flex-start">
              {postGraduationList.length !== 1 && (
                <IconButton
                  icon={<MdDelete />}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleRemovePostGraduation(i, element.id)}
                  aria-label="Remove post graduation"
                />
              )}
              {postGraduationList.length - 1 === i && (
                <IconButton
                  icon={<MdAdd />}
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                  onClick={handleAddPostGraduation}
                  aria-label="Add post graduation"
                />
              )}
            </HStack>
          </VStack>
        </Card>
      );
    };

    return (
      <VStack align="stretch" spacing={6}>
        <Card bg={cardBg} p={6}>
          <HStack spacing={2} mb={4}>
            <MdSchool size={24} color="brand.500" />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Graduation
            </Text>
          </HStack>

          {isEditMode ? (
            <VStack align="stretch" spacing={4}>
              {graduationList.map((element, i) => renderGraduationEntry(element, i))}
            </VStack>
          ) : (
            graduation.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor} color={textColor}>Degree</Th>
                      <Th borderColor={borderColor} color={textColor}>University</Th>
                      <Th borderColor={borderColor} color={textColor}>Education Type</Th>
                      <Th borderColor={borderColor} color={textColor}>Year</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {graduation.map((edu, index) => (
                      <Tr key={edu.id || index} _hover={{ bg: hoverBg }}>
                        <Td borderColor={borderColor} color={textColor}>
                          {graduationDegreeOptions.find(opt => opt.value === edu.degree)?.label || edu.degree || '--'}
                        </Td>
                        <Td borderColor={borderColor} color={textColor}>{edu.university_name || '--'}</Td>
                        <Td borderColor={borderColor} color={textColor}>
                          {educationTypeOptions.find(opt => opt.value === edu.education_type)?.label || edu.education_type || '--'}
                        </Td>
                        <Td borderColor={borderColor} color={textColor}>
                          {edu.year === '0' ? 'Pursuing' : (edu.month && edu.year ? `${edu.month} - ${edu.year}` : '--')}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text color="gray.500">No graduation data available.</Text>
            )
          )}
        </Card>

        <Card bg={cardBg} p={6}>
          <HStack spacing={2} mb={4}>
            <MdSchool size={24} color="brand.500" />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Post Graduate (Optional)
            </Text>
          </HStack>

          {isEditMode ? (
            <VStack align="stretch" spacing={4}>
              {postGraduationList.map((element, i) => renderPostGraduationEntry(element, i))}
            </VStack>
          ) : (
            postGraduation.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor} color={textColor}>Degree</Th>
                      <Th borderColor={borderColor} color={textColor}>University</Th>
                      <Th borderColor={borderColor} color={textColor}>Education Type</Th>
                      <Th borderColor={borderColor} color={textColor}>Year</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {postGraduation.map((edu, index) => (
                      <Tr key={edu.id || index} _hover={{ bg: hoverBg }}>
                        <Td borderColor={borderColor} color={textColor}>
                          {postGraduationDegreeOptions.find(opt => opt.value === edu.degree)?.label || edu.degree || '--'}
                        </Td>
                        <Td borderColor={borderColor} color={textColor}>{edu.university_name || '--'}</Td>
                        <Td borderColor={borderColor} color={textColor}>
                          {educationTypeOptions.find(opt => opt.value === edu.education_type)?.label || edu.education_type || '--'}
                        </Td>
                        <Td borderColor={borderColor} color={textColor}>
                          {edu.year === '0' ? 'Pursuing' : (edu.month && edu.year ? `${edu.month} - ${edu.year}` : '--')}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text color="gray.500">No post graduation data available.</Text>
            )
          )}
        </Card>

        {isEditMode && (
          <Flex justify="flex-end" pt={4}>
            <Button
              colorScheme="brand"
              onClick={() => handleUpdate('Education')}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Update Education
            </Button>
          </Flex>
        )}
      </VStack>
    );
  };

  return (
    <Tabs index={tabIndex} onChange={onTabChange} colorScheme="brand" variant="enclosed">
      <TabList>
        <Tab>
          <HStack spacing={2}>
            <MdPerson />
            <Text>Primary Introduction</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdWork />
            <Text>Professional Experience</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdFolder />
            <Text>Projects</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdCardMembership />
            <Text>Certifications</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdSchool />
            <Text>Education</Text>
          </HStack>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0} pt={4}>
          {renderPrimaryIntroduction()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderProfessionalExperience()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderProjects()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderCertifications()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderEducation()}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default FreelancerList;



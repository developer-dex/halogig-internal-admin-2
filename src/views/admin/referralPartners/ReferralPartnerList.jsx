import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
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
  useColorModeValue,
  Tooltip,
  HStack,
  Card,
  Select,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import {
  MdVisibility,
  MdChevronLeft,
  MdChevronRight,
  MdEmail,
  MdEdit,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { statusChange } from '../../../features/admin/clientManagementSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import { referralPartnerData } from '../../../features/admin/referralPartnerManagementSlice';
import { postApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { UserStatus } from 'utils/enums';

const STATUS_FILTER_OPTIONS = [
  { label: 'Pending For Registration', value: 'incomplete' },
  { label: 'Pending For Approval', value: 'pending' },
  { label: 'On-Hold', value: 'onhold' },
];

function ReferralPartnerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const statusModal = useDisclosure();
  const emailModal = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusFilterValue, setStatusFilterValue] = useState('');

  const statusFilter = statusFilterValue || null;
  const excludeStatusFilter = statusFilterValue ? null : UserStatus.APPROVED;

  const { isLoading, responseData } = useSelector((s) => s.referralPartnerDataReducer || {});

  const rows = useMemo(() => {
    const list = responseData?.referral_partners;
    const arr = Array.isArray(list) ? list : [];
    const total = typeof responseData?.total_count === 'number' ? responseData.total_count : arr.length;
    setTotalCount(total);
    return arr;
  }, [responseData]);

  useEffect(() => {
    dispatch(referralPartnerData({
      page,
      pageLimit,
      status: statusFilter,
      excludeStatus: excludeStatusFilter,
    }));
  }, [dispatch, page, pageLimit, statusFilter, excludeStatusFilter]);

  const openDetails = (userId) => {
    navigate(`/admin/freelancer/${userId}`, { state: { from: location.pathname } });
  };

  const openEditDetails = (userId) => {
    navigate(`/admin/freelancer/${userId}?edit=1`, { state: { from: location.pathname } });
  };

  const openStatus = (user) => {
    setSelectedUser(user);
    setSelectedStatus(user?.status || 'Pending');
    statusModal.onOpen();
  };

  const closeStatus = () => {
    statusModal.onClose();
    setSelectedUser(null);
    setSelectedStatus('');
  };

  const applyStatusChange = async () => {
    if (!selectedUser) return;
    try {
      await dispatch(statusChange({ id: selectedUser.id, apiData: { status: selectedStatus } }));
      showSuccess('Status updated successfully');
      dispatch(referralPartnerData({
        page,
        pageLimit,
        status: statusFilter,
        excludeStatus: excludeStatusFilter,
      }));
    } catch (e) {
      showError('Failed to update status');
    } finally {
      closeStatus();
    }
  };

  const openEmailModal = (user) => {
    setSelectedUser(user);
    emailModal.onOpen();
  };

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const getStatusColorScheme = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case UserStatus.INCOMPLETE:
      case UserStatus.APPROVED:
      case UserStatus.PENDING:
      case 'rejected':
      case 'complete':
      case 'completed':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review', 'Suspended'];
  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={3} mb="10px" flexWrap="wrap">
            <Text color={textColor} fontSize="l" fontWeight="700" mb="0">
              Referral Partners
            </Text>
            <HStack spacing="10px" align="center">
              <Text color="black" fontSize="sm" fontWeight="600" whiteSpace="nowrap">
                Status:
              </Text>
              <Select
                size="sm"
                w={{ base: '220px', md: '260px' }}
                value={statusFilterValue}
                onChange={(e) => {
                  setStatusFilterValue(e.target.value);
                  setPage(1);
                }}
                borderColor={borderColor}
                _hover={{ borderColor: 'brand.500' }}
              >
                <option value="">All</option>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>

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
                <Table variant="simple" color="gray.500" minW="960px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        First Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Last Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Email
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Company
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
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={8} textAlign="center" py="40px">
                          <Text color="black">No referral partners found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((row, index) => {
                        const locationStr = [row.city, row.country].filter(Boolean).join(' - ') || '--';
                        const lastLoginDate = row.client_last_login || row.freelancer_last_login || row.last_login;
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
                        const statusColors = getStatusColorScheme(row.status);
                        const isOddRow = index % 2 === 0;
                        return (
                          <Tr key={row.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{row.first_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{row.last_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{row.email || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{row.company_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{locationStr}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{lastLogin}</Text>
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
                                onClick={() => openStatus(row)}
                              >
                                {row.status || 'Pending'}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <HStack spacing={2} justify="center">
                                <Tooltip label="View details">
                                  <IconButton
                                    aria-label="View"
                                    icon={<MdVisibility />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openDetails(row.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Edit">
                                  <IconButton
                                    aria-label="Edit"
                                    icon={<MdEdit />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openEditDetails(row.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Send email">
                                  <IconButton
                                    aria-label="Send email"
                                    icon={<MdEmail />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openEmailModal(row)}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

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

      <SendReferralPartnerEmailModal
        isOpen={emailModal.isOpen}
        onClose={() => {
          emailModal.onClose();
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Box>
  );
}

function SendReferralPartnerEmailModal({ isOpen, onClose, user }) {
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [isEmailSending, setIsEmailSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailForm({ subject: '', message: '' });
      setIsEmailSending(false);
    }
  }, [isOpen, user?.id]);

  const handleSendEmail = async () => {
    if (!user) return;
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
      const response = await postApi(
        `${apiEndPoints.SEND_EMAIL_TO_FREELANCER}/${user.id}/send-email`,
        { subject: trimmedSubject, message: trimmedMessage },
      );
      if (response?.data?.success) {
        showSuccess('Email sent successfully');
        onClose();
      } else {
        showError(response?.data?.message || 'Failed to send email');
      }
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send Email to Referral Partner</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="500">Subject</FormLabel>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="500">Message</FormLabel>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Enter email message"
                rows={6}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="brand" onClick={handleSendEmail} isLoading={isEmailSending}>Send</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ReferralPartnerList;

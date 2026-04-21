import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Table,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Text,
  Card,
  Select,
  useColorModeValue,
  HStack,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getApi, patchApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';

const DISPUTE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'closed', label: 'Closed' },
  { value: 'resolved', label: 'Resolved' },
];

function normalizeDisputeStatus(s) {
  return String(s || 'pending').trim().toLowerCase().replace(/\s+/g, '_');
}

function formatStatusLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatUserName(user) {
  if (!user) return '--';
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : user.email || '--';
}

function DisputesList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const statusModal = useDisclosure();
  const actionModal = useDisclosure();
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [initialStatusWhenOpened, setInitialStatusWhenOpened] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const [actionTabIndex, setActionTabIndex] = useState(0);
  const [refundForm, setRefundForm] = useState({
    amount: '',
    charge: '',
    ticketNumber: '',
  });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const rows = useMemo(() => {
    const list = responseData?.disputes;
    return Array.isArray(list) ? list : [];
  }, [responseData]);

  const totalCount = useMemo(() => {
    if (typeof responseData?.total_count === 'number') return responseData.total_count;
    return rows.length;
  }, [responseData, rows.length]);

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const modalStatusOptions = useMemo(() => {
    const base = [...DISPUTE_STATUS_OPTIONS];
    if (initialStatusWhenOpened && !base.some((o) => o.value === initialStatusWhenOpened)) {
      return [
        { value: initialStatusWhenOpened, label: formatStatusLabel(initialStatusWhenOpened) },
        ...base,
      ];
    }
    return base;
  }, [initialStatusWhenOpened]);

  const isStatusSubmitDisabled = useMemo(() => {
    const a = normalizeDisputeStatus(selectedStatus);
    const b = normalizeDisputeStatus(initialStatusWhenOpened);
    return a === b;
  }, [selectedStatus, initialStatusWhenOpened]);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const url = `${apiEndPoints.GET_ALL_ADMIN_DISPUTES}?page=${page}&limit=${pageLimit}`;
      const resp = await getApi(url);
      if (resp?.data?.success && resp?.data?.data) {
        setResponseData(resp.data.data);
      } else {
        setResponseData({ total_count: 0, disputes: [] });
      }
    } catch (e) {
      setResponseData({ total_count: 0, disputes: [] });
      showError(e?.response?.data?.message || 'Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageLimit]);

  const formatDateTime = (value) => {
    if (!value) return '--';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return '--';
    }
  };

  const truncate = (str, max = 80) => {
    if (!str) return '--';
    const s = String(str);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  };

  const getStatusColorScheme = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'resolved':
      case 'closed':
      case 'pending':
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  const openStatus = (row) => {
    const norm = normalizeDisputeStatus(row?.status);
    setSelectedDispute(row);
    setInitialStatusWhenOpened(norm);
    setSelectedStatus(norm);
    statusModal.onOpen();
  };

  const closeStatus = () => {
    statusModal.onClose();
    setSelectedDispute(null);
    setInitialStatusWhenOpened('');
    setSelectedStatus('');
  };

  const applyStatusChange = async () => {
    if (!selectedDispute?.id || isStatusSubmitDisabled) return;
    setIsSubmittingStatus(true);
    try {
      await patchApi(
        `${apiEndPoints.UPDATE_ADMIN_DISPUTE_STATUS}/${selectedDispute.id}/status`,
        { status: selectedStatus },
      );
      showSuccess('Dispute status updated successfully');
      await fetchList();
      closeStatus();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to update dispute status');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const openAction = (row) => {
    setSelectedDispute(row);
    setActionTabIndex(0);
    setRefundForm({
      amount: row?.project_bid?.bid_amount ? String(row.project_bid.bid_amount) : '',
      charge: '',
      ticketNumber: '',
    });
    actionModal.onOpen();
  };

  const closeAction = () => {
    actionModal.onClose();
    setActionTabIndex(0);
    setRefundForm({ amount: '', charge: '', ticketNumber: '' });
  };

  const applyRefundProcess = async () => {
    if (!selectedDispute?.id) return;
    const amount = String(refundForm.amount || '').trim();
    const ticketNumber = String(refundForm.ticketNumber || '').trim();
    if (!amount) {
      showError('Amount is required');
      return;
    }
    if (!ticketNumber) {
      showError('Ticket number is required');
      return;
    }

    setIsSubmittingAction(true);
    try {
      // Frontend-only for now; backend will be wired next.
      showSuccess('Refund process saved (frontend only)');
      closeAction();
    } catch (e) {
      showError('Failed to save refund process');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const goToFreelancerChange = () => {
    if (!selectedDispute) return;
    const projectId = selectedDispute?.project_id ?? selectedDispute?.projectId;
    if (!projectId) {
      showError('Project ID not found for this dispute');
      return;
    }

    setIsSubmittingAction(true);
    getApi(`${apiEndPoints.GET_PROJECT_PREFILL}/${projectId}/prefill`)
      .then((resp) => {
        const project = resp?.data?.data;
        const clientId = project?.User?.id || project?.posted_by_user_id || null;
        const target = clientId ? `/admin/create-client-project?client_id=${clientId}` : '/admin/create-client-project';
        navigate(target, {
          state: {
            disputePrefill: selectedDispute,
            projectPrefill: project,
            source: 'disputes-action',
          },
        });
        closeAction();
      })
      .catch((e) => {
        showError(e?.response?.data?.message || 'Failed to fetch project prefill data');
      })
      .finally(() => {
        setIsSubmittingAction(false);
      });
  };

  const applySettlement = async () => {
    if (!selectedDispute?.id) return;
    setIsSubmittingAction(true);
    try {
      // Frontend-only for now; backend will be wired next.
      showSuccess('Settlement submitted (frontend only)');
      closeAction();
    } catch (e) {
      showError('Failed to submit settlement');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text color={textColor} fontSize="l" fontWeight="700" mb="10px">
            Disputes
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
                <Table variant="simple" color="gray.500" minW="1250px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        ID
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Type
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Project
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Raised by
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Raised against
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Bid
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Message
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Raised on
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Status
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={10} textAlign="center" py="40px">
                          <Text color="black">No disputes found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((row, index) => {
                        const isOddRow = index % 2 === 0;
                        const msg = row.message || '';
                        const statusColors = getStatusColorScheme(row.status);
                        const statusDisplay = formatStatusLabel(normalizeDisputeStatus(row.status));
                        return (
                          <Tr
                            key={row.id}
                            bg={isOddRow ? '#F4F7FE' : 'transparent'}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {row.id}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal" textTransform="capitalize">
                                {row.type ? String(row.type).replace(/_/g, ' ') : '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                              <Tooltip label={row.project?.project_title || ''} hasArrow placement="top">
                                <Text color={textColor} fontSize="sm" fontWeight="normal" noOfLines={2}>
                                  {row.project?.project_title || '--'}
                                </Text>
                              </Tooltip>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatUserName(row.disputed_by)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatUserName(row.disputed_for)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {row.project_bid?.id ?? row.project_bid_id ?? '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px" maxW="220px">
                              <Tooltip label={msg || '—'} hasArrow placement="top">
                                <Text color={textColor} fontSize="sm" fontWeight="normal" noOfLines={2}>
                                  {truncate(msg, 100)}
                                </Text>
                              </Tooltip>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px" whiteSpace="nowrap">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatDateTime(row.raised_on)}
                              </Text>
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
                                {statusDisplay}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Button
                                size="sm"
                                colorScheme="brand"
                                variant="outline"
                                onClick={() => openAction(row)}
                              >
                                Action
                              </Button>
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
                  <Button
                    aria-label="Previous page"
                    leftIcon={<MdChevronLeft />}
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    isDisabled={page === 1}
                    variant="outline"
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={page === p ? 'solid' : 'outline'}
                        colorScheme={page === p ? 'brand' : 'gray'}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  <Button
                    aria-label="Next page"
                    rightIcon={<MdChevronRight />}
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    isDisabled={page === totalPages}
                    variant="outline"
                  />
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
            {modalStatusOptions.map((opt) => (
              <Box key={opt.value} mb="12px">
                <HStack>
                  <input
                    type="checkbox"
                    checked={normalizeDisputeStatus(selectedStatus) === opt.value}
                    onChange={() => setSelectedStatus(opt.value)}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text fontSize="sm" fontWeight="500">{opt.label}</Text>
                </HStack>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeStatus}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={applyStatusChange}
              isDisabled={isStatusSubmitDisabled || isSubmittingStatus}
              isLoading={isSubmittingStatus}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={actionModal.isOpen} onClose={closeAction} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dispute Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs index={actionTabIndex} onChange={setActionTabIndex} variant="enclosed" colorScheme="brand">
              <TabList>
                <Tab>Refund Process</Tab>
                <Tab>Freelancer Change with Halogig Model</Tab>
                <Tab>Setelment Process</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="14px">
                    <FormControl>
                      <FormLabel>Amount</FormLabel>
                      <Input
                        value={refundForm.amount}
                        onChange={(e) => setRefundForm((p) => ({ ...p, amount: e.target.value }))}
                        placeholder="Enter amount"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Charge</FormLabel>
                      <Input
                        value={refundForm.charge}
                        onChange={(e) => setRefundForm((p) => ({ ...p, charge: e.target.value }))}
                        placeholder="Enter charge"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Ticket number</FormLabel>
                      <Input
                        value={refundForm.ticketNumber}
                        onChange={(e) => setRefundForm((p) => ({ ...p, ticketNumber: e.target.value }))}
                        placeholder="Enter ticket number"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Current date</FormLabel>
                      <Input value={new Date().toLocaleString()} isReadOnly />
                    </FormControl>
                  </SimpleGrid>

                  <Divider my="14px" />

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="14px">
                    <FormControl>
                      <FormLabel>Dispute By - email</FormLabel>
                      <Input value={selectedDispute?.disputed_by?.email || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dispute For - email</FormLabel>
                      <Input value={selectedDispute?.disputed_for?.email || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dispute By - first name</FormLabel>
                      <Input value={selectedDispute?.disputed_by?.first_name || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dispute For - first name</FormLabel>
                      <Input value={selectedDispute?.disputed_for?.first_name || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dispute By - last name</FormLabel>
                      <Input value={selectedDispute?.disputed_by?.last_name || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dispute For - last name</FormLabel>
                      <Input value={selectedDispute?.disputed_for?.last_name || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Project title</FormLabel>
                      <Input value={selectedDispute?.project?.project_title || '--'} isReadOnly />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Dispute raised on date</FormLabel>
                      <Input value={formatDateTime(selectedDispute?.raised_on)} isReadOnly />
                    </FormControl>
                  </SimpleGrid>
                </TabPanel>

                <TabPanel px={0}>
                  <Text fontSize="sm" color="gray.600" mb="10px">
                    Create a new client project for the freelancer change flow. You’ll be redirected and the page can use the dispute details to prefill the form.
                  </Text>
                  <Button colorScheme="brand" onClick={goToFreelancerChange}>
                    Create Client Project
                  </Button>
                </TabPanel>

                <TabPanel px={0}>
                  <Text fontSize="md" fontWeight="600" mb="10px">
                    Are you sure everything will shortout from freelancer and client ?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    This will mark the settlement flow as submitted for this dispute (frontend only for now).
                  </Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeAction}>
              Cancel
            </Button>
            {actionTabIndex === 0 ? (
              <Button colorScheme="brand" onClick={applyRefundProcess} isLoading={isSubmittingAction}>
                Submit
              </Button>
            ) : null}
            {actionTabIndex === 2 ? (
              <Button colorScheme="brand" onClick={applySettlement} isLoading={isSubmittingAction}>
                Submit
              </Button>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default DisputesList;

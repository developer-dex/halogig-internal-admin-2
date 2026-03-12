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
  Tooltip,
  HStack,
  Card,
  Select,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Badge,
  Link,
} from '@chakra-ui/react';
import { MdVisibility, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getApi, patchApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';

function SalesReferralLeadList() {
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailsModal = useDisclosure();
  const statusModal = useDisclosure();
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const statusOptions = ['Pending', 'Approved', 'Rejected'];

  const rows = useMemo(() => {
    const list = responseData?.leads;
    return Array.isArray(list) ? list : [];
  }, [responseData]);

  const totalCount = useMemo(() => {
    if (typeof responseData?.total_count === 'number') return responseData.total_count;
    return rows.length;
  }, [responseData, rows.length]);

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  // Chakra color mode values (match FreelancerList table look)
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const modalBg = useColorModeValue('white', 'gray.900');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const valueColor = useColorModeValue('gray.900', 'white');
  const subtleBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const requirementBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const url = `${apiEndPoints.GET_ADMIN_SALES_REFERRAL_LEADS}?page=${page}&limit=${pageLimit}`;
      const resp = await getApi(url);
      // `getApi` returns an axios response object. API payload is in `resp.data`.
      if (resp?.data?.success && resp?.data?.data) {
        setResponseData(resp.data.data);
      } else {
        setResponseData({ total_count: 0, leads: [] });
      }
    } catch (e) {
      setResponseData({ total_count: 0, leads: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageLimit]);

  const openDetails = async (lead) => {
    setSelectedLead(lead);
    setLeadDetail(null);
    setDetailLoading(true);
    detailsModal.onOpen();
    try {
      const resp = await getApi(`${apiEndPoints.GET_ADMIN_SALES_REFERRAL_LEAD_DETAIL}/${lead.id}`);
      if (resp?.data?.success) {
        setLeadDetail(resp.data.data);
      } else {
        setLeadDetail(null);
      }
    } catch (e) {
      setLeadDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    detailsModal.onClose();
    setSelectedLead(null);
    setLeadDetail(null);
    setDetailLoading(false);
  };

  const formatDateTime = (value) => {
    if (!value) return '--';
    try {
      const d = new Date(value);
      return d.toLocaleString();
    } catch (e) {
      return '--';
    }
  };

  const getStatusBadge = (statusRaw) => {
    const status = String(statusRaw || 'pending').toLowerCase();
    if (status === 'approved') return { colorScheme: 'green', label: 'Approved' };
    if (status === 'rejected') return { colorScheme: 'red', label: 'Rejected' };
    if (status === 'pending') return { colorScheme: 'yellow', label: 'Pending' };
    return { colorScheme: 'gray', label: statusRaw || 'Pending' };
  };

  const getStatusColorScheme = (statusRaw) => {
    const statusLower = String(statusRaw || 'pending').toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'approved':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'rejected':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  const openStatus = (lead) => {
    setSelectedLeadForStatus(lead);
    setSelectedStatus(lead?.status ? String(lead.status).toLowerCase() : 'pending');
    statusModal.onOpen();
  };

  const closeStatus = () => {
    statusModal.onClose();
    setSelectedLeadForStatus(null);
    setSelectedStatus('');
  };

  const applyStatusChange = async () => {
    if (!selectedLeadForStatus?.id || !selectedStatus) return;
    try {
      const endpoint = `${apiEndPoints.UPDATE_ADMIN_SALES_REFERRAL_LEAD_STATUS}/${selectedLeadForStatus.id}/status`;
      await patchApi(endpoint, { status: selectedStatus });
      await fetchList();
    } finally {
      closeStatus();
    }
  };

  const getCommissionLabel = (typeRaw) => {
    const type = String(typeRaw || '').trim();
    if (type === '1') return 'Percentage';
    if (type === '2') return 'Fixed';
    return type || '--';
  };

  const DetailField = ({ label, value, isLink }) => (
    <Box>
      <Text fontSize="sm" color={labelColor} fontWeight="700">
        {label}
      </Text>
      {isLink && value && value !== '--' ? (
        <Link
          href={value}
          isExternal
          color="brand.500"
          fontSize="sm"
          fontWeight="600"
          textDecoration="underline"
          wordBreak="break-word"
        >
          {value}
        </Link>
      ) : (
        <Text fontSize="sm" color={valueColor} fontWeight="500" wordBreak="break-word">
          {value || '--'}
        </Text>
      )}
    </Box>
  );

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text color={textColor} fontSize="l" fontWeight="700" mb="10px">
            Sales Referral Leads
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
                        Company Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Contact Person
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Industry
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        Status
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Created At
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        View
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py="40px">
                          <Text color="black">No leads found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((lead, index) => {
                        const isOddRow = index % 2 === 0;
                        return (
                          <Tr
                            key={lead.id}
                            bg={isOddRow ? '#F4F7FE' : 'transparent'}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{lead.company_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{lead.contact_person || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{lead.industry?.industry || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Button
                                size="sm"
                                bg={getStatusColorScheme(lead.status).bg}
                                color={getStatusColorScheme(lead.status).color}
                                borderColor={getStatusColorScheme(lead.status).border}
                                borderWidth="2px"
                                borderRadius="full"
                                fontWeight="normal"
                                fontSize="xs"
                                textTransform="capitalize"
                                _hover={{ opacity: 0.8, transform: 'translateY(-2px)' }}
                                onClick={() => openStatus(lead)}
                              >
                                {lead.status || 'Pending'}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{formatDateTime(lead.created_at)}</Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <HStack spacing={2} justify="center">
                                <Tooltip label="View Lead Details">
                                  <IconButton
                                    aria-label="View lead"
                                    icon={<MdVisibility />}
                                    size="sm"
                                    variant="ghost"
                                    style={{ color: 'rgb(32, 33, 36)' }}
                                    onClick={() => openDetails(lead)}
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

              {/* Pagination (match FreelancerList style) */}
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
                  <IconButton
                    aria-label="Previous page"
                    icon={<MdChevronLeft />}
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
                  <IconButton
                    aria-label="Next page"
                    icon={<MdChevronRight />}
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

      {/* Details Modal */}
      <Modal isOpen={detailsModal.isOpen} onClose={closeDetails} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent bg={modalBg} borderRadius="14px" overflow="hidden">
          <ModalHeader>
            <Flex align="center" justify="space-between" gap="10px">
              <Box>
                <Text fontSize="lg" fontWeight="800" color={valueColor} lineHeight="1.2">
                  Sales Referral Lead
                </Text>
                <Text fontSize="sm" color={labelColor} mt="4px">
                  View complete lead information
                </Text>
              </Box>
              <Box />
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {detailLoading ? (
              <Flex justify="center" align="center" minH="200px">
                <Spinner />
              </Flex>
            ) : (
              <Box>
                <Box
                  border="1px solid"
                  borderColor={subtleBorder}
                  borderRadius="12px"
                  p={{ base: '12px', md: '14px' }}
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
                    <Box>
                      <Text fontSize="sm" color={labelColor} fontWeight="700">
                        Status
                      </Text>
                      <Badge
                        mt="6px"
                        px="10px"
                        py="4px"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme={getStatusBadge(leadDetail?.status || selectedLead?.status).colorScheme}
                        textTransform="capitalize"
                        fontWeight="700"
                        w="fit-content"
                      >
                        {getStatusBadge(leadDetail?.status || selectedLead?.status).label}
                      </Badge>
                    </Box>
                    <Box />
                    <DetailField
                      label="Company Name"
                      value={leadDetail?.company_name || selectedLead?.company_name || '--'}
                    />
                    <DetailField
                      label="Contact Person"
                      value={leadDetail?.contact_person || selectedLead?.contact_person || '--'}
                    />
                    <DetailField
                      label="Designation"
                      value={leadDetail?.designation || '--'}
                    />
                    <DetailField
                      label="Industry"
                      value={leadDetail?.industry?.industry || '--'}
                    />
                    <DetailField
                      label="Email Address"
                      value={leadDetail?.email_address || '--'}
                    />
                    <DetailField
                      label="Mobile No."
                      value={leadDetail?.mobile_number || '--'}
                    />
                    <DetailField
                      label="Country"
                      value={leadDetail?.country || '--'}
                    />
                    <DetailField
                      label="State"
                      value={leadDetail?.state || '--'}
                    />
                    <DetailField
                      label="City"
                      value={leadDetail?.city || '--'}
                    />
                    <DetailField
                      label="Website Address"
                      value={leadDetail?.website_address || '--'}
                      isLink
                    />
                    <DetailField
                      label="Commission Type"
                      value={getCommissionLabel(leadDetail?.commission_type)}
                    />
                    <DetailField
                      label="Expected Commission(%/USD)"
                      value={leadDetail?.expected_commission_value ?? '--'}
                    />
                    <DetailField
                      label="Created At"
                      value={formatDateTime(leadDetail?.created_at)}
                    />
                    <DetailField
                      label="Has Spoken To Customer"
                      value={typeof leadDetail?.has_spoken_to_customer === 'boolean'
                        ? (leadDetail.has_spoken_to_customer ? 'Yes' : 'No')
                        : '--'}
                    />
                  </SimpleGrid>
                </Box>

                <Box mt="14px">
                  <Text fontSize="sm" color={labelColor} fontWeight="700" mb="8px">
                    Requirement Details
                  </Text>
                  <Box
                    border="1px solid"
                    borderColor={subtleBorder}
                    borderRadius="12px"
                    p="12px"
                    bg={requirementBg}
                  >
                    <Text fontSize="sm" color={valueColor} whiteSpace="pre-wrap">
                      {leadDetail?.requirement_details || '--'}
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeDetails}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Status Change Modal (match FreelancerList behavior) */}
      <Modal isOpen={statusModal.isOpen} onClose={closeStatus} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {statusOptions.map((status) => {
              const normalized = status.toLowerCase();
              return (
                <Box key={status} mb="12px">
                  <HStack>
                    <input
                      type="checkbox"
                      checked={selectedStatus === normalized}
                      onChange={() => setSelectedStatus(normalized)}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text fontSize="sm" fontWeight="500">{status}</Text>
                  </HStack>
                </Box>
              );
            })}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeStatus}>Cancel</Button>
            <Button colorScheme="brand" onClick={applyStatusChange}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default SalesReferralLeadList;


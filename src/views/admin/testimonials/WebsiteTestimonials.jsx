import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getApi, patchApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';

const TESTIMONIAL_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function normalizeStatus(s) {
  return String(s || 'pending').trim().toLowerCase();
}

function formatDate(value) {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '--';
  }
}

export default function WebsiteTestimonials() {
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const statusModal = useDisclosure();
  const [selectedRow, setSelectedRow] = useState(null);
  const [initialStatusWhenOpened, setInitialStatusWhenOpened] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const totalPages = useMemo(() => Math.ceil(totalCount / pageLimit) || 1, [totalCount, pageLimit]);

  const isSubmitDisabled = useMemo(() => {
    const a = normalizeStatus(selectedStatus);
    const b = normalizeStatus(initialStatusWhenOpened);
    return a === b;
  }, [selectedStatus, initialStatusWhenOpened]);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const url = `${apiEndPoints.GET_ALL_TESTIMONIALS}?page=${page}&limit=${pageLimit}`;
      const resp = await getApi(url);
      const payload = resp?.data?.data;
      setRows(payload?.testimonials || []);
      setTotalCount(payload?.total_count || 0);
    } catch (e) {
      setRows([]);
      setTotalCount(0);
      showError(e?.response?.data?.message || 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageLimit]);

  const getStatusColorScheme = () => ({ bg: 'transparent', color: 'black', border: 'black.600' });

  const openStatus = (row) => {
    const norm = normalizeStatus(row?.status);
    setSelectedRow(row);
    setInitialStatusWhenOpened(norm);
    setSelectedStatus(norm);
    statusModal.onOpen();
  };

  const closeStatus = () => {
    statusModal.onClose();
    setSelectedRow(null);
    setInitialStatusWhenOpened('');
    setSelectedStatus('');
  };

  const applyStatusChange = async () => {
    if (!selectedRow?.id || isSubmitDisabled) return;
    setIsSubmittingStatus(true);
    try {
      await patchApi(
        `${apiEndPoints.UPDATE_TESTIMONIAL_STATUS}/${selectedRow.id}/status`,
        { status: selectedStatus },
      );
      showSuccess('Status updated successfully');
      await fetchList();
      closeStatus();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text color={textColor} fontSize="l" fontWeight="700" mb="10px">
            Website Testimonials
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
                <Table variant="simple" color="gray.500" minW="1050px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        ID
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Client Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Company
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Comment
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Created At
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Status
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py="40px">
                          <Text color="black">No testimonials found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((row, index) => {
                        const isOddRow = index % 2 === 0;
                        const statusColors = getStatusColorScheme(row.status);
                        return (
                          <Tr
                            key={row.id}
                            bg={isOddRow ? '#F4F7FE' : 'transparent'}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{row.id}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{row.client_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{row.client_company_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px" maxW="420px">
                              <Tooltip label={row.testimonial_comment || ''} hasArrow placement="top">
                                <Text color={textColor} fontSize="sm" fontWeight="normal" noOfLines={2}>
                                  {row.testimonial_comment || '--'}
                                </Text>
                              </Tooltip>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px" whiteSpace="nowrap">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{formatDate(row.created_at || row.createdAt)}</Text>
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
                                {normalizeStatus(row.status)}
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
            {TESTIMONIAL_STATUS_OPTIONS.map((opt) => (
              <Box key={opt.value} mb="12px">
                <HStack>
                  <input
                    type="checkbox"
                    checked={normalizeStatus(selectedStatus) === opt.value}
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
              isDisabled={isSubmitDisabled || isSubmittingStatus}
              isLoading={isSubmittingStatus}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


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
} from '@chakra-ui/react';
import { MdVisibility, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { statusChange } from '../../../features/admin/clientManagementSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import {
  freelancerData,
  freelancerCompleteData,
} from '../../../features/admin/freelancerManagementSlice';

function FreelancerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const detailsModal = useDisclosure();
  const statusModal = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review', 'Suspended'];

  const {
    isLoading,
    responseData,
    completeData,
    completeDataLoading,
  } = useSelector((s) => s.freelancerDataReducer || {});

  const rows = useMemo(() => {
    const list = responseData?.freelancers;
    const arr = Array.isArray(list) ? list : [];
    const total = typeof responseData?.total_count === 'number' ? responseData.total_count : arr.length;
    setTotalCount(total);
    return arr;
  }, [responseData]);

  useEffect(() => {
    dispatch(freelancerData({ page, pageLimit }));
  }, [dispatch, page, pageLimit]);

  const openDetails = (userId) => {
    setSelectedFreelancer(userId);
    detailsModal.onOpen();
    dispatch(freelancerCompleteData({ userId }));
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
      // refetch
      dispatch(freelancerData({ page, pageLimit }));
    } catch (e) {
      showError('Failed to update status');
    } finally {
      closeStatus();
    }
  };

  // Chakra color mode values (match ClientList look)
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#F4F7FE', 'black');
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
          <Text color={textColor} fontSize="2xl" fontWeight="700" mb="10px">
            Freelancers
          </Text>

          {isLoading && rows.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                maxH={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 130px)', xl: 'calc(100vh - 130px)' }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="800px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                        FIRST NAME
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                        LAST NAME
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                        EMAIL
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>
                        STATUS
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>
                        VIEW
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py="40px">
                          <Text color="black">No freelancers found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((fr) => {
                        const statusColors = getStatusColorScheme(fr.status);
                        return (
                          <Tr key={fr.id} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.first_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.last_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.email || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
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
                            <Td borderColor={borderColor} textAlign="center">
                              <Tooltip label="View Freelancer Details">
                                <IconButton
                                  aria-label="View freelancer"
                                  icon={<MdVisibility />}
                                  size="sm"
                                  variant="ghost"
                                  style={{color: 'rgb(32, 33, 36)'}}
                                  onClick={() => openDetails(fr.id)}
                                />
                              </Tooltip>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center"  pt="8px">
                <Text color="black" fontSize="sm">
                  Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
                </Text>

                <HStack spacing="8px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setPage((p)=> Math.max(1, p-1))} isDisabled={page === 1} variant="outline" />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((p) => (
                      <Button key={p} size="sm" variant={page === p ? 'solid' : 'outline'} colorScheme={page === p ? 'brand' : 'gray'} onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    ))}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setPage((p)=> p+1)} isDisabled={page === totalPages} variant="outline" />
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

      <Modal isOpen={detailsModal.isOpen} onClose={detailsModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Freelancer Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {completeDataLoading ? (
              <Flex py={10} align="center" justify="center" gap={3}>
                <Spinner />
                <Text>Loading details...</Text>
              </Flex>
            ) : !completeData ? (
              <Text>No details available</Text>
            ) : (
              <Box>
                <Text fontWeight="bold" mb={2}>{completeData?.user?.name || completeData?.user?.email}</Text>
                <Text>Email: {completeData?.user?.email}</Text>
                <Text>Country: {completeData?.user?.country || '-'}</Text>
                {/* Render more sections from completeData as needed */}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default FreelancerList;



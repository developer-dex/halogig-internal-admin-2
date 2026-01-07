import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  useColorModeValue,
  Spinner,
  HStack,
  Tooltip,
  Badge,
  Select,
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight, MdVisibility } from 'react-icons/md';
import { getAllProjectBids } from '../../../features/admin/projectBidsSlice';
import { useNavigate } from 'react-router-dom';

export default function ProjectDelivery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);

  const { isLoading, bids, totalCount } = useSelector((s) => s.projectBidsReducer || {});

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  useEffect(() => {
    dispatch(getAllProjectBids({ page: currentPage, pageLimit }));
  }, [dispatch, currentPage, pageLimit]);

  const rows = useMemo(() => Array.isArray(bids) ? bids : [], [bids]);
  const totalPages = Math.ceil((totalCount || 0) / pageLimit) || 1;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusText = (bid) => {
    return bid?.status || 'Pending';
  };

  const getStatusColors = (statusText) => {
    const s = (statusText || '').toLowerCase();
    if (s.includes('accept') || s.includes('accepted')) {
      return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
    if (s.includes('reject') || s.includes('rejected')) {
      return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
    if (s.includes('in_progress') || s.includes('in progress')) {
      return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
    if (s.includes('complete') || s.includes('completed')) {
      return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
    return { bg: 'transparent', color: 'black', border: 'black.600' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '--';
    }
  };

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text color={textColor} fontSize="l" fontWeight="700" mb="8px">
            Project Delivery
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
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Bid ID</Th>
                          <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Project</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Freelancer</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>Bid Amount</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>Submitted</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>Status</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>View</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py="40px">
                          <Text color="black">No bids found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((bid, index) => {
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;
                        const statusText = getStatusText(bid);
                        const statusColors = getStatusColors(statusText);
                        const freelancerName = `${bid?.freelancer?.first_name || ''} ${bid?.freelancer?.last_name || ''}`.trim() || '--';
                        
                        return (
                          <Tr key={bid.id || bid._id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                #{bid.id || bid._id || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {bid?.ClientProject?.project_title || bid?.Project?.project_title || bid?.project_title || '--'}
                              </Text>
                              <Text color="black" fontSize="xs" mt="4px">
                                {bid?.ClientProject?.Category?.name || bid?.Project?.Category?.name || bid?.category_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Box>
                                <Text color={textColor} fontSize="sm" fontWeight="normal">
                                  {freelancerName}
                                </Text>
                                <Text color="black" fontSize="xs">
                                  {bid?.freelancer?.email || '--'}
                                </Text>
                              </Box>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatCurrency(bid?.bid_amount)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatDate(bid?.created_at || bid?.createdAt)}
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
                                _hover={{ opacity: 0.9 }}
                              >
                                {statusText}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Tooltip label="View Bid Details">
                                <Button
                                  size="sm"
                                  bg="transparent"
                                  style={{color: 'rgb(32, 33, 36)'}}
                                  borderColor="rgb(32, 33, 36)"
                                  borderWidth="1px"
                                  _hover={{ opacity: 0.8 }}
                                  leftIcon={<MdVisibility />}
                                  onClick={() => {
                                    navigate(`/admin/project-delivery/${bid.id || bid._id}/details`);
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" pt="8px" borderTop="1px solid" borderColor={borderColor} flexWrap="wrap" gap="8px">
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
                        setCurrentPage(1);
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
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setCurrentPage((p)=> Math.max(1, p-1))} isDisabled={currentPage === 1} variant="outline" />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                    <Button key={p} size="sm" variant={currentPage === p ? 'solid' : 'outline'} colorScheme={currentPage === p ? 'brand' : 'gray'} onClick={() => setCurrentPage(p)}>
                      {p}
                    </Button>
                  ))}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setCurrentPage((p)=> p+1)} isDisabled={currentPage === totalPages} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}


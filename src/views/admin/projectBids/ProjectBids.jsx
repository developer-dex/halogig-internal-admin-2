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
  Avatar,
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight, MdVisibility } from 'react-icons/md';
import { getAllProjectBids } from '../../../features/admin/projectBidsSlice';
import { useNavigate } from 'react-router-dom';

export default function ProjectBids() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 50;

  const { isLoading, bids, totalCount } = useSelector((s) => s.projectBidsReducer || {});

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  useEffect(() => {
    dispatch(getAllProjectBids({ page: currentPage, pageLimit }));
  }, [dispatch, currentPage]);

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
      return { bg: 'green.100', color: 'green.700', border: 'green.300' };
    }
    if (s.includes('reject') || s.includes('rejected')) {
      return { bg: 'red.100', color: 'red.700', border: 'red.300' };
    }
    if (s.includes('in_progress') || s.includes('in progress')) {
      return { bg: 'blue.100', color: 'blue.700', border: 'blue.300' };
    }
    if (s.includes('complete') || s.includes('completed')) {
      return { bg: 'green.100', color: 'green.700', border: 'green.300' };
    }
    return { bg: 'orange.100', color: 'orange.700', border: 'orange.300' };
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
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card>
        <Box p="24px" mb="20px">
          <Text color={textColor} fontSize="2xl" fontWeight="700" mb="20px">
            Project Bids
          </Text>

          {isLoading && rows.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" color="gray.500">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">BID ID</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">PROJECT</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">FREELANCER</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center">BID AMOUNT</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center">SUBMITTED</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center">STATUS</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center">VIEW</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py="40px">
                          <Text color="gray.400">No bids found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((bid) => {
                        const statusText = getStatusText(bid);
                        const statusColors = getStatusColors(statusText);
                        const freelancerName = `${bid?.freelancer?.first_name || ''} ${bid?.freelancer?.last_name || ''}`.trim() || '--';
                        const freelancerInitial = bid?.freelancer?.first_name?.[0]?.toUpperCase() || '?';
                        
                        return (
                          <Tr key={bid.id || bid._id} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="700">
                                #{bid.id || bid._id || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="700">
                                {bid?.ClientProject?.project_title || bid?.Project?.project_title || bid?.project_title || '--'}
                              </Text>
                              <Text color="gray.400" fontSize="xs" mt="4px">
                                {bid?.ClientProject?.Category?.name || bid?.Project?.Category?.name || bid?.category_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Flex align="center" gap={3}>
                                <Avatar
                                  size="sm"
                                  src={bid?.freelancer?.profile_image}
                                  name={freelancerName}
                                >
                                  {freelancerInitial}
                                </Avatar>
                                <Box>
                                  <Text color={textColor} fontSize="sm" fontWeight="700">
                                    {freelancerName}
                                  </Text>
                                  <Text color="gray.400" fontSize="xs">
                                    {bid?.freelancer?.email || '--'}
                                  </Text>
                                </Box>
                              </Flex>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm" fontWeight="500">
                                {formatCurrency(bid?.bid_amount)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm">
                                {formatDate(bid?.created_at || bid?.createdAt)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Button
                                size="sm"
                                bg={statusColors.bg}
                                color={statusColors.color}
                                borderColor={statusColors.border}
                                borderWidth="2px"
                                borderRadius="full"
                                fontWeight="600"
                                fontSize="xs"
                                textTransform="capitalize"
                                _hover={{ opacity: 0.9 }}
                              >
                                {statusText}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Tooltip label="View Bid Details">
                                <Button
                                  size="sm"
                                  bg="red.500"
                                  color="white"
                                  _hover={{ bg: 'red.600' }}
                                  leftIcon={<MdVisibility />}
                                  onClick={() => {
                                    navigate(`/admin/project-bids/${bid.id || bid._id}/details`);
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

              <Flex justify="space-between" align="center" mt="20px" pt="20px" borderTop="1px solid" borderColor={borderColor}>
                <Text color="gray.400" fontSize="sm">
                  Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
                </Text>
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



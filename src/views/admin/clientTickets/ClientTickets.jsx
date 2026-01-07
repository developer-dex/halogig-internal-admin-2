import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Spinner,
  Flex,
  Card,
  HStack,
  IconButton,
  Badge,
  Button,
  Tooltip,
  Select,
} from '@chakra-ui/react';
import { 
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
} from 'react-icons/md';
import { getDisputesByType } from '../../../features/admin/disputeManagementSlice';
import { showError } from '../../../helpers/messageHelper';
import { config } from '../../../config/config';

export default function ClientTickets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const [pageLimit, setPageLimit] = useState(50);

  // Chakra color mode values
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(getDisputesByType({
        type: 'client',
        page: currentPage,
        limit: pageLimit
      }));
      if (response.payload?.data?.data) {
        setDisputes(response.payload.data.data.disputes || []);
        setTotalCount(response.payload.data.data.total_count || 0);
      }
    } catch (error) {
      showError('Failed to fetch disputes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [currentPage, pageLimit]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '--';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColorScheme = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: 'yellow.100', color: 'yellow.800' };
      case 'resolved':
        return { bg: 'green.100', color: 'green.800' };
      case 'rejected':
        return { bg: 'red.100', color: 'red.800' };
      default:
        return { bg: 'gray.100', color: 'gray.800' };
    }
  };

  const totalPages = Math.ceil(totalCount / pageLimit);

  const handleViewDetails = (projectBidId) => {
    if (projectBidId) {
      navigate(`/admin/project-finance/${projectBidId}/details`);
    }
  };

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text
            color={textColor}
            fontSize="l"
            fontWeight="700"
            mb="8px"
          >
            Clients Tickets
          </Text>

          {isLoading && disputes.length === 0 ? (
            <Flex justify="center" align="center" minH="600px">
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
                <Table variant="simple" color="gray.500" minW="800px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Dispute ID
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Project Title
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Amount
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Status
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Raised On
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        View
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {disputes.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py="40px">
                          <Text color="black">No disputes found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      disputes.map((dispute, index) => {
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;
                        const statusColors = getStatusColorScheme(dispute.status);
                        return (
                          <Tr
                            key={dispute.dispute_uuid}
                            bg={isOddRow ? '#F8FAFD' : 'transparent'}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {dispute.dispute_uuid || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {dispute.project_title || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatAmount(dispute.amount)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Badge
                                bg={statusColors.bg}
                                color={statusColors.color}
                                px="12px"
                                py="4px"
                                borderRadius="full"
                                fontSize="xs"
                                textTransform="capitalize"
                              >
                                {dispute.status || 'Pending'}
                              </Badge>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatDate(dispute.raised_on)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Tooltip label="View Project Finance Details">
                                <IconButton
                                  aria-label="View details"
                                  icon={<MdVisibility />}
                                  size="sm"
                                  variant="ghost"
                                  style={{ color: 'rgb(32, 33, 36)' }}
                                  onClick={() => handleViewDetails(dispute.project_bid_id)}
                                  isDisabled={!dispute.project_bid_id}
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
              <Flex
                justify="space-between"
                align="center"
                pt="8px"
                borderTop="1px solid"
                borderColor={borderColor}
                flexWrap="wrap"
                gap="8px"
              >
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">
                      {disputes.length}
                    </Text> of {totalCount}
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
                  <IconButton
                    aria-label="Previous page"
                    icon={<MdChevronLeft />}
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    variant="outline"
                  />
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((page) => (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? 'solid' : 'outline'}
                        colorScheme={currentPage === page ? 'brand' : 'gray'}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  
                  <IconButton
                    aria-label="Next page"
                    icon={<MdChevronRight />}
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    variant="outline"
                  />
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

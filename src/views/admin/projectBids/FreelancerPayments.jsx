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
  Badge,
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getAllFreelancerPayments } from '../../../features/admin/freelancerPaymentsSlice';

export default function FreelancerPayments() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 50;

  const { isLoading, payments, totalCount } = useSelector((s) => s.freelancerPayments || {});

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  useEffect(() => {
    dispatch(getAllFreelancerPayments({ page: currentPage, pageLimit }));
  }, [dispatch, currentPage]);

  const rows = useMemo(() => Array.isArray(payments) ? payments : [], [payments]);
  const totalPages = Math.ceil((totalCount || 0) / pageLimit) || 1;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const getStatusColors = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('complete') || s.includes('completed') || s.includes('paid')) {
      return { bg: 'green.100', color: 'green.800' };
    }
    if (s.includes('pending')) {
      return { bg: 'yellow.100', color: 'yellow.800' };
    }
    if (s.includes('failed') || s.includes('rejected')) {
      return { bg: 'red.100', color: 'red.800' };
    }
    return { bg: 'gray.100', color: 'gray.800' };
  };

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text color={textColor} fontSize="2xl" fontWeight="700" mb="8px">
            Freelancer Payments
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
                <Table variant="simple" color="gray.500" minW="1200px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>PROJECT NAME</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>PROJECT ID</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>FREELANCER NAME</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>AMOUNT</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>TAX TYPE</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>TAX AMOUNT</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>DATE OF TRANSACTION</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>INVOICE NUMBER</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>STATUS</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={9} textAlign="center" py="40px">
                          <Text color="black">No payments found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((payment, index) => {
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;
                        const statusColors = getStatusColors(payment.status);
                        
                        return (
                          <Tr key={payment.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {payment.project_name}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                #{payment.project_id}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {payment.freelancer_name}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatCurrency(payment.amount)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {payment.tax_type}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {payment.tax_amount ? formatCurrency(payment.tax_amount) : '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {formatDate(payment.date_of_transaction)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {payment.invoice_number}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Badge
                                bg={statusColors.bg}
                                color={statusColors.color}
                                px="8px"
                                py="4px"
                                borderRadius="full"
                                fontSize="xs"
                                textTransform="capitalize"
                              >
                                {payment.status}
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" pt="8px" borderTop="1px solid" borderColor={borderColor}>
                <Text color="black" fontSize="sm">
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


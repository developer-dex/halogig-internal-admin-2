import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Spinner,
  Flex,
  HStack,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import {
  MdArrowBack,
  MdRefresh,
  MdGetApp,
  MdVisibility,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import moment from 'moment';
import 'moment-duration-format';
import * as XLSX from 'xlsx';
import { siteAnalytics, ipAnalytics, exportSiteAnalytics } from '../../../features/admin/siteAnalyticsSlice';
import { showError } from '../../../helpers/messageHelper';

export default function SiteAnalytics() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAnalytics, setPageAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIpAddress, setSelectedIpAddress] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const exportModal = useDisclosure();
  const pageLimit = 50;

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const cardBg = useColorModeValue('white', 'navy.800');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (selectedIpAddress) {
        const response = await dispatch(
          ipAnalytics({
            page: currentPage,
            pageLimit,
            ipAddress: selectedIpAddress,
          })
        );
        if (response.payload?.data?.data) {
          setPageAnalytics(response.payload.data.data.userActivities || []);
          setTotalCount(response.payload.data.data.total_count || 0);
        }
      } else {
        const response = await dispatch(
          siteAnalytics({
            page: currentPage,
            pageLimit,
          })
        );
        if (response.payload?.data?.data) {
          setPageAnalytics(response.payload.data.data.userActivities || []);
          setTotalCount(response.payload.data.data.total_count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedIpAddress]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportClick = () => {
    exportModal.onOpen();
  };

  const handleExportDialogClose = () => {
    exportModal.onClose();
    setFromDate('');
    setToDate('');
  };

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      showError('Please select both from and to dates');
      return;
    }

    setIsExporting(true);
    try {
      const response = await dispatch(
        exportSiteAnalytics({
          fromDate: moment(fromDate).format('YYYY-MM-DD'),
          toDate: moment(toDate).format('YYYY-MM-DD'),
        })
      );

      if (response.payload?.data?.data) {
        const data = response.payload.data.data.userActivities || [];

        // Transform data for Excel
        const excelData = data.map((item) => ({
          'IP Address': item.ip_address || '--',
          Location: item.location || '--',
          'In Time': item.start_time
            ? moment(item.start_time).format('DD-MM-YYYY h:mm:ss A')
            : '--',
          'Out Time': item.end_time
            ? moment(item.end_time).format('DD-MM-YYYY h:mm:ss A')
            : '--',
          'Time Spent': item.time_spent
            ? moment.duration(item.time_spent, 'seconds').format('m [min] s [sec]')
            : '--',
          'Page Load Time': item.page_load_time ? `${item.page_load_time} sec` : '--',
          'Device Type': item.device_type || '--',
          URL: item.url || '--',
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Site Analytics');

        // Generate filename with date range
        const fileName = `site_analytics_${moment(fromDate).format('YYYY-MM-DD')}_to_${moment(toDate).format('YYYY-MM-DD')}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);
        handleExportDialogClose();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewIpAnalytics = (ipAddress) => {
    setSelectedIpAddress(ipAddress);
    setCurrentPage(1);
  };

  const handleBackToList = () => {
    setSelectedIpAddress(null);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Card mb="20px" bg={cardBg}>
        <Box p="24px">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack spacing={4}>
              {selectedIpAddress && (
                <Button
                  leftIcon={<MdArrowBack />}
                  variant="outline"
                  colorScheme="brand"
                  onClick={handleBackToList}
                >
                  Back to List
                </Button>
              )}
              <Text color={textColor} fontSize="2xl" fontWeight="700">
                {selectedIpAddress ? `Analytics for IP: ${selectedIpAddress}` : 'Site Analytics'}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Button
                leftIcon={<MdRefresh />}
                variant="outline"
                onClick={handleRefresh}
                isDisabled={isLoading}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<MdGetApp />}
                colorScheme="brand"
                onClick={handleExportClick}
                isLoading={isExporting}
                loadingText="Exporting..."
              >
                Export to Excel
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Card>

      {/* Data Table */}
      <Card bg={cardBg}>
        <Box p="24px">
          {isLoading && pageAnalytics.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : pageAnalytics.length === 0 ? (
            <Box textAlign="center" py="40px">
              <Text fontSize="lg" color="gray.400" mb="8px">
                No analytics data found
              </Text>
            </Box>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" color="gray.500" mb="24px">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">IP Address</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" minW="180px">Location</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" minW="180px">In Time</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" minW="180px">Out Time</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">Time Spent</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">Page Load Time</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase">Device Type</Th>
                      <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" minW="300px">URL</Th>
                      {!selectedIpAddress && (
                        <Th borderColor={borderColor} color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center">Actions</Th>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pageAnalytics.map((item) => (
                      <Tr key={item.id || item._id} _hover={{ bg: hoverBg }} transition="all 0.2s">
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" fontWeight="500" fontFamily="monospace">
                            {item.ip_address || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" whiteSpace="normal" wordBreak="break-word">
                            {item.location || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" whiteSpace="normal">
                            {item.start_time
                              ? moment(item.start_time).format('DD-MM-YYYY h:mm:ss A')
                              : '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" whiteSpace="normal">
                            {item.end_time
                              ? moment(item.end_time).format('DD-MM-YYYY h:mm:ss A')
                              : '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm">
                            {item.time_spent
                              ? moment.duration(item.time_spent, 'seconds').format('m [min] s [sec]')
                              : '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm">
                            {item.page_load_time ? `${item.page_load_time} sec` : '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm">
                            {item.device_type || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          {item.url ? (
                            <Link
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="brand.500"
                              fontSize="sm"
                              wordBreak="break-all"
                              whiteSpace="normal"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {item.url}
                            </Link>
                          ) : (
                            <Text color="gray.400" fontSize="sm">--</Text>
                          )}
                        </Td>
                        {!selectedIpAddress && (
                          <Td borderColor={borderColor} textAlign="center">
                            <Tooltip label="View IP Analytics">
                              <IconButton
                                aria-label="View IP analytics"
                                icon={<MdVisibility />}
                                size="sm"
                                colorScheme="brand"
                                variant="ghost"
                                onClick={() => handleViewIpAnalytics(item.ip_address)}
                                isDisabled={!item.ip_address}
                              />
                            </Tooltip>
                          </Td>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center" pt="20px" borderTop="1px solid" borderColor={borderColor}>
                <Text color="gray.400" fontSize="sm">
                  Showing <Text as="span" fontWeight="700" color="brand.500">{pageAnalytics.length}</Text> of {totalCount}
                </Text>
                <HStack spacing="8px">
                  <IconButton
                    aria-label="Previous page"
                    icon={<MdChevronLeft />}
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    variant="outline"
                  />
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
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

      {/* Export Modal */}
      <Modal isOpen={exportModal.isOpen} onClose={handleExportDialogClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Date Range for Export</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDirection="column" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="500" mb={2}>
                  From Date
                </Text>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  size="md"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="500" mb={2}>
                  To Date
                </Text>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  size="md"
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleExportDialogClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleExport}
              isDisabled={!fromDate || !toDate || isExporting}
              isLoading={isExporting}
              loadingText="Exporting..."
            >
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


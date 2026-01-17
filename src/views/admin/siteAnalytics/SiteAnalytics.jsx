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
  Select,
} from '@chakra-ui/react';
import {
  MdArrowBack,
  MdRefresh,
  MdGetApp,
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
  const [pageLimit, setPageLimit] = useState(50);

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
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
  }, [currentPage, selectedIpAddress, pageLimit]);

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
          Date: item.start_time
            ? moment(item.start_time).format('DD-MM-YYYY')
            : '--',
          'IP Address': item.ip_address || '--',
          Location: item.location || '--',
          'User Type': item.user_type || 'guest',
          'Today Visit Count': item.today_visit_count ?? '--',
          'Total Visit Till Date': item.total_visit_till_date ?? '--',
          'In Time': item.start_time
            ? moment(item.start_time).format('h:mm:ss A')
            : '--',
          'Out Time': item.end_time
            ? moment(item.end_time).format('h:mm:ss A')
            : '--',
          'Time Spent': item.time_spent
            ? moment.duration(item.time_spent, 'seconds').format('m [min] s [sec]')
            : '--',
          'Page Load Time': item.page_load_time ? `${Math.abs(item.page_load_time)} sec` : '--',
          'Device Type': item.device_type || '--',
          'Telecom Provider': item.telecom_provider || '--',
          Browser: item.browser || '--',
          Source: 'web',
          'Page Visit': item.url || '--',
          Role: item.role || '--',
          Industry: item.industry_name || '--',
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Visitor Analytics');

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
    <Box>
      {/* Header */}
      <Box mb="4px" >
        <Box ps="12px" pe="12px">
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
              <Text color={textColor} fontSize="l" fontWeight="700">
                {selectedIpAddress ? `Analytics for IP: ${selectedIpAddress}` : 'Visitor Analytics'}
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
                // colorScheme="brand"
                variant="outline"
                onClick={handleExportClick}
                isLoading={isExporting}
                loadingText="Exporting..."
              >
                Export
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Data Table */}
      <Card bg={bgColor}>
        <Box p="12px">
          {isLoading && pageAnalytics.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : pageAnalytics.length === 0 ? (
            <Box textAlign="center" py="40px">
              <Text fontSize="lg" color={textColor} mb="8px">
                No analytics data found
              </Text>
            </Box>
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
                <Table variant="simple" color="gray.500" minW="1400px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Date</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>IP Address</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" minW="120px" bg={bgColor}>Location</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>User Type</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Today Visit Count</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Total Visit Till Date</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>In Time</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Out Time</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Time Spent</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Page Load Time</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Device Type</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Telecom Provider</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Browser</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Source</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" minW="400px" bg={bgColor}>Page Visit</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Role</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Industry</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pageAnalytics.map((item, index) => {
                      // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                      const isOddRow = index % 2 === 0;
                      return (
                        <Tr key={item.id || item._id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                          {/* Date - extracted from In time */}
                          <Td borderColor={borderColor} minW="120px" pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" whiteSpace="nowrap">
                              {item.start_time
                                ? moment(item.start_time).format('DD-MM-YYYY')
                                : '--'}
                            </Text>
                          </Td>
                          {/* IP Address */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            {item.ip_address ? (
                              <Tooltip label="View IP Analytics" hasArrow>
                                <Text
                                  color={selectedIpAddress ? textColor : 'brand.500'}
                                  fontSize="sm"
                                  fontWeight="normal"
                                  fontFamily="monospace"
                                  cursor={selectedIpAddress ? 'default' : 'pointer'}
                                  _hover={
                                    selectedIpAddress
                                      ? {}
                                      : { textDecoration: 'underline' }
                                  }
                                  onClick={
                                    selectedIpAddress
                                      ? undefined
                                      : () => handleViewIpAnalytics(item.ip_address)
                                  }
                                >
                                  {item.ip_address}
                                </Text>
                              </Tooltip>
                            ) : (
                              <Text color={textColor} fontSize="sm" fontWeight="normal" fontFamily="monospace">
                                --
                              </Text>
                            )}
                          </Td>
                          {/* Location */}
                          <Td borderColor={borderColor} maxW="150px" pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" whiteSpace="normal" wordBreak="break-word" noOfLines={2}>
                              {item.location || '--'}
                            </Text>
                          </Td>
                          {/* User Type - Static "guest" */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.user_type || 'guest'}
                            </Text>
                          </Td>
                          {/* Today Visit Count */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.today_visit_count ?? '--'}
                            </Text>
                          </Td>
                          {/* Total Visit Till Date */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.total_visit_till_date ?? '--'}
                            </Text>
                          </Td>
                          {/* In Time - Only time, not date */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" whiteSpace="normal">
                              {item.start_time
                                ? moment(item.start_time).format('h:mm:ss A')
                                : '--'}
                            </Text>
                          </Td>
                          {/* Out Time - Only time, not date */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" whiteSpace="normal">
                              {item.end_time
                                ? moment(item.end_time).format('h:mm:ss A')
                                : '--'}
                            </Text>
                          </Td>
                          {/* Time Spent */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.time_spent
                                ? moment.duration(item.time_spent, 'seconds').format('m [min] s [sec]')
                                : '--'}
                            </Text>
                          </Td>
                          {/* Page Load Time */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.page_load_time ? `${Math.abs(item.page_load_time)} sec` : '--'}
                            </Text>
                          </Td>
                          {/* Device Type */}
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.device_type || '--'}
                            </Text>
                          </Td>
                          {/* Telecom Provider */}
                          <Td borderColor={borderColor} pt="8px" pb="8px" >
                            <Text color={textColor} fontSize="sm">
                              {item.telecom_provider || '--'}
                            </Text>
                          </Td>
                          {/* Browser */}
                          <Td borderColor={borderColor} pt="8px" pb="8px" >
                            <Text color={textColor} fontSize="sm">
                              {item.browser || '--'}
                            </Text>
                          </Td>
                          {/* Source - Static "web" */}
                          <Td borderColor={borderColor} pt="8px" pb="8px" >
                            <Text color={textColor} fontSize="sm">
                              web
                            </Text>
                          </Td>
                          {/* Page Visit */}
                          <Td borderColor={borderColor} maxW="450px" pt="8px" pb="8px" >
                            <Tooltip label={item.url || ''} placement="top">
                              <Text
                                color={textColor}
                                fontSize="sm"
                                whiteSpace="normal"
                                wordBreak="break-word"
                                noOfLines={3}
                                cursor="pointer"
                              >
                                {item.url || '--'}
                              </Text>
                            </Tooltip>
                          </Td>
                          {/* Role */}
                          <Td borderColor={borderColor} pt="8px" pb="8px" >
                            <Text color={textColor} fontSize="sm">
                              {item.role || '--'}
                            </Text>
                          </Td>
                          {/* Industry */}
                          <Td borderColor={borderColor} pt="8px" pb="8px" >
                            <Text color={textColor} fontSize="sm">
                              {item.industry_name || '--'}
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center" pt="8px" borderTop="1px solid" borderColor={borderColor} flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">{pageAnalytics.length}</Text> of {totalCount}
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


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
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
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Flex,
  HStack,
  Badge,
  Select,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Divider,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  MdRefresh,
  MdSearch,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
} from 'react-icons/md';
import {
  getWebRotData,
} from '../../../features/admin/webRotDataSlice';
import Card from 'components/card/Card';
import { getApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';

export default function WebRotData() {
  const dispatch = useDispatch();
  const detailsModal = useDisclosure();
  const refreshModal = useDisclosure();

  const [currentPage, setCurrentPage] = useState(1);
  const [webRotData, setWebRotData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [uniqueIndustries, setUniqueIndustries] = useState([]);
  const [uniqueSlugLinks, setUniqueSlugLinks] = useState([]);
  const [selectedRefreshIndustry, setSelectedRefreshIndustry] = useState('');
  const [selectedRefreshSlugLink, setSelectedRefreshSlugLink] = useState('');
  const [isRefreshOptionsLoading, setIsRefreshOptionsLoading] = useState(false);
  const [isSubmittingRefresh, setIsSubmittingRefresh] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [slugLinkFilter, setSlugLinkFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedServiceFilter, setDebouncedServiceFilter] = useState('');
  const [debouncedIndustryFilter, setDebouncedIndustryFilter] = useState('');
  const [debouncedSlugLinkFilter, setDebouncedSlugLinkFilter] = useState('');

  const [pageLimit, setPageLimit] = useState(50);

  const { isLoading } = useSelector(
    (state) => state.webRotData
  );

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const secondaryText = useColorModeValue('gray.500', 'gray.300');
  const filterBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  // Debouncing effect for service filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedServiceFilter(serviceFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [serviceFilter]);

  // Debouncing effect for industry filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedIndustryFilter(industryFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [industryFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSlugLinkFilter(slugLinkFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [slugLinkFilter]);

  // Fetch web rotation data
  const fetchWebRotData = useCallback(async () => {
    const response = await dispatch(
      getWebRotData({
        page: currentPage,
        limit: pageLimit,
        serviceName: debouncedServiceFilter || undefined,
        industry: debouncedIndustryFilter || undefined,
        slugLink: debouncedSlugLinkFilter || undefined,
        batchNo: batchFilter || undefined,
        status: statusFilter || undefined,
      })
    );

    if (response.payload?.data?.success) {
      setWebRotData(response.payload.data.data.data || []);
      setTotalCount(response.payload.data.data.pagination?.totalRecords || 0);
    }
  }, [dispatch, currentPage, pageLimit, debouncedServiceFilter, debouncedIndustryFilter, debouncedSlugLinkFilter, batchFilter, statusFilter]);

  useEffect(() => {
    fetchWebRotData();
  }, [fetchWebRotData]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Clear filters
  const clearFilters = () => {
    setServiceFilter('');
    setIndustryFilter('');
    setSlugLinkFilter('');
    setBatchFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;
  const activeFilterCount = [
    serviceFilter,
    industryFilter,
    slugLinkFilter,
    batchFilter,
    statusFilter,
  ].filter(Boolean).length;

  // Parse JSON fields for display
  const parseJsonField = (field) => {
    if (!field) return null;
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch {
      return null;
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    detailsModal.onOpen();
  };

  const renderListItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <Text color={secondaryText} fontSize="sm">
          No data available
        </Text>
      );
    }

    return (
      <VStack align="stretch" spacing={3}>
        {items.map((item, index) => (
          <Box
            key={`${item.title || item.slug || 'item'}-${index}`}
            p="12px"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="10px"
            bg={filterBg}
          >
            {item.title && (
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="4px">
                {item.title}
              </Text>
            )}
            {item.description && (
              <Text color={secondaryText} fontSize="sm">
                {item.description}
              </Text>
            )}
            {item.slug && (
              <Text color={secondaryText} fontSize="sm">
                Slug: {item.slug}
              </Text>
            )}
            {item.altername_skill_name && (
              <Text color={secondaryText} fontSize="sm">
                Alternate Name: {item.altername_skill_name}
              </Text>
            )}
            {!item.title && !item.description && !item.slug && !item.altername_skill_name && (
              <Text color={secondaryText} fontSize="sm">
                {JSON.stringify(item)}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    );
  };

  const renderDetailField = (label, value, isLink = false) => (
    <Box>
      <Text color={secondaryText} fontSize="xs" fontWeight="600" textTransform="uppercase" mb="4px">
        {label}
      </Text>
      <Text
        color={textColor}
        fontSize="sm"
        wordBreak="break-word"
        fontFamily={isLink ? 'mono' : 'inherit'}
      >
        {value || '-'}
      </Text>
    </Box>
  );

  const parsedSelectedServiceList = parseJsonField(selectedRecord?.service_list);
  const parsedSelectedMainApps = parseJsonField(selectedRecord?.main_application_list);

  const fetchRefreshOptions = async () => {
    try {
      setIsRefreshOptionsLoading(true);

      const [industriesResponse, slugLinksResponse] = await Promise.all([
        getApi(apiEndPoints.GET_WEB_ROT_UNIQUE_INDUSTRIES),
        getApi(apiEndPoints.GET_WEB_ROT_UNIQUE_SLUG_LINKS),
      ]);

      setUniqueIndustries(industriesResponse?.data?.data || []);
      setUniqueSlugLinks(slugLinksResponse?.data?.data || []);
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to load refresh options');
    } finally {
      setIsRefreshOptionsLoading(false);
    }
  };

  const handleOpenRefreshModal = async () => {
    setSelectedRefreshIndustry('');
    setSelectedRefreshSlugLink('');
    refreshModal.onOpen();
    await fetchRefreshOptions();
  };

  const handleSubmitRefresh = async () => {
    if (!selectedRefreshIndustry) {
      showError('Please select an industry');
      return;
    }

    if (!selectedRefreshSlugLink) {
      showError('Please select a slug link');
      return;
    }

    const selectedSlugData = uniqueSlugLinks.find(
      (item) => item.slug_link === selectedRefreshSlugLink
    );

    if (!selectedSlugData?.service_id || !selectedSlugData?.service_name) {
      showError('Unable to prepare refresh request for the selected slug link');
      return;
    }

    const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
    if (!aiBaseUrl) {
      showError('AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)');
      return;
    }

    try {
      setIsSubmittingRefresh(true);

      await axios.post(`${aiBaseUrl}/api/industry/refresh`, [
        {
          service_id: selectedSlugData.service_id,
          service_name: selectedSlugData.service_name,
          industry_to_be_updated: selectedRefreshIndustry,
        },
      ]);

      showSuccess('Industry refresh request submitted successfully');
      refreshModal.onClose();
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to submit refresh request');
    } finally {
      setIsSubmittingRefresh(false);
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box mb="6px">
        <Box p="8px" ps="12px" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Flex justify="space-between" align="center" mb="8px" flexWrap="wrap" gap={2}>
            <Box>
              <Text color={textColor} fontSize="l" fontWeight="700" mb="2px">
                AI Website Data
              </Text>
            </Box>
          </Flex>

          <Flex gap={2} flexWrap="wrap" align="center">
            <Button
              leftIcon={<MdRefresh />}
              variant="outline"
              size="sm"
              onClick={handleOpenRefreshModal}
              isDisabled={isLoading}
            >
              Refresh
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Filters */}
      <Card
        direction="column"
        w="100%"
        mb="12px"
        px="0px"
        overflow="hidden"
      >
        <Box px="16px" py="14px" bg={filterBg}>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 6 }} spacing={3}>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Service name"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                bg={bgColor}
                borderColor={borderColor}
              />
            </InputGroup>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Industry"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                bg={bgColor}
                borderColor={borderColor}
              />
            </InputGroup>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Slug link"
                value={slugLinkFilter}
                onChange={(e) => setSlugLinkFilter(e.target.value)}
                bg={bgColor}
                borderColor={borderColor}
              />
            </InputGroup>
            <Select
              placeholder="Select batch"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              size="sm"
              bg={bgColor}
              borderColor={borderColor}
            >
              <option value="batch_1">Batch 1</option>
              <option value="batch_2">Batch 2</option>
              <option value="batch_3">Batch 3</option>
              <option value="batch_4">Batch 4</option>
              <option value="batch_5">Batch 5</option>
              <option value="batch_6">Batch 6</option>
              <option value="batch_7">Batch 7</option>
            </Select>
            <Select
              placeholder="Select status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="sm"
              bg={bgColor}
              borderColor={borderColor}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Flex align="center" justify={{ base: 'flex-start', xl: 'flex-end' }}>
              {activeFilterCount > 0 && (
                <Button
                  leftIcon={<MdClose />}
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
              )}
            </Flex>
          </SimpleGrid>
        </Box>
      </Card>

      {/* Data Table */}
      <Box bg={bgColor}>
        <Box p="12px">
          {isLoading && webRotData.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : webRotData.length === 0 ? (
            <Box textAlign="center" py="40px">
              <Text fontSize="lg" color={textColor} mb="8px">
                No web rotation data found
              </Text>
            </Box>
          ) : (
            <>
              <Box
                h={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 210px)', xl: 'calc(100vh - 210px)' }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="1000px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>ID</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Service ID</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Service Name</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Industry</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Slug Link</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Batch No</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Status</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Service Lists</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Main Apps</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {webRotData.map((row, index) => {
                      const isOddRow = index % 2 === 0;
                      const serviceLists = parseJsonField(row.service_list);
                      const mainAppLists = parseJsonField(row.main_application_list);
                      return (
                        <Tr key={row.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {row.id}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {row.service_id || '-'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {row.service_name || '-'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Badge px="12px" py="4px" borderRadius="full" color={textColor} fontWeight="normal" borderColor="rgb(32, 33, 36)">
                              {row.industry || '-'}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="220px">
                            <Text
                              color={textColor}
                              fontSize="sm"
                              fontWeight="normal"
                              noOfLines={1}
                              title={row.slug_link || '-'}
                            >
                              {row.slug_link || '-'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Badge px="12px" py="4px" borderRadius="full" color={textColor} fontWeight="normal" borderColor="rgb(32, 33, 36)">
                              {row.batch_no || '-'}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Badge
                              px="12px"
                              py="4px"
                              borderRadius="full"
                              colorScheme={row.status === 'active' ? 'green' : 'gray'}
                              fontWeight="normal"
                            >
                              {row.status || 'inactive'}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {serviceLists && Array.isArray(serviceLists) ? `${serviceLists.length} items` : '-'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {mainAppLists && Array.isArray(mainAppLists) ? `${mainAppLists.length} items` : '-'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Button
                              leftIcon={<MdVisibility />}
                              size="xs"
                              variant="outline"
                              onClick={() => handleViewRecord(row)}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center" mt="20px" flexWrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Text color={textColor} fontSize="sm">
                    Showing {webRotData.length > 0 ? (currentPage - 1) * pageLimit + 1 : 0} to{' '}
                    {Math.min(currentPage * pageLimit, totalCount)} of {totalCount} entries
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<MdChevronLeft />}
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Text color={textColor} fontSize="sm">
                    Page {currentPage} of {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<MdChevronRight />}
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage >= totalPages || isLoading}
                  >
                    Next
                  </Button>
                </HStack>
                <Select
                  value={pageLimit}
                  onChange={(e) => {
                    setPageLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  size="sm"
                  w="120px"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </Select>
              </Flex>
            </>
          )}
        </Box>
      </Box>

      <Modal isOpen={detailsModal.isOpen} onClose={detailsModal.onClose} size="5xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AI Website Data Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px">
            {selectedRecord && (
              <VStack align="stretch" spacing={5}>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {renderDetailField('ID', selectedRecord.id)}
                  {renderDetailField('Service ID', selectedRecord.service_id)}
                  {renderDetailField('Service Name', selectedRecord.service_name)}
                  {renderDetailField('Industry', selectedRecord.industry)}
                  {renderDetailField('Batch No', selectedRecord.batch_no)}
                  {renderDetailField('Status', selectedRecord.status)}
                  {renderDetailField('Slug Link', selectedRecord.slug_link, true)}
                </SimpleGrid>

                <Divider />

                <Box>
                  <Text color={textColor} fontSize="md" fontWeight="700" mb="12px">
                    Service List
                  </Text>
                  {renderListItems(parsedSelectedServiceList)}
                </Box>

                <Divider />

                <Box>
                  <Text color={textColor} fontSize="md" fontWeight="700" mb="12px">
                    Main Application List
                  </Text>
                  {renderListItems(parsedSelectedMainApps)}
                </Box>

                <Divider />

                <Box>
                  <Text color={textColor} fontSize="md" fontWeight="700" mb="12px">
                    Raw JSON Preview
                  </Text>
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                    <Box
                      p="12px"
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="10px"
                      bg={filterBg}
                      overflowX="auto"
                    >
                      <Text color={secondaryText} fontSize="xs" fontWeight="600" mb="8px">
                        SERVICE LIST JSON
                      </Text>
                      <Text as="pre" color={textColor} fontSize="xs" whiteSpace="pre-wrap">
                        {JSON.stringify(parsedSelectedServiceList, null, 2) || '-'}
                      </Text>
                    </Box>
                    <Box
                      p="12px"
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="10px"
                      bg={filterBg}
                      overflowX="auto"
                    >
                      <Text color={secondaryText} fontSize="xs" fontWeight="600" mb="8px">
                        MAIN APPLICATION LIST JSON
                      </Text>
                      <Text as="pre" color={textColor} fontSize="xs" whiteSpace="pre-wrap">
                        {JSON.stringify(parsedSelectedMainApps, null, 2) || '-'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={refreshModal.isOpen} onClose={refreshModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Refresh Industry Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Industry</FormLabel>
                <Select
                  placeholder={isRefreshOptionsLoading ? 'Loading industries...' : 'Select industry'}
                  value={selectedRefreshIndustry}
                  onChange={(e) => setSelectedRefreshIndustry(e.target.value)}
                  isDisabled={isRefreshOptionsLoading || isSubmittingRefresh}
                >
                  {uniqueIndustries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Slug Link</FormLabel>
                <Select
                  placeholder={isRefreshOptionsLoading ? 'Loading slug links...' : 'Select slug link'}
                  value={selectedRefreshSlugLink}
                  onChange={(e) => setSelectedRefreshSlugLink(e.target.value)}
                  isDisabled={isRefreshOptionsLoading || isSubmittingRefresh}
                >
                  {uniqueSlugLinks.map((item) => (
                    <option key={`${item.slug_link}-${item.service_id}`} value={item.slug_link}>
                      {item.slug_link}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={refreshModal.onClose} isDisabled={isSubmittingRefresh}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitRefresh}
              isLoading={isSubmittingRefresh}
              loadingText="Submitting"
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

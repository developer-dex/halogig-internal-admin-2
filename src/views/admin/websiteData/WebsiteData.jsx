import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  InputGroup,
  InputLeftElement,
  Spinner,
  Flex,
  HStack,
  Tooltip,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  MdCloudUpload,
  MdDelete,
  MdVisibility,
  MdEdit,
  MdGetApp,
  MdRefresh,
  MdAdd,
  MdRemove,
  MdLaunch,
  MdSearch,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import {
  uploadWebsiteDataExcel,
  getWebsiteData,
  deleteWebsiteData,
  deleteAllWebsiteData,
  downloadWebsiteDataExcel,
  clearUploadResponse,
  createWebsiteData,
} from '../../../features/admin/websiteDataSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';

export default function WebsiteData() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [websiteData, setWebsiteData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('');
  const [debouncedServiceFilter, setDebouncedServiceFilter] = useState('');

  const uploadModal = useDisclosure();
  const deleteModal = useDisclosure();
  const deleteAllModal = useDisclosure();
  const viewModal = useDisclosure();
  const createModal = useDisclosure();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    serviceName: '',
    slugLink: '',
    primaryKeyword: '',
    secondaryKeyword: '',
    bannerTitle: '',
    bannerDescription: '',
    serviceTitle: '',
    serviceDescription: '',
    serviceLists: [{ title: '', description: '' }],
    industryTitle: '',
    industryLists: [''],
    mainApplicationTitle: '',
    mainApplicationDescription: '',
    mainApplicationLists: [{ title: '', description: '' }],
    interlinkPages: [{ interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] }],
    usercaseListes: [''],
    metaTitle: '',
    metaDescription: '',
  });

  const pageLimit = 10;

  const { isLoading, uploadLoading, uploadResponse, uploadError, responseData } = useSelector(
    (state) => state.websiteData
  );

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    const bgColor = useColorModeValue('#F4F7FE', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const cardBg = useColorModeValue('white', 'navy.800');

  // Debouncing effect for service filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedServiceFilter(serviceFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [serviceFilter]);

  // Fetch website data
  const fetchWebsiteData = useCallback(async () => {
    const response = await dispatch(
      getWebsiteData({
        page: currentPage,
        limit: pageLimit,
        serviceName: debouncedServiceFilter || undefined,
      })
    );

    if (response.payload?.data?.success) {
      setWebsiteData(response.payload.data.data.data || []);
      setTotalCount(response.payload.data.data.pagination?.totalRecords || 0);
    }
  }, [dispatch, currentPage, pageLimit, debouncedServiceFilter]);

  useEffect(() => {
    fetchWebsiteData();
  }, [fetchWebsiteData]);

  // Format date helper
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  };

  // Handle preview URL
  const handlePreview = (row) => {
    if (!row.category_name || !row.slug_link) {
      showError('Preview not available: Missing category name or slug link');
      return;
    }

    const previewUrl = `${process.env.REACT_APP_FRONTEND_URL}/${row.category_name}${row.slug_link}`;
    window.open(previewUrl, '_blank');
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        showError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      uploadModal.onOpen();
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formDataObj = new FormData();
    formDataObj.append('excelFile', selectedFile);

    try {
      await dispatch(uploadWebsiteDataExcel(formDataObj));
      uploadModal.onClose();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchWebsiteData();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      await dispatch(deleteWebsiteData(selectedRecord.id));
      deleteModal.onClose();
      setSelectedRecord(null);
      fetchWebsiteData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle delete all
  const handleDeleteAll = async () => {
    try {
      await dispatch(deleteAllWebsiteData());
      deleteAllModal.onClose();
      setCurrentPage(1);
      fetchWebsiteData();
    } catch (error) {
      console.error('Delete all error:', error);
    }
  };

  // Handle download Excel
  const handleDownloadExcel = async () => {
    try {
      const filters = {};
      if (debouncedServiceFilter) filters.serviceName = debouncedServiceFilter;

      const response = await dispatch(downloadWebsiteDataExcel(filters));

      if (response.payload?.blob) {
        const blob = response.payload.blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `website-data-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    viewModal.onOpen();
  };

  // Handle edit - navigate to details page
  const handleEdit = (record) => {
    navigate(`/admin/website-data/${record.id}/details`);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Clear filters
  const clearFilters = () => {
    setServiceFilter('');
    setCurrentPage(1);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      categoryName: '',
      serviceName: '',
      slugLink: '',
      primaryKeyword: '',
      secondaryKeyword: '',
      bannerTitle: '',
      bannerDescription: '',
      serviceTitle: '',
      serviceDescription: '',
      serviceLists: [{ title: '', description: '' }],
      industryTitle: '',
      industryLists: [''],
      mainApplicationTitle: '',
      mainApplicationDescription: '',
      mainApplicationLists: [{ title: '', description: '' }],
      interlinkPages: [{ interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] }],
      usercaseListes: [''],
      metaTitle: '',
      metaDescription: '',
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle service lists changes
  const handleServiceListChange = (index, field, value) => {
    const newServiceLists = formData.serviceLists.map((service, i) =>
      i === index ? { ...service, [field]: value } : service
    );
    setFormData((prev) => ({
      ...prev,
      serviceLists: newServiceLists,
    }));
  };

  const addServiceList = () => {
    if (formData.serviceLists.length < 5) {
      setFormData((prev) => ({
        ...prev,
        serviceLists: [...prev.serviceLists, { title: '', description: '' }],
      }));
    }
  };

  const removeServiceList = (index) => {
    if (formData.serviceLists.length > 1) {
      const newServiceLists = formData.serviceLists.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        serviceLists: newServiceLists,
      }));
    }
  };

  // Handle main application lists changes
  const handleMainApplicationChange = (index, field, value) => {
    const newMainApplicationLists = formData.mainApplicationLists.map((app, i) =>
      i === index ? { ...app, [field]: value } : app
    );
    setFormData((prev) => ({
      ...prev,
      mainApplicationLists: newMainApplicationLists,
    }));
  };

  const addMainApplication = () => {
    if (formData.mainApplicationLists.length < 5) {
      setFormData((prev) => ({
        ...prev,
        mainApplicationLists: [...prev.mainApplicationLists, { title: '', description: '' }],
      }));
    }
  };

  const removeMainApplication = (index) => {
    if (formData.mainApplicationLists.length > 1) {
      const newMainApplicationLists = formData.mainApplicationLists.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        mainApplicationLists: newMainApplicationLists,
      }));
    }
  };

  // Handle interlink pages changes - Groups (simplified for create modal)
  // Note: Create modal uses simplified structure, full editing is done in details page
  const handleInterlinkGroupHeadingChange = (groupIndex, value) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) =>
      i === groupIndex ? { ...group, interlink_heading: value } : group
    );
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  const handleInterlinkPageChange = (groupIndex, pageIndex, field, value) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) => {
      if (i === groupIndex) {
        const newPages = group.interlink_pages.map((page, j) =>
          j === pageIndex ? { ...page, [field]: value } : page
        );
        return { ...group, interlink_pages: newPages };
      }
      return group;
    });
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  const addInterlinkPageToGroup = (groupIndex) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) => {
      if (i === groupIndex) {
        return {
          ...group,
          interlink_pages: [...group.interlink_pages, { slug: '', altername_skill_name: '' }],
        };
      }
      return group;
    });
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  const removeInterlinkPageFromGroup = (groupIndex, pageIndex) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) => {
      if (i === groupIndex) {
        const newPages = group.interlink_pages.filter((_, j) => j !== pageIndex);
        return { ...group, interlink_pages: newPages };
      }
      return group;
    });
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  const addInterlinkGroup = () => {
    setFormData((prev) => ({
      ...prev,
      interlinkPages: [
        ...prev.interlinkPages,
        { interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] },
      ],
    }));
  };

  const removeInterlinkGroup = (groupIndex) => {
    if (formData.interlinkPages.length > 1) {
      const newInterlinkPages = formData.interlinkPages.filter((_, i) => i !== groupIndex);
      setFormData((prev) => ({
        ...prev,
        interlinkPages: newInterlinkPages,
      }));
    }
  };

  // Handle industry lists changes
  const handleIndustryListChange = (index, value) => {
    const newIndustryLists = [...formData.industryLists];
    newIndustryLists[index] = value;
    setFormData((prev) => ({
      ...prev,
      industryLists: newIndustryLists,
    }));
  };

  const addIndustryList = () => {
    setFormData((prev) => ({
      ...prev,
      industryLists: [...prev.industryLists, ''],
    }));
  };

  const removeIndustryList = (index) => {
    if (formData.industryLists.length > 1) {
      const newIndustryLists = formData.industryLists.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        industryLists: newIndustryLists,
      }));
    }
  };

  // Handle usecase lists changes
  const handleUsecaseListChange = (index, value) => {
    const newUsercaseListes = [...formData.usercaseListes];
    newUsercaseListes[index] = value;
    setFormData((prev) => ({
      ...prev,
      usercaseListes: newUsercaseListes,
    }));
  };

  const addUsecaseList = () => {
    setFormData((prev) => ({
      ...prev,
      usercaseListes: [...prev.usercaseListes, ''],
    }));
  };

  const removeUsecaseList = (index) => {
    if (formData.usercaseListes.length > 1) {
      const newUsercaseListes = formData.usercaseListes.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        usercaseListes: newUsercaseListes,
      }));
    }
  };

  // Handle form submission
  const handleCreateSubmit = async () => {
    try {
      if (!formData.serviceName.trim()) {
        showError('Service name is required');
        return;
      }

      const filteredServiceLists = formData.serviceLists.filter(
        (service) => service.title.trim() || service.description.trim()
      );

      const filteredMainApplicationLists = formData.mainApplicationLists.filter(
        (app) => app.title.trim() || app.description.trim()
      );

      // Filter interlink pages - keep groups that have heading or at least one page with data
      const filteredInterlinkPages = formData.interlinkPages
        .map((group) => {
          const filteredPages = group.interlink_pages.filter(
            (page) => page.slug.trim() || page.altername_skill_name.trim()
          );
          // Only include group if it has heading or has pages
          if (group.interlink_heading.trim() || filteredPages.length > 0) {
            return {
              ...group,
              interlink_pages: filteredPages.length > 0 ? filteredPages : [],
            };
          }
          return null;
        })
        .filter((group) => group !== null);

      const filteredIndustryLists = formData.industryLists.filter((industry) => industry.trim());
      const filteredUsercaseListes = formData.usercaseListes.filter((usecase) => usecase.trim());

      const submitData = {
        ...formData,
        serviceLists: filteredServiceLists,
        mainApplicationLists: filteredMainApplicationLists,
        interlinkPages: filteredInterlinkPages,
        industryLists: filteredIndustryLists.join(', '),
        usercaseListes: filteredUsercaseListes.join(', '),
      };

      await dispatch(createWebsiteData(submitData));
      createModal.onClose();
      resetForm();
      fetchWebsiteData();
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box>
      {/* Actions Section */}
      <Box mb="6px">
        <Box p="8px" ps="12px" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
          <Flex justify="space-between" align="center" mb="8px" flexWrap="wrap" gap={2}>
            <Box>
              <Text color={textColor} fontSize="xl" fontWeight="700" mb="2px">
                Website Data Management
              </Text>
              {/* <Text color="black" fontSize="s">
                Manage your website data with powerful tools for upload, download, and content management
              </Text> */}
            </Box>
          </Flex>

          <Flex gap={2} flexWrap="wrap" align="center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              leftIcon={<MdCloudUpload />}
              // colorScheme="brand"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadLoading}
              loadingText="Uploading..."
            >
              Upload Excel
            </Button>
            <Button
              leftIcon={<MdGetApp />}
              variant="outline"
              size="sm"
              onClick={handleDownloadExcel}
              isDisabled={isLoading || totalCount === 0}
            >
              Download Excel
            </Button>
            <Button
              leftIcon={<MdAdd />}
              variant="outline"
              // colorScheme="brand"
              size="sm"
              onClick={createModal.onOpen}
              isDisabled={isLoading}
            >
              Add New
            </Button>
            <Button
              leftIcon={<MdRefresh />}
              variant="outline"
              size="sm"
              onClick={fetchWebsiteData}
              isDisabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<MdDelete />}
              variant="outline"
              // colorScheme="red"
              size="sm"
              onClick={deleteAllModal.onOpen}
              isDisabled={isLoading || totalCount === 0}
            >
              Delete All
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Upload Response Display */}
      {uploadResponse && (
        <Alert
          status={uploadResponse.success ? 'success' : 'error'}
          mb="10px"
          size="sm"
          onClose={() => dispatch(clearUploadResponse())}
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Upload Results</AlertTitle>
            <AlertDescription>
              <Text fontSize="sm">
                Total Rows: {uploadResponse.data?.totalRows || 0} | Successful:{' '}
                {uploadResponse.data?.successfulRows || 0} | Failed:{' '}
                {uploadResponse.data?.failedRows || 0}
              </Text>
              {uploadResponse.data?.errors?.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    Errors:
                  </Text>
                  {uploadResponse.data.errors.slice(0, 5).map((error, index) => (
                    <Text key={index} fontSize="xs" color="red.500">
                      Row {error.row}: {error.error}
                    </Text>
                  ))}
                  {uploadResponse.data.errors.length > 5 && (
                    <Text fontSize="xs" color="gray.500">
                      ... and {uploadResponse.data.errors.length - 5} more errors
                    </Text>
                  )}
                </Box>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Filters */}
      <Box  bg={bgColor}>
        <Box p="8px">
          <HStack spacing={2}>
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by Service Name..."
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                size="sm"
              />
            </InputGroup>
            {serviceFilter && (
              <IconButton
                aria-label="Clear search"
                icon={<MdClose />}
                onClick={clearFilters}
                size="sm"
              />
            )}
          </HStack>
        </Box>
      </Box>

      {/* Data Table */}
      <Box bg={bgColor}>
        <Box p="12px">
          {isLoading && websiteData.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : websiteData.length === 0 ? (
            <Box textAlign="center" py="40px">
              <Text fontSize="lg" color={textColor} mb="8px">
                No website data found
              </Text>
              <Text fontSize="sm" color={textColor}>
                Upload an Excel file to get started
              </Text>
            </Box>
          ) : (
            <>
              <Box
                maxH={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 210px)', xl: 'calc(100vh - 210px)' }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="800px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>ID</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Category</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Service</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Slug URL</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>Operations</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {websiteData.map((row) => (
                      <Tr key={row.id} _hover={{ bg: hoverBg }} transition="all 0.2s">
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" fontWeight="normal">
                            {row.id}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          {row.category_name && (
                            <Badge px="12px" py="4px" borderRadius="full" color={textColor}  fontWeight="normal" borderColor="rgb(32, 33, 36)">
                              {row.category_name}
                            </Badge>
                          )}
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" fontWeight="normal">
                            {row.service_name || '-'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text
                            color={textColor}
                            fontSize="sm"
                            fontWeight="normal"
                            fontFamily="monospace"
                            cursor="pointer"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => row.slug_link && navigator.clipboard.writeText(row.slug_link)}
                            title={row.slug_link || 'No slug URL'}
                          >
                            {row.slug_link || '-'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor} textAlign="center">
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Edit">
                              <IconButton
                                aria-label="Edit"
                                icon={<MdEdit />}
                                size="sm"
                                style={{color: 'rgb(32, 33, 36)'}}
                                variant="ghost"
                                onClick={() => handleEdit(row)}
                              />
                            </Tooltip>
                            <Tooltip label="Preview Page">
                              <IconButton
                                aria-label="Preview"
                                icon={<MdLaunch />}
                                size="sm"
                                style={{color: 'rgb(32, 33, 36)'}}
                                variant="ghost"
                                onClick={() => handlePreview(row)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                aria-label="Delete"
                                icon={<MdDelete />}
                                size="sm"
                                style={{color: 'rgb(32, 33, 36)'}}
                                variant="ghost"
                                onClick={() => {
                                  setSelectedRecord(row);
                                  deleteModal.onOpen();
                                }}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center" mt="6px" pt="6px" borderTop="1px solid" borderColor={borderColor}>
                <Text color={textColor} fontSize="sm">
                  Page {currentPage} of {totalPages} ({totalCount} total)
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
      </Box>

      {/* Upload Confirmation Modal */}
      <Modal isOpen={uploadModal.isOpen} onClose={uploadModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Excel Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Are you sure you want to upload this Excel file?</Text>
            {selectedFile && (
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>File:</strong> {selectedFile.name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={uploadModal.onClose} isDisabled={uploadLoading}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpload}
              isLoading={uploadLoading}
              loadingText="Uploading..."
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Are you sure you want to delete this website data record?</Text>
            {selectedRecord && (
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>ID:</strong> {selectedRecord.id}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Category:</strong> {selectedRecord.category_name || 'N/A'}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Service:</strong> {selectedRecord.service_name || 'N/A'}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete All Confirmation Modal */}
      <Modal isOpen={deleteAllModal.isOpen} onClose={deleteAllModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete All Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>WARNING: This action cannot be undone!</AlertTitle>
                <AlertDescription>
                  <Text fontSize="sm" mt={2}>
                    • All {totalCount} records will be permanently deleted
                  </Text>
                  <Text fontSize="sm">• The next upload will start with ID 1</Text>
                  <Text fontSize="sm">• This will clear the entire website data table</Text>
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteAllModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteAll} isLoading={isLoading}>
              Delete All Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Website Data Modal - Navigate to create page for full form */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Add New Website Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.500">
                For full form with all fields, please use the details page after creation.
              </Text>
              <Input
                placeholder="Service Name *"
                value={formData.serviceName}
                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                isRequired
              />
              <Input
                placeholder="Category Name"
                value={formData.categoryName}
                onChange={(e) => handleInputChange('categoryName', e.target.value)}
              />
              <Input
                placeholder="Slug Link"
                value={formData.slugLink}
                onChange={(e) => handleInputChange('slugLink', e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={createModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={async () => {
                await handleCreateSubmit();
                if (formData.serviceName) {
                  // Navigate to edit the newly created record
                  // This will be handled after creation
                }
              }}
              isLoading={isLoading}
            >
              Create & Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Website Data Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecord && (
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Category
                    </Text>
                    <Text fontSize="sm" fontWeight="500">
                      {selectedRecord.category_name || 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Service
                    </Text>
                    <Text fontSize="sm" fontWeight="500">
                      {selectedRecord.service_name || 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Slug Link
                    </Text>
                    <Text fontSize="sm" fontWeight="500" fontFamily="monospace">
                      {selectedRecord.slug_link || 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Primary Keyword
                    </Text>
                    <Text fontSize="sm" fontWeight="500">
                      {selectedRecord.primary_keyword || 'N/A'}
                    </Text>
                  </Box>
                </SimpleGrid>
                <Button
                  leftIcon={<MdEdit />}
                  colorScheme="brand"
                  onClick={() => {
                    viewModal.onClose();
                    handleEdit(selectedRecord);
                  }}
                >
                  Edit Full Details
                </Button>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={viewModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


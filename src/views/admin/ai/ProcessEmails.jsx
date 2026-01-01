import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  Box,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  IconButton,
  HStack,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight, MdCloudUpload, MdRefresh } from "react-icons/md";
import { fetchEmailDomainAnalysis } from "../../../features/admin/emailDomainAnalysisSlice";
import { showError, showSuccess } from "../../../helpers/messageHelper";

const pageSize = 30;

const ProcessEmails = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const uploadModal = useDisclosure();
  
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [batchName, setBatchName] = useState("");

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        fetchEmailDomainAnalysis({
          page,
          limit: pageSize,
          search: "",
        })
      );
      const data = response?.payload?.data?.data;
      setRows(data?.rows || []);
      setTotalCount(data?.count || 0);
    } catch (error) {
      showError("Failed to load email domain analysis");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, page]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

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
      case 'success':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'processing':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'failed':
      case 'invalid_email':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'website_not_found':
      case 'no_domain':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  const renderStatusTag = (status) => {
    const statusColors = getStatusColorScheme(status);
    return (
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
        _disabled={{
          opacity: 1,
          cursor: 'default',
          bg: statusColors.bg,
          color: statusColors.color,
          borderColor: statusColors.border
        }}
        isDisabled
        cursor="default"
      >
        {status || "—"}
      </Button>
    );
  };

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate CSV file
      const validTypes = ['text/csv', 'application/vnd.ms-excel'];
      const isValidExtension = file.name.toLowerCase().endsWith('.csv');

      if (!validTypes.includes(file.type) && !isValidExtension) {
        showError('Please select a valid CSV file (.csv)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!batchName.trim()) {
      showError('Please enter a batch name');
      return;
    }

    if (!selectedFile) {
      showError('Please select a CSV file');
      return;
    }

    const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("batch_name", batchName.trim());

      await axios.post(`${aiBaseUrl}/api/process`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess("CSV file uploaded successfully");
      uploadModal.onClose();
      setSelectedFile(null);
      setBatchName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh the data after successful upload
      fetchData();
    } catch (error) {
      showError('Failed to upload CSV file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    uploadModal.onClose();
    setSelectedFile(null);
    setBatchName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenUploadModal = () => {
    uploadModal.onOpen();
  };

  const handleRefresh = () => {
    setPage(1);
    fetchData();
  };

  return (
    <>
      <Flex justify="flex-end" align="center" mb="10px" gap="12px">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <Button
          leftIcon={<MdCloudUpload />}
          variant="outline"
          size="sm"
          onClick={handleOpenUploadModal}
          isLoading={isUploading}
          loadingText="Uploading..."
        >
          Upload Emails
        </Button>
        <Button
          leftIcon={<MdRefresh />}
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isDisabled={isLoading}
        >
          Refresh
        </Button>
      </Flex>

      {isLoading && rows.length === 0 ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : (
        <>
          <Box
            flex="1"
            maxH={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 130px)', xl: 'calc(100vh - 130px)' }}
            overflowY="auto"
            overflowX="auto"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
          >
            <Table variant="simple" color="gray.500" minW="2000px">
              <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                <Tr>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    EMAIL
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    DOMAIN
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    WEBSITE
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    BUSINESS NATURE
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    BUSINESS DESCRIPTION
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    BUSINESS MODEL
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    KEY PRODUCTS
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    SPECIAL CATEGORY 1
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    SPECIAL CATEGORY 2
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    SPECIAL CATEGORY 3
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    BATCH ID
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>
                    STATUS
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    ERROR MESSAGE
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    CREATED AT
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>
                    UPDATED AT
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={14} textAlign="center" py="40px">
                      <Text color="black">No records found</Text>
                    </Td>
                  </Tr>
                ) : (
                  rows.map((item, index) => {
                    // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                    const isOddRow = index % 2 === 0;
                    return (
                    <Tr key={item.id} bg={isOddRow ? '#F8FAFD' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.email || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.domain || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="240px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.website || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="240px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.business_nature || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="300px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.business_description || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="300px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.business_model || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="240px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.key_products || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.special_category_1 || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.special_category_2 || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.special_category_3 || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.batch_id || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} textAlign="center">
                        {renderStatusTag(item.status)}
                      </Td>
                      <Td borderColor={borderColor} maxW="240px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.error_message || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {formatDate(item.created_at || item.createdAt)}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {formatDate(item.updated_at || item.updatedAt)}
                        </Text>
                      </Td>
                    </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex justify="space-between" align="center" pt="8px">
            <Text color="black" fontSize="sm">
              Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
            </Text>

            <HStack spacing="8px">
              <IconButton 
                aria-label="Previous page" 
                icon={<MdChevronLeft />} 
                size="sm" 
                onClick={handlePrev} 
                isDisabled={page === 1 || isLoading} 
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
                    isDisabled={isLoading}
                  >
                    {p}
                  </Button>
                ))}
              <IconButton 
                aria-label="Next page" 
                icon={<MdChevronRight />} 
                size="sm" 
                onClick={handleNext} 
                isDisabled={page >= totalPages || isLoading} 
                variant="outline" 
              />
            </HStack>
          </Flex>
        </>
      )}

      {/* Upload CSV Modal */}
      <Modal isOpen={uploadModal.isOpen} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Emails CSV File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {/* Batch Name Field */}
              <FormControl isRequired>
                <FormLabel>Batch Name</FormLabel>
                <Input
                  placeholder="Enter batch name"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  isDisabled={isUploading}
                />
              </FormControl>

              {/* File Upload Field */}
              <FormControl isRequired>
                <FormLabel>CSV File</FormLabel>
                <Button
                  leftIcon={<MdCloudUpload />}
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isDisabled={isUploading}
                  width="100%"
                >
                  {selectedFile ? selectedFile.name : "Choose CSV File"}
                </Button>
                {selectedFile && (
                  <VStack align="stretch" spacing={1} mt={2}>
                    <Text fontSize="sm" color="gray.600">
                      <strong>File:</strong> {selectedFile.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Type:</strong> CSV file
                    </Text>
                  </VStack>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal} isDisabled={isUploading}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={!batchName.trim() || !selectedFile}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProcessEmails;


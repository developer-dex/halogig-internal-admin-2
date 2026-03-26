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
  FormHelperText,
  Input,
  Select,
  Checkbox,
  Divider,
  Card,
  CardBody,
  LinkBox,
  LinkOverlay,
  Heading,
  Badge,
  Icon,
} from "@chakra-ui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCloudUpload,
  MdRefresh,
  MdDownload,
  MdDescription,
} from "react-icons/md";
import { fetchEmailDomainAnalysis } from "../../../features/admin/emailDomainAnalysisSlice";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { UserStatus } from "utils/enums";

/** Exact filenames under `public/sampleFiles` (used for download URLs). */
const SAMPLE_CSV_FILES = [
  "emails_only_format - Sheet1.csv",
  "emails_and_website_links_format - Sheet1.csv",
  "emails_first_name - Sheet1.csv",
  "emails_full_name - Sheet1.csv",
  "emails_full_name_designation - Sheet1.csv",
  "emails_first_name_designation - Sheet1.csv",
];

const formatSampleFileDisplayName = (fileName) => fileName.replace(/_/g, " ");

const ProcessEmails = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const detailsFileInputRef = useRef(null);
  const uploadModal = useDisclosure();
  const uploadDetailsModal = useDisclosure();
  const sampleCsvModal = useDisclosure();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingDetails, setIsUploadingDetails] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [enableNeverbounce, setEnableNeverbounce] = useState(false);
  const [selectedDetailsFile, setSelectedDetailsFile] = useState(null);

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const sampleCardBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const sampleCardHoverBg = useColorModeValue("brand.50", "whiteAlpha.100");
  const sampleCardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const sampleModalHeaderIconBg = useColorModeValue("brand.50", "whiteAlpha.100");
  const sampleCardIconBg = useColorModeValue("white", "whiteAlpha.100");
  const sampleCardHoverShadow = useColorModeValue(
    "0 4px 12px rgba(67, 24, 255, 0.12)",
    "0 4px 14px rgba(0, 0, 0, 0.35)"
  );

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
  }, [dispatch, page, pageSize]);

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
      case UserStatus.APPROVED:
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

  const handleDetailsFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

    setSelectedDetailsFile(file);
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
      formData.append("neverbounce", enableNeverbounce ? "true" : "false");

      await axios.post(`${aiBaseUrl}/api/process`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess("CSV file uploaded successfully");
      uploadModal.onClose();
      setSelectedFile(null);
      setBatchName("");
      setEnableNeverbounce(false);
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
    setEnableNeverbounce(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadDetails = async () => {
    if (!selectedDetailsFile) {
      showError('Please select a CSV file');
      return;
    }

    const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsUploadingDetails(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedDetailsFile);

      await axios.post(`${aiBaseUrl}/api/upload-names`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess("Details file uploaded successfully");
      uploadDetailsModal.onClose();
      setSelectedDetailsFile(null);
      if (detailsFileInputRef.current) {
        detailsFileInputRef.current.value = '';
      }
    } catch (error) {
      showError('Failed to upload details file');
      console.error('Upload details error:', error);
    } finally {
      setIsUploadingDetails(false);
    }
  };

  const handleCloseDetailsModal = () => {
    uploadDetailsModal.onClose();
    setSelectedDetailsFile(null);
    if (detailsFileInputRef.current) {
      detailsFileInputRef.current.value = '';
    }
  };

  const handleOpenUploadModal = () => {
    uploadModal.onOpen();
  };

  const handleRefresh = () => {
    setPage(1);
    fetchData();
  };

  const publicBase = process.env.PUBLIC_URL || "";
  const sampleFileHref = (fileName) =>
    `${publicBase}/sampleFiles/${encodeURIComponent(fileName)}`;

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
        <input
          ref={detailsFileInputRef}
          type="file"
          accept=".csv"
          onChange={handleDetailsFileSelect}
          style={{ display: 'none' }}
        />
        <Button
          leftIcon={<MdDescription />}
          variant="outline"
          size="sm"
          onClick={sampleCsvModal.onOpen}
          borderColor={borderColor}
          _hover={{ borderColor: "brand.500", bg: sampleCardHoverBg }}
        >
          Sample CSV Files
        </Button>
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
          leftIcon={<MdCloudUpload />}
          variant="outline"
          size="sm"
          onClick={uploadDetailsModal.onOpen}
          isLoading={isUploadingDetails}
          loadingText="Uploading..."
        >
          Upload Details
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
            h={{ base: 'calc(100vh - 290px)', md: 'calc(100vh - 250px)', xl: 'calc(100vh - 250px)' }}
            overflowY="auto"
            overflowX="auto"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
          >
            <Table variant="simple" color="gray.500" minW="2000px">
              <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                <Tr>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Email
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Domain
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Website
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Business Nature
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Business Description
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Business Model
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Key Products
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Special Category 1
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Special Category 2
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Special Category 3
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Batch Name
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                    Status
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Error Message
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Created At
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Updated At
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
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.email || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.domain || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="240px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.website || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="240px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.business_nature || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="300px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.business_description || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="300px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.business_model || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="240px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.key_products || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.special_category_1 || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.special_category_2 || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.special_category_3 || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {item.batch_id || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px"  >
                        {renderStatusTag(item.status)}
                      </Td>
                      <Td borderColor={borderColor} maxW="240px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.error_message || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {formatDate(item.created_at || item.createdAt)}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
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
          <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
            <HStack spacing="12px">
              <Text color="black" fontSize="sm">
                Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
              </Text>
              <HStack spacing="8px">
                <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                <Select
                  size="sm"
                  w="80px"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
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

      {/* Upload emails — Chakra Modal + Form + Card preview */}
      <Modal
        isOpen={uploadModal.isOpen}
        onClose={handleCloseModal}
        isCentered
        size="lg"
        motionPreset="slideInBottom"
        closeOnOverlayClick={!isUploading}
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx={4} overflow="hidden">
          <ModalHeader pb={3}>
            <HStack align="flex-start" spacing={3}>
              <Flex
                align="center"
                justify="center"
                w="44px"
                h="44px"
                borderRadius="xl"
                bg={sampleModalHeaderIconBg}
                color="brand.500"
                flexShrink={0}
              >
                <Icon as={MdCloudUpload} boxSize={6} />
              </Flex>
              <Box flex="1" minW={0}>
                <Heading as="h2" size="md" color={textColor} fontWeight="700" lineHeight="short">
                  Upload emails
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1.5} fontWeight="normal">
                  Send a CSV to the processing API with a batch label. Max file size{" "}
                  <Badge variant="subtle" colorScheme="brand" fontSize="0.65em" verticalAlign="middle">
                    10 MB
                  </Badge>
                  .
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isUploading} />
          <ModalBody pt={0}>
            <Divider mb={4} borderColor={borderColor} />
            <VStack align="stretch" spacing={5}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" color={textColor}>
                  Batch name
                </FormLabel>
                <Input
                  placeholder="e.g. Q1 outreach"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  isDisabled={isUploading}
                  size="md"
                  borderColor={borderColor}
                  borderRadius="lg"
                  _hover={{ borderColor: "gray.300" }}
                  _focusVisible={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                  }}
                />
                <FormHelperText mt={1.5}>Shown in the table so you can filter runs by batch.</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" color={textColor}>
                  CSV file
                </FormLabel>
                <Button
                  leftIcon={<Icon as={MdCloudUpload} boxSize={5} />}
                  variant="outline"
                  size="md"
                  w="100%"
                  h="auto"
                  py={3}
                  borderRadius="xl"
                  borderColor={borderColor}
                  onClick={() => fileInputRef.current?.click()}
                  isDisabled={isUploading}
                  _hover={{ borderColor: "brand.400", bg: sampleCardHoverBg }}
                >
                  {selectedFile ? selectedFile.name : "Choose CSV file"}
                </Button>
                {selectedFile && (
                  <Card
                    variant="outline"
                    size="sm"
                    mt={3}
                    borderColor={sampleCardBorder}
                    bg={sampleCardBg}
                    borderRadius="xl"
                  >
                    <CardBody py={3} px={4}>
                      <HStack justify="space-between" align="flex-start" mb={2} spacing={2}>
                        <Text
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.500"
                          textTransform="uppercase"
                          letterSpacing="0.06em"
                        >
                          File preview
                        </Text>
                        <Badge colorScheme="brand" variant="subtle" fontSize="0.65em">
                          CSV
                        </Badge>
                      </HStack>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={textColor}
                        noOfLines={2}
                        wordBreak="break-word"
                      >
                        {selectedFile.name}
                      </Text>
                      <HStack mt={3} spacing={6} flexWrap="wrap">
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            Size
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            Type
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            Comma-separated values
                          </Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                )}
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={enableNeverbounce}
                  onChange={(e) => setEnableNeverbounce(e.target.checked)}
                  isDisabled={isUploading}
                  colorScheme="brand"
                  size="md"
                >
                  <Text as="span" fontWeight="500">
                    Enable Neverbounce
                  </Text>
                </Checkbox>
                <FormHelperText mt={1.5}>
                  When on, addresses can be validated via Neverbounce before processing (if configured on the API).
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pt={2} gap={2} flexWrap="wrap">
            <Button variant="ghost" onClick={handleCloseModal} isDisabled={isUploading}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={!batchName.trim() || !selectedFile}
              borderRadius="lg"
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sample CSV downloads — Chakra Card + LinkBox / LinkOverlay pattern */}
      <Modal
        isOpen={sampleCsvModal.isOpen}
        onClose={sampleCsvModal.onClose}
        isCentered
        size="lg"
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx={4} overflow="hidden">
          <ModalHeader pb={3}>
            <HStack align="flex-start" spacing={3}>
              <Flex
                align="center"
                justify="center"
                w="44px"
                h="44px"
                borderRadius="xl"
                bg={sampleModalHeaderIconBg}
                color="brand.500"
                flexShrink={0}
              >
                <Icon as={MdDescription} boxSize={6} />
              </Flex>
              <Box flex="1" minW={0}>
                <Heading as="h2" size="md" color={textColor} fontWeight="700" lineHeight="short">
                  Sample CSV files
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1.5} fontWeight="normal">
                  Pick a template that matches your columns. Each row downloads the matching file from{" "}
                  <Badge variant="subtle" colorScheme="brand" fontSize="0.65em" verticalAlign="middle">
                    /sampleFiles
                  </Badge>
                  .
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={0}>
            <Divider mb={4} borderColor={borderColor} />
            <VStack align="stretch" spacing={3} maxH="55vh" overflowY="auto" pr={1} sx={{ scrollbarGutter: "stable" }}>
              {SAMPLE_CSV_FILES.map((fileName) => (
                <LinkBox
                  key={fileName}
                  as={Card}
                  variant="outline"
                  size="sm"
                  borderColor={sampleCardBorder}
                  bg={sampleCardBg}
                  borderRadius="xl"
                  transition="all 0.2s ease"
                  cursor="pointer"
                  role="group"
                  _hover={{
                    borderColor: "brand.400",
                    bg: sampleCardHoverBg,
                    transform: "translateY(-2px)",
                    boxShadow: sampleCardHoverShadow,
                  }}
                  _focusWithin={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                  }}
                >
                  <CardBody py={3.5} px={4}>
                    <Flex align="center" justify="space-between" gap={3}>
                      <HStack align="flex-start" spacing={3} flex="1" minW={0}>
                        <Flex
                          align="center"
                          justify="center"
                          flexShrink={0}
                          w="40px"
                          h="40px"
                          borderRadius="lg"
                          bg={sampleCardIconBg}
                          border="1px solid"
                          borderColor={borderColor}
                          color="brand.500"
                          transition="colors 0.2s"
                          _groupHover={{ borderColor: "brand.300", color: "brand.600" }}
                        >
                          <Icon as={MdDescription} boxSize={5} />
                        </Flex>
                        <Box minW={0}>
                          <Heading
                            as="h3"
                            size="sm"
                            fontWeight="600"
                            color={textColor}
                            noOfLines={2}
                            lineHeight="tall"
                          >
                            <LinkOverlay
                              href={sampleFileHref(fileName)}
                              download={fileName}
                              _hover={{ textDecoration: "none" }}
                            >
                              {formatSampleFileDisplayName(fileName)}
                            </LinkOverlay>
                          </Heading>
                          <HStack mt={1.5} spacing={2} flexWrap="wrap">
                            <Badge colorScheme="brand" variant="subtle" fontSize="0.65em" textTransform="uppercase">
                              CSV
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              Template
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>
                      <Flex
                        align="center"
                        justify="center"
                        w="40px"
                        h="40px"
                        borderRadius="lg"
                        bg="brand.500"
                        color="white"
                        flexShrink={0}
                        transition="transform 0.2s"
                        _groupHover={{ transform: "scale(1.05)" }}
                        aria-hidden
                      >
                        <Icon as={MdDownload} boxSize={5} />
                      </Flex>
                    </Flex>
                  </CardBody>
                </LinkBox>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter pt={2} gap={2}>
            <Button variant="ghost" onClick={sampleCsvModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload details — Chakra Modal + Form + Card preview */}
      <Modal
        isOpen={uploadDetailsModal.isOpen}
        onClose={handleCloseDetailsModal}
        isCentered
        size="lg"
        motionPreset="slideInBottom"
        closeOnOverlayClick={!isUploadingDetails}
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx={4} overflow="hidden">
          <ModalHeader pb={3}>
            <HStack align="flex-start" spacing={3}>
              <Flex
                align="center"
                justify="center"
                w="44px"
                h="44px"
                borderRadius="xl"
                bg={sampleModalHeaderIconBg}
                color="brand.500"
                flexShrink={0}
              >
                <Icon as={MdCloudUpload} boxSize={6} />
              </Flex>
              <Box flex="1" minW={0}>
                <Heading as="h2" size="md" color={textColor} fontWeight="700" lineHeight="short">
                  Upload details
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1.5} fontWeight="normal">
                  Upload a supplementary CSV to{" "}
                  <Badge variant="subtle" colorScheme="brand" fontSize="0.65em" verticalAlign="middle">
                    /api/upload-names
                  </Badge>
                  . Same limits as email upload.
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isUploadingDetails} />
          <ModalBody pt={0}>
            <Divider mb={4} borderColor={borderColor} />
            <VStack align="stretch" spacing={5}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" color={textColor}>
                  CSV file
                </FormLabel>
                <Button
                  leftIcon={<Icon as={MdCloudUpload} boxSize={5} />}
                  variant="outline"
                  size="md"
                  w="100%"
                  h="auto"
                  py={3}
                  borderRadius="xl"
                  borderColor={borderColor}
                  onClick={() => detailsFileInputRef.current?.click()}
                  isDisabled={isUploadingDetails}
                  _hover={{ borderColor: "brand.400", bg: sampleCardHoverBg }}
                >
                  {selectedDetailsFile ? selectedDetailsFile.name : "Choose CSV file"}
                </Button>
                <FormHelperText mt={1.5}>
                  Must be a valid <Badge variant="outline" fontSize="0.65em">.csv</Badge> file under 10 MB.
                </FormHelperText>
                {selectedDetailsFile && (
                  <Card
                    variant="outline"
                    size="sm"
                    mt={3}
                    borderColor={sampleCardBorder}
                    bg={sampleCardBg}
                    borderRadius="xl"
                  >
                    <CardBody py={3} px={4}>
                      <HStack justify="space-between" align="flex-start" mb={2} spacing={2}>
                        <Text
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.500"
                          textTransform="uppercase"
                          letterSpacing="0.06em"
                        >
                          File preview
                        </Text>
                        <Badge colorScheme="brand" variant="subtle" fontSize="0.65em">
                          CSV
                        </Badge>
                      </HStack>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={textColor}
                        noOfLines={2}
                        wordBreak="break-word"
                      >
                        {selectedDetailsFile.name}
                      </Text>
                      <HStack mt={3} spacing={6} flexWrap="wrap">
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            Size
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {(selectedDetailsFile.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">
                            Type
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            Comma-separated values
                          </Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pt={2} gap={2} flexWrap="wrap">
            <Button variant="ghost" onClick={handleCloseDetailsModal} isDisabled={isUploadingDetails}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUploadDetails}
              isLoading={isUploadingDetails}
              loadingText="Uploading..."
              isDisabled={!selectedDetailsFile}
              borderRadius="lg"
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


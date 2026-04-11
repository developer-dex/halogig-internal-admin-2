import React, { useCallback, useEffect, useState, useRef } from "react";
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
  Tooltip,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCloudUpload,
  MdRefresh,
  MdDownload,
  MdDescription,
  MdVisibility,
} from "react-icons/md";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { UserStatus } from "utils/enums";

/** Exact filenames under `public/sampleFiles` (used for download URLs). */
const SAMPLE_CSV_FILES = [
  "emails_only_format - Sheet1.csv",
  "email and name format - Sheet1.csv",
];

const formatSampleFileDisplayName = (fileName) => fileName.replace(/_/g, " ");

const BATCH_TABS = [
  { label: "All",         type: "all" },
  { label: "Neverbounce", type: "neverbounce" },
  { label: "Exa",        type: "exa" },
];

/** Instantly campaign_schedule.days: "0" = Sunday … "6" = Saturday */
const CAMPAIGN_SCHEDULE_UI_DAYS = [
  { label: "Sunday", apiKey: "0" },
  { label: "Monday", apiKey: "1" },
  { label: "Tuesday", apiKey: "2" },
  { label: "Wednesday", apiKey: "3" },
  { label: "Thursday", apiKey: "4" },
  { label: "Friday", apiKey: "5" },
  { label: "Saturday", apiKey: "6" },
];

/** Default: Monday–Friday on (matches prior weekday default). */
const defaultScheduleDays = () => ({
  "0": false,
  "1": true,
  "2": true,
  "3": true,
  "4": true,
  "5": true,
  "6": false,
});

/** Fixed timezone sent in campaign_schedule (no user picker). */
const CAMPAIGN_SCHEDULE_TIMEZONE = "Asia/Kolkata";

/* ─────────────────────────────────────────────────────────────────────────────
   Main ProcessEmails component
───────────────────────────────────────────────────────────────────────────── */
const ProcessEmails = () => {
  const fileInputRef = useRef(null);
  const uploadModal = useDisclosure();
  const sampleCsvModal = useDisclosure();

  /* Batch list state */
  const [selectedBatch, setSelectedBatch] = useState(null);

  /* Inline detail-view state */
  const [detailTabIndex, setDetailTabIndex] = useState(0);
  const [detailPage, setDetailPage]         = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(50);
  const [detailEmails, setDetailEmails]     = useState([]);
  const [detailTotal, setDetailTotal]       = useState(0);
  const [detailTPages, setDetailTPages]     = useState(1);
  const [detailLoading, setDetailLoading]   = useState(false);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [enableNeverbounce, setEnableNeverbounce] = useState(true);
  const [scheduleFrom, setScheduleFrom] = useState("09:00");
  const [scheduleTo, setScheduleTo] = useState("17:00");
  const [scheduleDays, setScheduleDays] = useState(() => defaultScheduleDays());

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

  const fetchData = useCallback(async () => {
    const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
      return;
    }

    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const { data } = await axios.get(`${aiBaseUrl}/api/batches`, {
        params: { limit: pageSize, offset },
      });

      if (!data?.success) {
        showError(data?.message || "Failed to load batches");
        setRows([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }

      setRows(Array.isArray(data.batches) ? data.batches : []);
      setTotalCount(typeof data.total_count === "number" ? data.total_count : 0);
      const pages =
        typeof data.total_pages === "number" && data.total_pages >= 1
          ? data.total_pages
          : Math.max(1, Math.ceil((data.total_count || 0) / pageSize));
      setTotalPages(pages);
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to load batches");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatYesNo = (value) => {
    if (value === 1 || value === true || value === "1") return "Yes";
    if (value === 0 || value === false || value === "0") return "No";
    return "—";
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

  /* ── Detail-view data fetch ── */
  const detailType = BATCH_TABS[detailTabIndex]?.type || "all";

  const fetchDetailData = useCallback(async () => {
    if (!selectedBatch?.batch_id) return;
    const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    setDetailLoading(true);
    try {
      const offset = (detailPage - 1) * detailPageSize;
      const { data } = await axios.get(
        `${aiBaseUrl}/api/batch/${selectedBatch.batch_id}/data`,
        { params: { type: detailType, limit: detailPageSize, offset } },
      );
      if (!data?.success) {
        showError(data?.message || "Failed to load batch data");
        setDetailEmails([]);
        setDetailTotal(0);
        setDetailTPages(1);
        return;
      }
      setDetailEmails(Array.isArray(data.emails) ? data.emails : []);
      const tc = typeof data.total_count === "number" ? data.total_count : 0;
      setDetailTotal(tc);
      const tp =
        typeof data.total_pages === "number" && data.total_pages >= 1
          ? data.total_pages
          : Math.max(1, Math.ceil(tc / detailPageSize));
      setDetailTPages(tp);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to load batch data");
      setDetailEmails([]);
      setDetailTotal(0);
      setDetailTPages(1);
    } finally {
      setDetailLoading(false);
    }
  }, [selectedBatch?.batch_id, detailType, detailPage, detailPageSize]);

  useEffect(() => {
    if (selectedBatch) fetchDetailData();
  }, [fetchDetailData, selectedBatch]);

  /* Reset detail page when tab changes */
  useEffect(() => {
    setDetailPage(1);
    setDetailEmails([]);
    setDetailTotal(0);
    setDetailTPages(1);
  }, [detailTabIndex, selectedBatch?.batch_id]);

  const detailStatusColorMap = (status) => {
    switch ((status || "").toLowerCase()) {
      case "valid": case "success": case "completed": case "complete": return "green";
      case "invalid": case "failed": case "disposable": return "red";
      case "unknown": case "catchall": return "orange";
      case "processing": return "blue";
      default: return "gray";
    }
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


  const toggleScheduleDay = (apiKey) => {
    setScheduleDays((prev) => ({ ...prev, [apiKey]: !prev[apiKey] }));
  };

  const buildCampaignSchedulePayload = () =>
    JSON.stringify({
      schedules: [
        {
          name: "Default",
          timing: { from: scheduleFrom, to: scheduleTo },
          days: { ...scheduleDays },
          timezone: CAMPAIGN_SCHEDULE_TIMEZONE,
        },
      ],
    });

  const handleUpload = async () => {
    if (!batchName.trim()) {
      showError('Please enter a batch name');
      return;
    }

    if (!selectedFile) {
      showError('Please select a CSV file');
      return;
    }

    if (!Object.values(scheduleDays).some(Boolean)) {
      showError("Select at least one day for the campaign schedule");
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
      formData.append("campaign_schedule", buildCampaignSchedulePayload());

      await axios.post(`${aiBaseUrl}/api/process`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess("CSV file uploaded successfully");
      uploadModal.onClose();
      setSelectedFile(null);
      setBatchName("");
      setEnableNeverbounce(true);
      setScheduleFrom("09:00");
      setScheduleTo("17:00");
      setScheduleDays(defaultScheduleDays());
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
    setEnableNeverbounce(true);
    setScheduleFrom("09:00");
    setScheduleTo("17:00");
    setScheduleDays(defaultScheduleDays());
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

  const handleViewBatch = (batch) => {
    setDetailTabIndex(0);
    setDetailPage(1);
    setDetailEmails([]);
    setDetailTotal(0);
    setDetailTPages(1);
    setSelectedBatch(batch);
  };

  const handleBackToList = () => {
    setSelectedBatch(null);
    setDetailTabIndex(0);
    setDetailPage(1);
    setDetailEmails([]);
    setDetailTotal(0);
    setDetailTPages(1);
  };

  const handleDetailTabChange = (idx) => {
    setDetailTabIndex(idx);
    setDetailPage(1);
  };

  const publicBase = process.env.PUBLIC_URL || "";
  const sampleFileHref = (fileName) =>
    `${publicBase}/sampleFiles/${encodeURIComponent(fileName)}`;

  return (
    <>
      {/* Hidden file inputs always present */}
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} />

      {/* ── TOOLBAR: left = back+tabs (detail) or nothing (list), right = action buttons always ── */}
      <Flex justify="space-between" align="center" mb="10px" gap="12px" flexWrap="wrap">
        {/* Left side */}
        {selectedBatch ? (
          <HStack spacing="8px" flexWrap="wrap">
            <Button
              leftIcon={<MdChevronLeft />}
              size="sm"
              variant="outline"
              onClick={handleBackToList}
              borderColor={borderColor}
              _hover={{ borderColor: "brand.500" }}
            >
              Back
            </Button>
            {BATCH_TABS.map((t, idx) => (
              <Button
                key={t.type}
                size="sm"
                variant={detailTabIndex === idx ? "solid" : "outline"}
                colorScheme={detailTabIndex === idx ? "brand" : "gray"}
                onClick={() => handleDetailTabChange(idx)}
                borderColor={borderColor}
              >
                {t.label}
              </Button>
            ))}
          </HStack>
        ) : (
          <Box />
        )}

        {/* Right side — always visible */}
        <HStack spacing="12px" flexWrap="wrap">
          <Button leftIcon={<MdDescription />} variant="outline" size="sm" onClick={sampleCsvModal.onOpen} borderColor={borderColor} _hover={{ borderColor: "brand.500", bg: sampleCardHoverBg }}>
            Sample CSV Files
          </Button>
          <Button leftIcon={<MdCloudUpload />} variant="outline" size="sm" onClick={handleOpenUploadModal} isLoading={isUploading} loadingText="Uploading...">
            Upload Emails
          </Button>
          <Button
            leftIcon={<MdRefresh />}
            variant="outline"
            size="sm"
            onClick={selectedBatch ? fetchDetailData : handleRefresh}
            isDisabled={selectedBatch ? detailLoading : isLoading}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* ── CONTENT AREA ── */}
      {selectedBatch ? (
        /* ══ DETAIL VIEW ══ */
        <>
          {(detailLoading && detailEmails.length === 0) ? (
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
                <Table variant="simple" color="gray.500" minW="1200px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      {[
                        "Email", "Domain", "Contact Name",
                        "Business Nature", "Business Description", "Key Products",
                        "Special Cat. 1",
                        ...(detailType !== "exa" ? ["NB Result", "NB Status", "Pipeline Status", "Valid"] : []),
                      ].map((h) => (
                        <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor} whiteSpace="nowrap">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {detailEmails.length === 0 ? (
                      <Tr>
                        <Td colSpan={detailType !== "exa" ? 11 : 7} textAlign="center" py="40px">
                          <Text color="gray.400" fontSize="sm">No records found for this filter.</Text>
                        </Td>
                      </Tr>
                    ) : (
                      detailEmails.map((em, idx) => (
                        <Tr key={`${em.email || ""}-${idx}`} bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }}>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                            <Text fontSize="sm" color={textColor} noOfLines={1} title={em.email}>{em.email || "—"}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text fontSize="sm" color={textColor}>{em.domain || "—"}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text fontSize="sm" color={textColor}>{em.contact_name || "—"}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="180px">
                            <Text fontSize="sm" color={textColor} noOfLines={1} title={em.business_nature}>{em.business_nature || "—"}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="240px">
                            <Text fontSize="sm" color={textColor} noOfLines={2} title={em.business_description}>{em.business_description || "—"}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                            <Text fontSize="sm" color={textColor} noOfLines={1} title={em.key_products}>{em.key_products || "—"}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text fontSize="sm" color={textColor}>{em.special_category_1 || "—"}</Text>
                          </Td>
                          {detailType !== "exa" && (
                            <>
                              <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                                {em.neverbounce_result
                                  ? <Badge colorScheme={detailStatusColorMap(em.neverbounce_result)} variant="subtle" fontSize="0.7em" textTransform="capitalize">{em.neverbounce_result}</Badge>
                                  : <Text fontSize="sm" color="gray.400">—</Text>}
                              </Td>
                              <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                                {em.neverbounce_status
                                  ? <Badge colorScheme={detailStatusColorMap(em.neverbounce_status)} variant="subtle" fontSize="0.7em" textTransform="capitalize">{em.neverbounce_status}</Badge>
                                  : <Text fontSize="sm" color="gray.400">—</Text>}
                              </Td>
                              <Td borderColor={borderColor} pt="8px" pb="8px">
                                <Text fontSize="sm" color={textColor}>{em.pipeline_status || "—"}</Text>
                              </Td>
                              <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                                <Badge colorScheme={em.is_valid === 1 || em.is_valid === true ? "green" : "red"} variant="subtle" fontSize="0.7em">
                                  {em.is_valid === 1 || em.is_valid === true ? "Yes" : "No"}
                                </Badge>
                              </Td>
                            </>
                          )}
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Detail pagination */}
              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">{detailEmails.length}</Text> of {detailTotal}
                  </Text>
                  <HStack spacing="6px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                    <Select size="sm" w="76px" value={detailPageSize} onChange={(e) => { setDetailPageSize(Number(e.target.value)); setDetailPage(1); }} borderColor={borderColor} _hover={{ borderColor: "brand.500" }}>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                    </Select>
                  </HStack>
                </HStack>
                <HStack spacing="6px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setDetailPage((p) => Math.max(1, p - 1))} isDisabled={detailPage === 1 || detailLoading} variant="outline" />
                  {Array.from({ length: Math.min(detailTPages, 10) }, (_, i) => i + 1).map((p) => (
                    <Button key={p} size="sm" variant={detailPage === p ? "solid" : "outline"} colorScheme={detailPage === p ? "brand" : "gray"} onClick={() => setDetailPage(p)} isDisabled={detailLoading}>{p}</Button>
                  ))}
                  {detailTPages > 10 && <Text fontSize="sm" color="gray.400">…{detailTPages} total</Text>}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setDetailPage((p) => Math.min(detailTPages, p + 1))} isDisabled={detailPage >= detailTPages || detailLoading} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </>
      ) : (
        /* ══ BATCH LIST VIEW ══ */
        <>
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
                <Table variant="simple" color="gray.500" minW="1500px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Batch ID</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Batch Name</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Total Emails</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Processed</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>Status</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>Neverbounce</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>NB Status</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>CSV Type</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Categorised</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Validated</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Discarded</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Created At</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>Updated At</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={14} textAlign="center" py="40px">
                          <Text color="black">No batches found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((item, index) => {
                        const isOddRow = index % 2 === 0;
                        const rowKey = item.batch_id || item.batch_name || String(index);
                        return (
                          <Tr key={rowKey} bg={isOddRow ? '#F8FAFD' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor} maxW="200px" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={item.batch_id}>{item.batch_id || "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.batch_name || "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.total_emails ?? "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.processed_count ?? "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              {renderStatusTag(item.status)}
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">{formatYesNo(item.neverbounce_enabled)}</Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              {item.neverbounce_status ? renderStatusTag(item.neverbounce_status) : <Text color={textColor} fontSize="sm">—</Text>}
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.csv_type || "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.total_categorised ?? "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.total_validated ?? "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{item.total_discarded ?? "—"}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{formatDate(item.created_at)}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{formatDate(item.updated_at)}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                              <Tooltip label="View batch emails" hasArrow placement="top">
                                <IconButton
                                  aria-label="View batch emails"
                                  icon={<Icon as={MdVisibility} boxSize={4} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="brand"
                                  onClick={() => handleViewBatch(item)}
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

              {/* List pagination */}
              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
                  </Text>
                  <HStack spacing="8px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                    <Select size="sm" w="80px" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} borderColor={borderColor} _hover={{ borderColor: 'brand.500' }}>
                      <option value={10}>10</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                    </Select>
                  </HStack>
                </HStack>
                <HStack spacing="8px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={handlePrev} isDisabled={page === 1 || isLoading} variant="outline" />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                    <Button key={p} size="sm" variant={page === p ? 'solid' : 'outline'} colorScheme={page === p ? 'brand' : 'gray'} onClick={() => setPage(p)} isDisabled={isLoading}>{p}</Button>
                  ))}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={handleNext} isDisabled={page >= totalPages || isLoading} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </>
      )}

      {/* Upload emails — Chakra Modal + Form + Card preview */}
      <Modal
        isOpen={uploadModal.isOpen}
        onClose={handleCloseModal}
        isCentered
        size="xl"
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
                  Upload starts the enrichment pipeline and auto-creates an Instantly campaign. Max file size{" "}
                  <Badge variant="subtle" colorScheme="brand" fontSize="0.65em" verticalAlign="middle">
                    10 MB
                  </Badge>
                  .
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isUploading} />
          <ModalBody pt={0} maxH="70vh" overflowY="auto">
            <Divider mb={4} borderColor={borderColor} />
            <VStack align="stretch" spacing={5}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" color={textColor}>
                  Campaign name
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
                <FormHelperText mt={1.5}>
                  Must be unique. Used as the Instantly campaign name and shown in the batch list.
                </FormHelperText>
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

              <FormControl isRequired>
                <FormLabel fontWeight="600" color={textColor}>
                  Instantly campaign schedule
                </FormLabel>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  Send times and active days for the auto-created Instantly campaign. Days use Sunday = 0 … Saturday = 6 in the API payload.
                </Text>
                <HStack spacing={4} flexWrap="wrap" align="flex-end" mb={4}>
                  <FormControl w={{ base: "100%", sm: "140px" }}>
                    <FormLabel fontSize="sm" color={textColor}>From</FormLabel>
                    <Input
                      type="time"
                      value={scheduleFrom}
                      onChange={(e) => setScheduleFrom(e.target.value)}
                      isDisabled={isUploading}
                      size="md"
                      borderColor={borderColor}
                    />
                  </FormControl>
                  <FormControl w={{ base: "100%", sm: "140px" }}>
                    <FormLabel fontSize="sm" color={textColor}>To</FormLabel>
                    <Input
                      type="time"
                      value={scheduleTo}
                      onChange={(e) => setScheduleTo(e.target.value)}
                      isDisabled={isUploading}
                      size="md"
                      borderColor={borderColor}
                    />
                  </FormControl>
                  <FormControl flex="1" minW="200px">
                    <FormLabel fontSize="sm" color={textColor}>Timezone</FormLabel>
                    <Box
                      py={2}
                      px={3}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg={sampleCardBg}
                    >
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        {CAMPAIGN_SCHEDULE_TIMEZONE}
                      </Text>
                    </Box>
                  </FormControl>
                </HStack>
                <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={2}>
                  Active days
                </FormLabel>
                <SimpleGrid columns={{ base: 2, sm: 4, md: 7 }} spacing={3}>
                  {CAMPAIGN_SCHEDULE_UI_DAYS.map(({ label, apiKey }) => (
                    <Checkbox
                      key={apiKey}
                      isChecked={scheduleDays[apiKey]}
                      onChange={() => toggleScheduleDay(apiKey)}
                      isDisabled={isUploading}
                      colorScheme="brand"
                      size="md"
                    >
                      <Text as="span" fontSize="sm" fontWeight="500" color={textColor}>{label}</Text>
                    </Checkbox>
                  ))}
                </SimpleGrid>
                <FormHelperText mt={2}>
                  Sent as <Badge variant="outline" fontSize="0.65em">campaign_schedule</Badge> JSON on the upload request.
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
              isDisabled={
                !batchName.trim()
                || !selectedFile
                || !Object.values(scheduleDays).some(Boolean)
              }
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

    </>
  );
};

export default ProcessEmails;


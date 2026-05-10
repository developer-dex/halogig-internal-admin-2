import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCloudUpload,
  MdDescription,
  MdDownload,
  MdRefresh,
  MdVisibility,
} from "react-icons/md";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

const SAMPLE_CSV_FILES = [
  "emails_only_format - Sheet1.csv",
  "email and name format - Sheet1.csv",
];

const CAMPAIGN_SCHEDULE_UI_DAYS = [
  { label: "Sunday", apiKey: "0" },
  { label: "Monday", apiKey: "1" },
  { label: "Tuesday", apiKey: "2" },
  { label: "Wednesday", apiKey: "3" },
  { label: "Thursday", apiKey: "4" },
  { label: "Friday", apiKey: "5" },
  { label: "Saturday", apiKey: "6" },
];

const defaultScheduleDays = () => ({
  "0": false,
  "1": true,
  "2": true,
  "3": true,
  "4": true,
  "5": true,
  "6": false,
});

const CAMPAIGN_SCHEDULE_TIMEZONE = "Asia/Kolkata";

const humanizeSnake = (value) => {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  if (!s) return "";
  return s
    .split("_")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

const LIST_TABS = [
  { label: "All", pipeline_status: "" },
  { label: "Neverbounce", pipeline_status: "neverbounce_validated" },
  { label: "Exa", pipeline_status: "exa_validated" },
];

const formatSampleFileDisplayName = (name) => name.replace(/_/g, " ");

const ProcessEmailsV2 = () => {
  const fileInputRef = useRef(null);
  const uploadModal = useDisclosure();
  const sampleCsvModal = useDisclosure();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [detailTabIndex, setDetailTabIndex] = useState(0);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(50);
  const [detailRows, setDetailRows] = useState([]);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailTotalPages, setDetailTotalPages] = useState(1);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [batchName, setBatchName] = useState("");
  const [enableNeverbounce, setEnableNeverbounce] = useState(true);
  const [scheduleFrom, setScheduleFrom] = useState("09:00");
  const [scheduleTo, setScheduleTo] = useState("17:00");
  const [scheduleDays, setScheduleDays] = useState(() => defaultScheduleDays());
  const [isUploading, setIsUploading] = useState(false);

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
    "0 4px 14px rgba(0, 0, 0, 0.35)",
  );

  const aiBaseUrl = getAiV2BaseUrl();

  const fetchBatches = useCallback(async () => {
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
      const { data } = await axios.get(`${aiBaseUrl}/batches`, {
        params: { limit: pageSize, offset },
      });
      if (data?.success === false) {
        showError(data?.message || "Failed to load batches");
        setRows([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }

      const list = Array.isArray(data?.batches) ? data.batches : [];
      setRows(list);
      const tc = typeof data?.total_count === "number" ? data.total_count : 0;
      setTotalCount(tc);
      const tp =
        typeof data?.total_pages === "number" && data.total_pages >= 1
          ? data.total_pages
          : Math.max(1, Math.ceil(tc / pageSize));
      setTotalPages(tp);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load batches");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [aiBaseUrl, page, pageSize]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const selectedPipelineStatus = LIST_TABS[detailTabIndex]?.pipeline_status ?? "";

  const fetchBatchData = useCallback(async () => {
    if (!aiBaseUrl) return;
    if (!selectedBatch?.batch_id) return;

    setDetailLoading(true);
    try {
      const offset = (detailPage - 1) * detailPageSize;
      const params = {
        limit: detailPageSize,
        offset,
      };
      if (selectedPipelineStatus) params.pipeline_status = selectedPipelineStatus;

      const { data } = await axios.get(`${aiBaseUrl}/batch/${selectedBatch.batch_id}/data`, {
        params,
      });
      if (data?.success === false) {
        showError(data?.message || "Failed to load batch emails");
        setDetailRows([]);
        setDetailTotal(0);
        setDetailTotalPages(1);
        return;
      }

      const list = Array.isArray(data?.emails) ? data.emails : [];
      setDetailRows(list);
      const tc = typeof data?.total_count === "number" ? data.total_count : 0;
      setDetailTotal(tc);
      setDetailTotalPages(Math.max(1, Math.ceil(tc / detailPageSize)));
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load batch emails");
      setDetailRows([]);
      setDetailTotal(0);
      setDetailTotalPages(1);
    } finally {
      setDetailLoading(false);
    }
  }, [aiBaseUrl, selectedBatch?.batch_id, detailPage, detailPageSize, selectedPipelineStatus]);

  useEffect(() => {
    if (selectedBatch) fetchBatchData();
  }, [selectedBatch, fetchBatchData]);

  useEffect(() => {
    setDetailPage(1);
    setDetailRows([]);
    setDetailTotal(0);
    setDetailTotalPages(1);
  }, [detailTabIndex, selectedBatch?.batch_id]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isCsv = file.name.toLowerCase().endsWith(".csv");
    const okType = file.type === "text/csv" || file.type === "application/vnd.ms-excel" || isCsv;
    if (!okType) {
      showError("Please select a valid CSV file (.csv)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
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

  const resetUploadForm = () => {
    setSelectedFile(null);
    setBatchName("");
    setEnableNeverbounce(true);
    setScheduleFrom("09:00");
    setScheduleTo("17:00");
    setScheduleDays(defaultScheduleDays());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    if (!batchName.trim()) {
      showError("Please enter a batch name");
      return;
    }
    if (!selectedFile) {
      showError("Please select a CSV file");
      return;
    }
    if (!Object.values(scheduleDays).some(Boolean)) {
      showError("Select at least one day for the campaign schedule");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("batch_name", batchName.trim());
      formData.append("neverbounce", enableNeverbounce ? "true" : "false");
      formData.append("campaign_schedule", buildCampaignSchedulePayload());

      const res = await axios.post(`${aiBaseUrl}/process`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 202,
      });

      if (res?.data?.success === false) {
        showError(res?.data?.message || "Upload failed");
        return;
      }

      showSuccess("CSV uploaded. Processing started.");
      uploadModal.onClose();
      resetUploadForm();
      setPage(1);
      fetchBatches();
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to upload CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setDetailTabIndex(0);
    setDetailPage(1);
  };

  const handleBackToList = () => {
    setSelectedBatch(null);
    setDetailTabIndex(0);
    setDetailPage(1);
    setDetailRows([]);
    setDetailTotal(0);
    setDetailTotalPages(1);
  };

  const formatDate = (ds) => {
    if (!ds) return "—";
    try {
      return new Date(ds).toLocaleString();
    } catch {
      return String(ds);
    }
  };

  const renderEmailStatus = (raw) => {
    if (raw == null || raw === "") return <Text fontSize="sm" color="gray.400">—</Text>;
    const s = String(raw).trim();
    if (s === "" || s.toUpperCase() === "NULL") return <Text fontSize="sm" color="gray.400">—</Text>;
    const key = s.toLowerCase();
    if (key === "sent_to_instantly") {
      return (
        <Badge colorScheme="green" variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
          Sent to Instantly
        </Badge>
      );
    }
    if (key === "email_generated") {
      return (
        <Badge colorScheme="blue" variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
          Email generated
        </Badge>
      );
    }
    return (
      <Badge colorScheme="gray" variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
        {humanizeSnake(s)}
      </Badge>
    );
  };

  const publicBase = process.env.PUBLIC_URL || "";
  const sampleFileHref = (fileName) => `${publicBase}/sampleFiles/${encodeURIComponent(fileName)}`;

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} style={{ display: "none" }} />

      <Flex justify="space-between" align="center" mb="10px" gap="12px" flexWrap="wrap">
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
            {LIST_TABS.map((t, idx) => (
              <Button
                key={t.label}
                size="sm"
                variant={detailTabIndex === idx ? "solid" : "outline"}
                colorScheme={detailTabIndex === idx ? "brand" : "gray"}
                onClick={() => setDetailTabIndex(idx)}
                borderColor={borderColor}
              >
                {t.label}
              </Button>
            ))}
          </HStack>
        ) : (
          <Box />
        )}

        <HStack spacing="12px" flexWrap="wrap">
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
          <Button leftIcon={<MdCloudUpload />} variant="outline" size="sm" onClick={uploadModal.onOpen} isLoading={isUploading}>
            Upload Emails
          </Button>
          <Button
            leftIcon={<MdRefresh />}
            variant="outline"
            size="sm"
            onClick={selectedBatch ? fetchBatchData : fetchBatches}
            isDisabled={selectedBatch ? detailLoading : isLoading}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {selectedBatch ? (
        <>
          {detailLoading && detailRows.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                flex="1"
                h={{ base: "calc(100vh - 290px)", md: "calc(100vh - 250px)", xl: "calc(100vh - 250px)" }}
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
                        "Email",
                        "Domain",
                        "Contact Name",
                        "Business Nature",
                        "Business Description",
                        "Key Products",
                        "Pipeline Status",
                        "Email Status",
                        "Neverbounce Result",
                        "Valid",
                      ].map((h) => (
                        <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor} whiteSpace="nowrap">
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {detailRows.length === 0 ? (
                      <Tr>
                        <Td colSpan={10} textAlign="center" py="40px">
                          <Text color="gray.400" fontSize="sm">
                            No records found for this filter.
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      detailRows.map((em, idx) => (
                        <Tr key={`${em.email || ""}-${idx}`} bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }}>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="220px">
                            <Text fontSize="sm" color={textColor} noOfLines={1} title={em.email}>
                              {em.email || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text fontSize="sm" color={textColor}>
                              {em.domain || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text fontSize="sm" color={textColor}>
                              {em.contact_name || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                            <Text fontSize="sm" color={textColor} noOfLines={1} title={em.business_nature}>
                              {em.business_nature || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="280px">
                            <Text fontSize="sm" color={textColor} noOfLines={2} title={em.business_description}>
                              {em.business_description || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="240px">
                            <Text fontSize="sm" color={textColor} noOfLines={1} title={em.key_products}>
                              {em.key_products || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text fontSize="sm" color={textColor}>
                              {humanizeSnake(em.pipeline_status) || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                            {renderEmailStatus(em.email_status)}
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                            {em.neverbounce_result ? (
                              <Badge colorScheme="gray" variant="subtle" fontSize="0.7em" textTransform="none">
                                {humanizeSnake(em.neverbounce_result)}
                              </Badge>
                            ) : (
                              <Text fontSize="sm" color="gray.400">
                                —
                              </Text>
                            )}
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                            <Badge colorScheme={em.is_valid === 1 || em.is_valid === true ? "green" : "red"} variant="subtle" fontSize="0.7em">
                              {em.is_valid === 1 || em.is_valid === true ? "Yes" : "No"}
                            </Badge>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing{" "}
                    <Text as="span" fontWeight="700" color="brand.500">
                      {detailRows.length}
                    </Text>{" "}
                    of {detailTotal}
                  </Text>
                  <HStack spacing="6px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">
                      Per page:
                    </Text>
                    <Select
                      size="sm"
                      w="76px"
                      value={detailPageSize}
                      onChange={(e) => {
                        setDetailPageSize(Number(e.target.value));
                        setDetailPage(1);
                      }}
                      borderColor={borderColor}
                      _hover={{ borderColor: "brand.500" }}
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                    </Select>
                  </HStack>
                </HStack>
                <HStack spacing="6px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setDetailPage((p) => Math.max(1, p - 1))} isDisabled={detailPage === 1 || detailLoading} variant="outline" />
                  {Array.from({ length: Math.min(detailTotalPages, 10) }, (_, i) => i + 1).map((p) => (
                    <Button key={p} size="sm" variant={detailPage === p ? "solid" : "outline"} colorScheme={detailPage === p ? "brand" : "gray"} onClick={() => setDetailPage(p)} isDisabled={detailLoading}>
                      {p}
                    </Button>
                  ))}
                  {detailTotalPages > 10 && <Text fontSize="sm" color="gray.400">…{detailTotalPages} total</Text>}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setDetailPage((p) => Math.min(detailTotalPages, p + 1))} isDisabled={detailPage >= detailTotalPages || detailLoading} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </>
      ) : (
        <>
          {isLoading && rows.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                flex="1"
                h={{ base: "calc(100vh - 290px)", md: "calc(100vh - 250px)", xl: "calc(100vh - 250px)" }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="1500px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      {[
                        "Batch ID",
                        "Batch Name",
                        "Total Emails",
                        "Processed",
                        "Status",
                        "Neverbounce",
                        "CSV Type",
                        "Enriched",
                        "Validated",
                        "Discarded",
                        "Created At",
                        "Updated At",
                        "Actions",
                      ].map((h) => (
                        <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor} whiteSpace="nowrap" textAlign={h === "Actions" ? "center" : "left"}>
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={13} textAlign="center" py="40px">
                          <Text color="black">No batches found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((item, index) => (
                        <Tr key={String(item.batch_id ?? item.batch_name ?? index)} bg={index % 2 === 0 ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }}>
                          <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                            <Text color={textColor} fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={item.batch_id}>
                              {item.batch_id || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.batch_name || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.total_emails ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.processed_count ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                            <Badge variant="subtle" colorScheme="gray" fontSize="0.7em" textTransform="none">
                              {humanizeSnake(item.status) || "—"}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                            <Text color={textColor} fontSize="sm">
                              {item.neverbounce_enabled === true || item.neverbounce_enabled === 1 ? "Yes" : "No"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {humanizeSnake(item.csv_type) || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.total_enriched ?? item.total_categorised ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.total_validated ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {item.total_discarded ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {formatDate(item.created_at)}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm">
                              {formatDate(item.updated_at)}
                            </Text>
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
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing{" "}
                    <Text as="span" fontWeight="700" color="brand.500">
                      {rows.length}
                    </Text>{" "}
                    of {totalCount}
                  </Text>
                  <HStack spacing="8px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">
                      Per page:
                    </Text>
                    <Select
                      size="sm"
                      w="80px"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      borderColor={borderColor}
                      _hover={{ borderColor: "brand.500" }}
                    >
                      <option value={10}>10</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                    </Select>
                  </HStack>
                </HStack>
                <HStack spacing="8px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1 || isLoading} variant="outline" />
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                    <Button key={p} size="sm" variant={page === p ? "solid" : "outline"} colorScheme={page === p ? "brand" : "gray"} onClick={() => setPage(p)} isDisabled={isLoading}>
                      {p}
                    </Button>
                  ))}
                  {totalPages > 10 && <Text fontSize="sm" color="gray.400">…{totalPages} total</Text>}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} isDisabled={page >= totalPages || isLoading} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </>
      )}

      <Modal
        isOpen={uploadModal.isOpen}
        onClose={() => {
          if (!isUploading) {
            resetUploadForm();
            uploadModal.onClose();
          }
        }}
        isCentered
        size="xl"
        motionPreset="slideInBottom"
        closeOnOverlayClick={!isUploading}
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx={4} overflow="hidden">
          <ModalHeader pb={3}>
            <HStack align="flex-start" spacing={3}>
              <Flex align="center" justify="center" w="44px" h="44px" borderRadius="xl" bg={sampleModalHeaderIconBg} color="brand.500" flexShrink={0}>
                <Icon as={MdCloudUpload} boxSize={6} />
              </Flex>
              <Box flex="1" minW={0}>
                <Heading as="h2" size="md" color={textColor} fontWeight="700" lineHeight="short">
                  Upload emails (V2)
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1.5} fontWeight="normal">
                  Upload starts the V2 pipeline and auto-creates an Instantly campaign.
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
                  placeholder="e.g. v2_batch_may"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  isDisabled={isUploading}
                  size="md"
                  borderColor={borderColor}
                  borderRadius="lg"
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
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" color={textColor}>
                  Instantly campaign schedule
                </FormLabel>
                <HStack spacing={4} flexWrap="wrap" align="flex-end" mb={4}>
                  <FormControl w={{ base: "100%", sm: "140px" }}>
                    <FormLabel fontSize="sm" color={textColor}>
                      From
                    </FormLabel>
                    <Input type="time" value={scheduleFrom} onChange={(e) => setScheduleFrom(e.target.value)} isDisabled={isUploading} size="md" borderColor={borderColor} />
                  </FormControl>
                  <FormControl w={{ base: "100%", sm: "140px" }}>
                    <FormLabel fontSize="sm" color={textColor}>
                      To
                    </FormLabel>
                    <Input type="time" value={scheduleTo} onChange={(e) => setScheduleTo(e.target.value)} isDisabled={isUploading} size="md" borderColor={borderColor} />
                  </FormControl>
                  <FormControl flex="1" minW="200px">
                    <FormLabel fontSize="sm" color={textColor}>
                      Timezone
                    </FormLabel>
                    <Box py={2} px={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={sampleCardBg}>
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
                      <Text as="span" fontSize="sm" fontWeight="500" color={textColor}>
                        {label}
                      </Text>
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
            <Button variant="ghost" onClick={() => { resetUploadForm(); uploadModal.onClose(); }} isDisabled={isUploading}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={!batchName.trim() || !selectedFile || !Object.values(scheduleDays).some(Boolean)}
              borderRadius="lg"
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={sampleCsvModal.isOpen} onClose={sampleCsvModal.onClose} isCentered size="lg" motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" mx={4} overflow="hidden">
          <ModalHeader pb={3}>
            <HStack align="flex-start" spacing={3}>
              <Flex align="center" justify="center" w="44px" h="44px" borderRadius="xl" bg={sampleModalHeaderIconBg} color="brand.500" flexShrink={0}>
                <Icon as={MdDescription} boxSize={6} />
              </Flex>
              <Box flex="1" minW={0}>
                <Heading as="h2" size="md" color={textColor} fontWeight="700" lineHeight="short">
                  Sample CSV files
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1.5} fontWeight="normal">
                  Download a template from <Badge variant="subtle" colorScheme="brand" fontSize="0.65em">/sampleFiles</Badge>.
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
                          <Heading as="h3" size="sm" fontWeight="600" color={textColor} noOfLines={2} lineHeight="tall">
                            <LinkOverlay href={sampleFileHref(fileName)} download={fileName} _hover={{ textDecoration: "none" }}>
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
                      <Flex align="center" justify="center" w="40px" h="40px" borderRadius="lg" bg="brand.500" color="white" flexShrink={0} transition="transform 0.2s" _groupHover={{ transform: "scale(1.05)" }} aria-hidden>
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

export default ProcessEmailsV2;


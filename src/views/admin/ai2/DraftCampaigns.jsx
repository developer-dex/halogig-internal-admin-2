import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Select,
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
  VStack,
} from "@chakra-ui/react";
import { MdArrowBack, MdChevronLeft, MdChevronRight, MdRefresh, MdVisibility } from "react-icons/md";
import { showError } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

const formatDate = (ds) => {
  if (!ds) return "—";
  try {
    return new Date(ds).toLocaleString();
  } catch {
    return String(ds);
  }
};

const statusScheme = (s) => {
  switch ((s || "").toLowerCase()) {
    case "completed":
    case "generated":
      return "green";
    case "running":
    case "processing":
    case "pending":
      return "blue";
    case "failed":
      return "red";
    default:
      return "gray";
  }
};

const DRAFT_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "generated", label: "Generated" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const DraftCampaignsV2 = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  const aiBaseUrl = getAiV2BaseUrl();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftPage, setDraftPage] = useState(1);
  const [draftPageSize, setDraftPageSize] = useState(50);
  const [draftRows, setDraftRows] = useState([]);
  const [draftTotal, setDraftTotal] = useState(0);
  const [draftTotalPages, setDraftTotalPages] = useState(1);
  const [draftLoading, setDraftLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
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
      const { data } = await axios.get(`${aiBaseUrl}/draft/campaigns`, { params: { limit: pageSize, offset } });
      if (data?.success === false) {
        showError(data?.message || "Failed to load draft campaigns");
        setRows([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      const list = Array.isArray(data?.campaigns) ? data.campaigns : [];
      setRows(list);
      const tc = typeof data?.total_count === "number" ? data.total_count : 0;
      setTotalCount(tc);
      setTotalPages(Math.max(1, Math.ceil(tc / pageSize)));
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load draft campaigns");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [aiBaseUrl, page, pageSize]);

  useEffect(() => {
    if (selectedCampaign) return;
    fetchCampaigns();
  }, [fetchCampaigns, selectedCampaign]);

  const fetchDrafts = useCallback(async () => {
    if (!aiBaseUrl) return;
    if (!selectedCampaign?.batch_name) return;
    setDraftLoading(true);
    try {
      const offset = (draftPage - 1) * draftPageSize;
      const params = { limit: draftPageSize, offset };
      if (draftStatus) params.status = draftStatus;

      const { data } = await axios.get(
        `${aiBaseUrl}/draft/by-batch/${encodeURIComponent(selectedCampaign.batch_name)}`,
        { params },
      );
      if (data?.success === false) {
        showError(data?.message || "Failed to load drafts");
        setDraftRows([]);
        setDraftTotal(0);
        setDraftTotalPages(1);
        return;
      }
      const list = Array.isArray(data?.drafts) ? data.drafts : [];
      setDraftRows(list);
      const tc = typeof data?.total_count === "number" ? data.total_count : 0;
      setDraftTotal(tc);
      setDraftTotalPages(Math.max(1, Math.ceil(tc / draftPageSize)));
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load drafts");
      setDraftRows([]);
      setDraftTotal(0);
      setDraftTotalPages(1);
    } finally {
      setDraftLoading(false);
    }
  }, [aiBaseUrl, selectedCampaign?.batch_name, draftPage, draftPageSize, draftStatus]);

  useEffect(() => {
    if (!selectedCampaign) return;
    fetchDrafts();
  }, [selectedCampaign, fetchDrafts]);

  useEffect(() => {
    setDraftPage(1);
  }, [draftStatus, draftPageSize, selectedCampaign?.batch_name]);

  const openCampaign = (c) => {
    setSelectedCampaign(c);
    setDraftStatus("");
    setDraftPage(1);
    setDraftPageSize(50);
    setDraftRows([]);
    setDraftTotal(0);
    setDraftTotalPages(1);
  };

  const backToCampaigns = () => {
    setSelectedCampaign(null);
    setDraftStatus("");
    setDraftPage(1);
    setDraftPageSize(50);
    setDraftRows([]);
    setDraftTotal(0);
    setDraftTotalPages(1);
  };

  return (
    <Box>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={4} mb={4} flexWrap="wrap">
        <Box minW={{ base: "100%", md: "420px" }}>
          <Heading as="h1" size="md" color={textColor} fontWeight="700">
            Draft Campaigns (V2)
          </Heading>
          <Text fontSize="sm" color={subtleText} mt={1}>
            Browse draft campaigns and drill down into drafts by batch.
          </Text>
        </Box>
        <HStack spacing={2} flexWrap="wrap">
          {!selectedCampaign ? (
            <Select
              size="sm"
              w={{ base: "140px", md: "160px" }}
              borderColor={borderColor}
              bg={bgColor}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Campaigns per page"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </Select>
          ) : null}
          {selectedCampaign ? (
            <Button leftIcon={<MdArrowBack />} size="sm" variant="outline" onClick={backToCampaigns} borderColor={borderColor} bg={bgColor}>
              Back
            </Button>
          ) : null}
          <Button
            leftIcon={<MdRefresh />}
            size="sm"
            variant="outline"
            onClick={selectedCampaign ? fetchDrafts : fetchCampaigns}
            isDisabled={selectedCampaign ? draftLoading : isLoading}
            borderColor={borderColor}
            bg={bgColor}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {selectedCampaign ? (
        <VStack align="stretch" spacing={4}>
          <Flex gap={3} flexWrap="wrap" align="flex-end">
            <Box>
              <Text fontSize="sm" fontWeight="700" color={textColor}>
                Batch: {selectedCampaign.batch_name || "—"}
              </Text>
              <Text fontSize="xs" color={subtleText}>
                Campaign ID: {selectedCampaign.campaign_id || "—"}
              </Text>
            </Box>

            <Box flex="1" />

            <Box w={{ base: "100%", md: "220px" }}>
              <Text fontSize="sm" color={textColor} fontWeight="600" mb={1}>
                Status
              </Text>
              <Select size="sm" borderColor={borderColor} bg={bgColor} value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}>
                {DRAFT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Box>

            <Box w={{ base: "100%", md: "160px" }}>
              <Text fontSize="sm" color={textColor} fontWeight="600" mb={1}>
                Per page
              </Text>
              <Select size="sm" borderColor={borderColor} bg={bgColor} value={draftPageSize} onChange={(e) => setDraftPageSize(Number(e.target.value))}>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </Select>
            </Box>
          </Flex>

          {draftLoading && draftRows.length === 0 ? (
            <Flex justify="center" py={12}>
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="8px" bg={bgColor}>
                <Table variant="simple" color="gray.500" minW="1200px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      {["Recipient", "Subject", "Status", "Word count", "Created"].map((h) => (
                        <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor} whiteSpace="nowrap">
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {draftRows.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={10} borderColor={borderColor}>
                          <Text color="gray.500" fontSize="sm">
                            No drafts found.
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      draftRows.map((d, idx) => (
                        <Tr key={`${d.draft_id || d.recipient_email || "draft"}-${idx}`} bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }}>
                          <Td borderColor={borderColor} maxW="260px">
                            <Text color={textColor} fontSize="sm" noOfLines={1} title={d.recipient_email}>
                              {d.recipient_email || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} maxW="420px">
                            <Text color={textColor} fontSize="sm" noOfLines={2} title={d.email_subject}>
                              {d.email_subject || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Badge colorScheme={statusScheme(d.status)} variant="subtle" fontSize="0.7em" textTransform="none">
                              {d.status || "—"}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {d.word_count ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {formatDate(d.created_at)}
                            </Text>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <Text color="black" fontSize="sm">
                  Showing{" "}
                  <Text as="span" fontWeight="700" color="brand.500">
                    {draftRows.length}
                  </Text>{" "}
                  of {draftTotal}
                </Text>
                <HStack spacing="8px">
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setDraftPage((p) => Math.max(1, p - 1))} isDisabled={draftPage === 1 || draftLoading} variant="outline" />
                  {Array.from({ length: Math.min(draftTotalPages, 10) }, (_, i) => i + 1).map((p) => (
                    <Button key={p} size="sm" variant={draftPage === p ? "solid" : "outline"} colorScheme={draftPage === p ? "brand" : "gray"} onClick={() => setDraftPage(p)} isDisabled={draftLoading}>
                      {p}
                    </Button>
                  ))}
                  {draftTotalPages > 10 && <Text fontSize="sm" color="gray.400">…{draftTotalPages} total</Text>}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setDraftPage((p) => Math.min(draftTotalPages, p + 1))} isDisabled={draftPage >= draftTotalPages || draftLoading} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </VStack>
      ) : (
        <>
          {isLoading && rows.length === 0 ? (
            <Flex justify="center" py={12}>
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="8px" bg={bgColor}>
                <Table variant="simple" color="gray.500" minW="1200px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      {["Campaign ID", "Batch name", "Category", "Status", "Total emails", "Generated", "Failed", "Created", "Actions"].map((h) => (
                        <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor} whiteSpace="nowrap" textAlign={h === "Actions" ? "center" : "left"}>
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={9} textAlign="center" py={10} borderColor={borderColor}>
                          <Text color="gray.500" fontSize="sm">
                            No draft campaigns found.
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((c, idx) => (
                        <Tr key={`${c.campaign_id || "camp"}-${idx}`} bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }}>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm" noOfLines={1} title={c.campaign_id}>
                              {c.campaign_id || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {c.batch_name || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} maxW="260px">
                            <Text color={textColor} fontSize="sm" noOfLines={2} title={c.category_name}>
                              {c.category_name || "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Badge colorScheme={statusScheme(c.status)} variant="subtle" fontSize="0.7em" textTransform="none">
                              {c.status || "—"}
                            </Badge>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {c.total_emails ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {c.emails_generated ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {c.emails_failed ?? "—"}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm">
                              {formatDate(c.created_at)}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} textAlign="center">
                            <Tooltip label="View drafts by batch" hasArrow placement="top">
                              <IconButton
                                aria-label="View drafts"
                                icon={<MdVisibility />}
                                size="sm"
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => openCampaign(c)}
                                isDisabled={!c?.batch_name}
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
                <Text color="black" fontSize="sm">
                  Showing{" "}
                  <Text as="span" fontWeight="700" color="brand.500">
                    {rows.length}
                  </Text>{" "}
                  of {totalCount}
                </Text>
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
    </Box>
  );
};

export default DraftCampaignsV2;


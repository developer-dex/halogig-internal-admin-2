import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
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
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight, MdRefresh } from "react-icons/md";
import { showError } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

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

const EMAIL_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All email statuses" },
  { value: "sent_to_instantly", label: "Sent to Instantly" },
  { value: "email_generated", label: "Email generated" },
];

const PRESET_OPTIONS = [
  { value: "all", label: "Everything", params: {} },
  { value: "valid", label: "Only valid emails", params: { pipeline_status: "neverbounce_validated" } },
  { value: "discarded", label: "Only discarded", params: { pipeline_status: "discarded" } },
  { value: "sent_to_instantly", label: "Only sent to Instantly", params: { pipeline_status: "sent_to_instantly" } },
  { value: "neverbounce_validated", label: "Neverbounce validated", params: { pipeline_status: "neverbounce_validated" } },
  { value: "exa_validated", label: "Exa validated", params: { pipeline_status: "exa_validated" } },
];

const nbBadgeScheme = (v) => {
  switch ((v || "").toLowerCase()) {
    case "valid":
    case "success":
      return "green";
    case "invalid":
    case "failed":
      return "red";
    case "catchall":
    case "unknown":
      return "orange";
    default:
      return "gray";
  }
};

const CentralDataRecordsV2 = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [preset, setPreset] = useState("all");
  const [batchName, setBatchName] = useState("");
  const [batchNames, setBatchNames] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [emailStatusFilter, setEmailStatusFilter] = useState("");

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const aiBaseUrl = getAiV2BaseUrl();

  const fetchBatchNames = useCallback(async () => {
    if (!aiBaseUrl) return;
    setLoadingBatches(true);
    try {
      const { data } = await axios.get(`${aiBaseUrl}/batch-names`);
      const raw = data?.batch_names;
      setBatchNames(Array.isArray(raw) ? raw.filter(Boolean).map(String) : []);
    } catch {
      setBatchNames([]);
    } finally {
      setLoadingBatches(false);
    }
  }, [aiBaseUrl]);

  useEffect(() => {
    fetchBatchNames();
  }, [fetchBatchNames]);

  const fetchCombined = useCallback(async () => {
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
      return;
    }

    const presetCfg = PRESET_OPTIONS.find((p) => p.value === preset) || PRESET_OPTIONS[0];
    const offset = (page - 1) * pageSize;
    const params = {
      limit: pageSize,
      offset,
      ...presetCfg.params,
    };
    if (batchName.trim()) params.batch_name = batchName.trim();
    if (emailStatusFilter) params.email_status = emailStatusFilter;

    setIsLoading(true);
    try {
      const { data } = await axios.get(`${aiBaseUrl}/combined/all`, { params });
      if (data?.success === false) {
        showError(data?.message || "Failed to load combined records");
        setRows([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      const list = Array.isArray(data?.emails) ? data.emails : [];
      setRows(list);
      const tc = typeof data?.total_count === "number" ? data.total_count : 0;
      setTotalCount(tc);
      setTotalPages(Math.max(1, Math.ceil(tc / pageSize)));
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load combined records");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [aiBaseUrl, batchName, emailStatusFilter, page, pageSize, preset]);

  useEffect(() => {
    fetchCombined();
  }, [fetchCombined]);

  const formatDate = (ds) => {
    if (!ds) return "—";
    try {
      return new Date(ds).toLocaleString();
    } catch {
      return String(ds);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={4} mb={4} flexWrap="wrap">
        <Box minW={{ base: "100%", md: "360px" }}>
          <Heading as="h1" size="md" color={textColor} fontWeight="700">
            Central Data Records (V2)
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Unified records across all V2 batches. Filter by batch, pipeline status, and email status.
          </Text>
        </Box>

        <HStack spacing={2}>
          <Button leftIcon={<MdRefresh />} size="sm" variant="outline" onClick={fetchCombined} isDisabled={isLoading} borderColor={borderColor} bg={bgColor}>
            Refresh
          </Button>
        </HStack>
      </Flex>

      <Flex gap={3} mb={4} flexWrap="wrap">
        <FormControl w={{ base: "100%", md: "240px" }}>
          <FormLabel fontSize="sm" color={textColor}>
            Preset
          </FormLabel>
          <Select
            size="sm"
            borderColor={borderColor}
            bg={bgColor}
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value);
              setPage(1);
            }}
          >
            {PRESET_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl w={{ base: "100%", md: "260px" }}>
          <FormLabel fontSize="sm" color={textColor}>
            Batch name
          </FormLabel>
          <Select
            size="sm"
            borderColor={borderColor}
            bg={bgColor}
            placeholder={loadingBatches ? "Loading..." : "All batches"}
            value={batchName}
            onChange={(e) => {
              setBatchName(e.target.value);
              setPage(1);
            }}
            isDisabled={loadingBatches}
          >
            {batchNames.map((n) => (
              <option key={String(n)} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl w={{ base: "100%", md: "240px" }}>
          <FormLabel fontSize="sm" color={textColor}>
            Email status
          </FormLabel>
          <Select
            size="sm"
            borderColor={borderColor}
            bg={bgColor}
            value={emailStatusFilter}
            onChange={(e) => {
              setEmailStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            {EMAIL_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl w={{ base: "100%", md: "160px" }}>
          <FormLabel fontSize="sm" color={textColor}>
            Per page
          </FormLabel>
          <Select
            size="sm"
            borderColor={borderColor}
            bg={bgColor}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </Select>
        </FormControl>
      </Flex>

      {isLoading && rows.length === 0 ? (
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : (
        <>
          <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="8px" bg={bgColor}>
            <Table variant="simple" color="gray.500" minW="1300px">
              <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                <Tr>
                  {["Email", "Domain", "Contact", "Business nature", "Pipeline", "Email status", "NB result", "Valid", "Created"].map((h) => (
                    <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor} whiteSpace="nowrap">
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
                        No records found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  rows.map((r, idx) => (
                    <Tr key={`${r.email || "row"}-${idx}`} bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }}>
                      <Td borderColor={borderColor} maxW="260px">
                        <Text color={textColor} fontSize="sm" noOfLines={1} title={r.email}>
                          {r.email || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm">
                          {r.domain || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="220px">
                        <Text color={textColor} fontSize="sm" noOfLines={1} title={r.contact_name}>
                          {r.contact_name || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="220px">
                        <Text color={textColor} fontSize="sm" noOfLines={1} title={r.business_nature}>
                          {r.business_nature || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="gray" variant="subtle" fontSize="0.7em" textTransform="none">
                          {humanizeSnake(r.pipeline_status) || "—"}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>{renderEmailStatus(r.email_status)}</Td>
                      <Td borderColor={borderColor}>
                        {r.neverbounce_result ? (
                          <Badge colorScheme={nbBadgeScheme(r.neverbounce_result)} variant="subtle" fontSize="0.7em" textTransform="none">
                            {humanizeSnake(r.neverbounce_result)}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.400">
                            —
                          </Text>
                        )}
                      </Td>
                      <Td borderColor={borderColor} textAlign="center">
                        <Badge colorScheme={r.is_valid === 1 || r.is_valid === true ? "green" : "red"} variant="subtle" fontSize="0.7em">
                          {r.is_valid === 1 || r.is_valid === true ? "Yes" : "No"}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={textColor} fontSize="sm">
                          {formatDate(r.created_at)}
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
    </Box>
  );
};

export default CentralDataRecordsV2;


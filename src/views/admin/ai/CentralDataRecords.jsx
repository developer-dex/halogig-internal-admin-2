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
  Icon,
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

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

/**
 * Presets for GET /api/combined/all
 * "valid" uses is_valid=1 (see API docs if your backend expects a different param).
 */
const PRESET_OPTIONS = [
  { value: "all", label: "Everything", params: {} },
  { value: "valid", label: "Only valid emails", params: { is_valid: "1" } },
  { value: "discarded", label: "Only discarded", params: { pipeline_status: "discarded" } },
  { value: "sent_to_instantly", label: "Only sent to Instantly", params: { pipeline_status: "sent_to_instantly" } },
  { value: "neverbounce_validated", label: "Neverbounce validated", params: { pipeline_status: "neverbounce_validated" } },
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

const CentralDataRecords = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [preset, setPreset] = useState("all");
  const [batchName, setBatchName] = useState("");
  const [batchNames, setBatchNames] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const fetchBatchNames = useCallback(async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) return;
    setLoadingBatches(true);
    try {
      const { data } = await axios.get(`${aiBaseUrl}/api/draft/batch-names`);
      const raw = data?.batch_names;
      const list = Array.isArray(raw)
        ? raw.map((n) => (typeof n === "string" ? n : n?.batch_name ?? "")).filter(Boolean)
        : [];
      setBatchNames(list);
    } catch (e) {
      console.error("CentralDataRecords — batch-names:", e);
      setBatchNames([]);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    fetchBatchNames();
  }, [fetchBatchNames]);

  const fetchCombined = useCallback(async () => {
    const aiBaseUrl = getAiBaseUrl();
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
    if (batchName.trim()) {
      params.batch_name = batchName.trim();
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get(`${aiBaseUrl}/api/combined/all`, { params });

      if (data?.success === false) {
        showError(data?.message || "Failed to load combined records");
        setRows([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }

      setRows(Array.isArray(data.emails) ? data.emails : []);
      const tc = typeof data.total_count === "number" ? data.total_count : 0;
      setTotalCount(tc);
      const tp =
        typeof data.total_pages === "number" && data.total_pages >= 1
          ? data.total_pages
          : Math.max(1, Math.ceil(tc / pageSize));
      setTotalPages(tp);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load combined records");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, preset, batchName]);

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

  const formatYesNo = (value) => {
    if (value === 1 || value === true || value === "1") return "Yes";
    if (value === 0 || value === false || value === "0") return "No";
    return "—";
  };

  const handlePresetChange = (e) => {
    setPreset(e.target.value);
    setPage(1);
  };

  const handleBatchChange = (e) => {
    setBatchName(e.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchBatchNames();
    fetchCombined();
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Box>
      <Heading as="h1" size="lg" color={textColor} fontWeight="700" mb={2}>
        Central Data Records
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={4} maxW="3xl">
        Unified email records across all batches. Filter by pipeline or batch, then paginate with{" "}
        <Text as="span" fontFamily="mono" fontSize="xs">GET /api/combined/all</Text>.
      </Text>

      <Flex justify="space-between" align="center" mb="10px" gap="12px" flexWrap="wrap">
        <HStack spacing={3} flexWrap="wrap" flex="1" align="flex-end">
          <FormControl maxW="240px" minW="160px">
            <FormLabel fontSize="sm" mb={1} color={textColor}>
              View
            </FormLabel>
            <Select
              size="sm"
              value={preset}
              onChange={handlePresetChange}
              borderColor={borderColor}
              _hover={{ borderColor: "brand.500" }}
            >
              {PRESET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW="280px" minW="180px">
            <FormLabel fontSize="sm" mb={1} color={textColor}>
              Batch name
            </FormLabel>
            <Select
              size="sm"
              value={batchName}
              onChange={handleBatchChange}
              isDisabled={loadingBatches}
              borderColor={borderColor}
              _hover={{ borderColor: "brand.500" }}
            >
              <option value="">{loadingBatches ? "Loading…" : "All batches"}</option>
              {batchNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>
        <Button
          leftIcon={<Icon as={MdRefresh} />}
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isDisabled={isLoading}
          borderColor={borderColor}
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
            h={{ base: "calc(100vh - 290px)", md: "calc(100vh - 250px)", xl: "calc(100vh - 250px)" }}
            overflowY="auto"
            overflowX="auto"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
          >
            <Table variant="simple" color="gray.500" minW="3200px">
              <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                <Tr>
                  {[
                    "ID",
                    "Batch ID",
                    "Batch Name",
                    "Email",
                    "Domain",
                    "Contact",
                    "First name",
                    "Full name",
                    "Designation",
                    "Business nature",
                    "Business description",
                    "Business model",
                    "Key products",
                    "Website",
                    "Sp. cat 1",
                    "Sp. cat 2",
                    "Sp. cat 3",
                    "NB result",
                    "NB status",
                    "NB validated",
                    "Pipeline",
                    "Valid",
                    "Validation date",
                    "Created",
                    "Updated",
                  ].map((h) => (
                    <Th
                      key={h}
                      borderColor={borderColor}
                      color="black"
                      fontSize="xs"
                      fontWeight="700"
                      textTransform="capitalize"
                      bg={bgColor}
                      whiteSpace="nowrap"
                    >
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={25} textAlign="center" py="40px" borderColor={borderColor}>
                      <Text color="black">No records found</Text>
                    </Td>
                  </Tr>
                ) : (
                  rows.map((em, index) => {
                    const isOdd = index % 2 === 0;
                    const rk = em.id ?? `${em.email}-${index}`;
                    return (
                      <Tr key={rk} bg={isOdd ? "#F8FAFD" : "transparent"} _hover={{ bg: hoverBg }} transition="all 0.2s">
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.id ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="180px">
                          <Text fontSize="sm" color={textColor} noOfLines={1} title={em.batch_id}>{em.batch_id || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.batch_name || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                          <Text fontSize="sm" color={textColor} noOfLines={1} title={em.email}>{em.email || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.domain || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.contact_name ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.first_name ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.full_name ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.designation ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="160px">
                          <Text fontSize="sm" color={textColor} noOfLines={1} title={em.business_nature}>{em.business_nature || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="220px">
                          <Text fontSize="sm" color={textColor} noOfLines={2} title={em.business_description}>{em.business_description || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                          <Text fontSize="sm" color={textColor} noOfLines={2} title={em.business_model}>{em.business_model || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                          <Text fontSize="sm" color={textColor} noOfLines={1} title={em.key_products}>{em.key_products || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" maxW="180px">
                          <Text fontSize="sm" color={textColor} noOfLines={1} title={em.website}>{em.website || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.special_category_1 ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.special_category_2 ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.special_category_3 ?? "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                          {em.neverbounce_result ? (
                            <Badge colorScheme={nbBadgeScheme(em.neverbounce_result)} variant="subtle" fontSize="0.7em" textTransform="capitalize">
                              {em.neverbounce_result}
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.400">—</Text>
                          )}
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                          {em.neverbounce_status ? (
                            <Badge colorScheme={nbBadgeScheme(em.neverbounce_status)} variant="subtle" fontSize="0.7em" textTransform="capitalize">
                              {em.neverbounce_status}
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.400">—</Text>
                          )}
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                          <Text fontSize="sm" color={textColor}>{formatYesNo(em.neverbounce_validated)}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{em.pipeline_status || "—"}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                          <Badge
                            colorScheme={em.is_valid === 1 || em.is_valid === true ? "green" : "red"}
                            variant="subtle"
                            fontSize="0.7em"
                          >
                            {em.is_valid === 1 || em.is_valid === true ? "Yes" : "No"}
                          </Badge>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{formatDate(em.validation_date)}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{formatDate(em.created_at)}</Text>
                        </Td>
                        <Td borderColor={borderColor} pt="8px" pb="8px">
                          <Text fontSize="sm" color={textColor}>{formatDate(em.updated_at)}</Text>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>

          <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
            <HStack spacing="12px">
              <Text color="black" fontSize="sm">
                Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
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
                    variant={page === p ? "solid" : "outline"}
                    colorScheme={page === p ? "brand" : "gray"}
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
    </Box>
  );
};

export default CentralDataRecords;

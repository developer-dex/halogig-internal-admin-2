import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
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
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
  MdExpandMore,
} from "react-icons/md";
import { showError } from "../../../helpers/messageHelper";

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

/** snake_case → Title Case */
const humanize = (value) => {
  if (value == null || value === "") return "";
  return String(value)
    .trim()
    .split("_")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

const formatDate = (ds) => {
  if (!ds) return "—";
  try { return new Date(ds).toLocaleString(); } catch { return String(ds); }
};

const statusScheme = (s) => {
  switch ((s || "").toLowerCase()) {
    case "completed": return "green";
    case "running":
    case "processing": return "blue";
    case "failed": return "red";
    case "pending": return "orange";
    default: return "gray";
  }
};

const DRAFT_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "generated", label: "Generated" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Multi-select for special categories — trigger matches
 * `CentralDataRecords` native `Select` (size="sm", border, hover).
 */
const SpecialCategoryDropdown = ({
  options,
  selected,
  onChange,
  borderColor,
  textColor,
  bgColor,
  panelBg,
  rowHoverBg,
}) => {
  const triggerLabel =
    selected.length === 0
      ? "All special categories"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} categories selected`;

  const toggleItem = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <Popover placement="bottom-start" matchWidth gutter={4} closeOnBlur>
      <PopoverTrigger>
        <Button
          size="sm"
          variant="outline"
          w="100%"
          h="32px"
          minH="32px"
          px={3}
          fontWeight="normal"
          fontSize="sm"
          color={textColor}
          bg={bgColor}
          borderColor={borderColor}
          borderRadius="md"
          _hover={{ borderColor: "brand.500", bg: bgColor }}
          _active={{ bg: bgColor }}
          justifyContent="space-between"
          rightIcon={<Icon as={MdExpandMore} boxSize={5} color="gray.500" />}
        >
          <Text as="span" noOfLines={1} textAlign="left" flex="1" pr={2}>
            {triggerLabel}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="md"
        bg={panelBg}
        _focus={{ outline: "none" }}
      >
        <PopoverBody p={0}>
          {options.length === 0 ? (
            <Text fontSize="sm" color="gray.500" px={3} py={3}>
              No categories available
            </Text>
          ) : (
            <>
              <VStack align="stretch" spacing={0} maxH="240px" overflowY="auto" py={1}>
                {options.map(({ special_category_value, draft_count }) => (
                  <Flex
                    key={special_category_value}
                    align="center"
                    justify="space-between"
                    gap={2}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: rowHoverBg }}
                    onClick={() => toggleItem(special_category_value)}
                  >
                    <Checkbox
                      isChecked={selected.includes(special_category_value)}
                      onChange={() => toggleItem(special_category_value)}
                      colorScheme="brand"
                      size="sm"
                      pointerEvents="none"
                    >
                      <Text fontSize="sm" color={textColor} ml={1} noOfLines={2}>
                        {special_category_value}
                      </Text>
                    </Checkbox>
                    <Badge
                      colorScheme="gray"
                      variant="subtle"
                      fontSize="0.65em"
                      borderRadius="md"
                      flexShrink={0}
                    >
                      {draft_count}
                    </Badge>
                  </Flex>
                ))}
              </VStack>
              <Divider borderColor={borderColor} />
              <Flex justify="flex-end" px={2} py={2}>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  isDisabled={selected.length === 0}
                  onClick={() => onChange([])}
                >
                  Clear selection
                </Button>
              </Flex>
            </>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */

const DraftCampaigns = () => {
  /* ── shared ── */
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const popoverPanelBg = useColorModeValue("#FFFFFF", "gray.800");
  const popoverRowHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  /* ── special categories (for dropdown filter) ── */
  const [specialCategories, setSpecialCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  /* ── campaign list ── */
  const [campaigns, setCampaigns] = useState([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  /* ── drill-down: selected batch ── */
  const [selectedBatch, setSelectedBatch] = useState(null);

  /* ── draft list (per batch) ── */
  const [drafts, setDrafts] = useState([]);
  const [draftTotal, setDraftTotal] = useState(0);
  const [draftPage, setDraftPage] = useState(1);
  const [draftPageSize, setDraftPageSize] = useState(50);
  const [draftTotalPages, setDraftTotalPages] = useState(1);
  const [draftStatusFilter, setDraftStatusFilter] = useState("");
  const [draftsLoading, setDraftsLoading] = useState(false);

  /* ─── fetch special categories ─── */
  const fetchSpecialCategories = useCallback(async () => {
    const base = getAiBaseUrl();
    if (!base) return;
    try {
      const { data } = await axios.get(`${base}/api/draft/special-categories`);
      if (data?.success && Array.isArray(data.special_categories)) {
        setSpecialCategories(data.special_categories);
      }
    } catch (e) {
      console.error("DraftCampaigns — special-categories:", e);
    }
  }, []);

  useEffect(() => { fetchSpecialCategories(); }, [fetchSpecialCategories]);

  /* ─── fetch campaigns ─── */
  const fetchCampaigns = useCallback(async () => {
    const base = getAiBaseUrl();
    if (!base) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    setCampaignsLoading(true);
    try {
      const params = new URLSearchParams();
      selectedCategories.forEach((c) => params.append("special_category", c));
      const { data } = await axios.get(`${base}/api/draft/campaigns`, { params });
      if (data?.success === false) {
        showError(data?.message || "Failed to load campaigns");
        setCampaigns([]);
        setCampaignTotal(0);
        return;
      }
      const list = Array.isArray(data.campaigns) ? data.campaigns : [];
      setCampaigns(list);
      setCampaignTotal(typeof data.total === "number" ? data.total : list.length);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load campaigns");
      setCampaigns([]);
      setCampaignTotal(0);
    } finally {
      setCampaignsLoading(false);
    }
  }, [selectedCategories]);

  useEffect(() => {
    if (!selectedBatch) fetchCampaigns();
  }, [fetchCampaigns, selectedBatch]);

  /* ─── fetch drafts (per batch) ─── */
  const fetchDrafts = useCallback(async () => {
    if (!selectedBatch?.batch_name) return;
    const base = getAiBaseUrl();
    if (!base) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    setDraftsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", draftPageSize);
      params.set("offset", (draftPage - 1) * draftPageSize);
      selectedCategories.forEach((c) => params.append("special_category", c));
      if (draftStatusFilter) params.set("status", draftStatusFilter);

      const { data } = await axios.get(
        `${base}/api/draft/by-batch/${encodeURIComponent(selectedBatch.batch_name)}`,
        { params },
      );
      if (data?.success === false) {
        showError(data?.message || "Failed to load drafts");
        setDrafts([]);
        setDraftTotal(0);
        setDraftTotalPages(1);
        return;
      }
      const list = Array.isArray(data.drafts) ? data.drafts : [];
      setDrafts(list);
      const tc = typeof data.total === "number" ? data.total : list.length;
      setDraftTotal(tc);
      setDraftTotalPages(Math.max(1, Math.ceil(tc / draftPageSize)));
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load drafts");
      setDrafts([]);
      setDraftTotal(0);
      setDraftTotalPages(1);
    } finally {
      setDraftsLoading(false);
    }
  }, [selectedBatch, draftPage, draftPageSize, draftStatusFilter, selectedCategories]);

  useEffect(() => {
    if (selectedBatch) fetchDrafts();
  }, [fetchDrafts, selectedBatch]);

  /* ─── drill-down ─── */
  const handleOpenBatch = (batchName) => {
    setSelectedBatch({ batch_name: batchName });
    setDraftPage(1);
    setDraftStatusFilter("");
    setDrafts([]);
    setDraftTotal(0);
    setDraftTotalPages(1);
  };

  const handleBack = () => {
    setSelectedBatch(null);
    setDraftPage(1);
    setDraftStatusFilter("");
    setDrafts([]);
  };

  const handleRefresh = () => {
    if (selectedBatch) {
      fetchDrafts();
    } else {
      fetchSpecialCategories();
      fetchCampaigns();
    }
  };

  const handleCategoryChange = (values) => {
    setSelectedCategories(values);
    setDraftPage(1);
  };

  /* ─── helpers ─── */
  const isLoading = selectedBatch ? draftsLoading : campaignsLoading;

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════════ */
  return (
    <Box>
      {/* Header */}
      <Heading as="h1" size="lg" color={textColor} fontWeight="700" mb={2}>
        Draft Campaigns
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={4} maxW="3xl">
        {selectedBatch ? (
          <>
            Showing email drafts for batch:{" "}
            <Text as="span" fontWeight="700" color="brand.500">
              {selectedBatch.batch_name}
            </Text>
          </>
        ) : (
          "Browse all draft campaigns. Use the view icon on any row to inspect its email drafts."
        )}
      </Text>

      {/* ── Toolbar (layout matches Central Data Records) ── */}
      <Flex justify="space-between" align="center" mb="10px" gap="12px" flexWrap="wrap">
        <HStack spacing={3} flexWrap="wrap" flex="1" align="flex-end">

          {/* Back button — drill-down only */}
          {selectedBatch && (
            <Button
              leftIcon={<Icon as={MdArrowBack} />}
              size="sm"
              variant="outline"
              onClick={handleBack}
              borderColor={borderColor}
              _hover={{ borderColor: "brand.500" }}
            >
              Back to Campaigns
            </Button>
          )}

          {/* ── Special category (multi-select; trigger styled like CentralDataRecords Select) ── */}
          <FormControl maxW="280px" minW="180px">
            <FormLabel fontSize="sm" mb={1} color={textColor}>
              Special category
            </FormLabel>
            <SpecialCategoryDropdown
              options={specialCategories}
              selected={selectedCategories}
              onChange={handleCategoryChange}
              borderColor={borderColor}
              textColor={textColor}
              bgColor={bgColor}
              panelBg={popoverPanelBg}
              rowHoverBg={popoverRowHoverBg}
            />
          </FormControl>

          {/* Draft status filter — drill-down only */}
          {selectedBatch && (
            <FormControl maxW="240px" minW="180px">
              <FormLabel fontSize="sm" mb={1} color={textColor}>
                Draft status
              </FormLabel>
              <Select
                size="sm"
                value={draftStatusFilter}
                onChange={(e) => { setDraftStatusFilter(e.target.value); setDraftPage(1); }}
                borderColor={borderColor}
                _hover={{ borderColor: "brand.500" }}
                bg={bgColor}
              >
                {DRAFT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </FormControl>
          )}
        </HStack>

        <Button
          leftIcon={<Icon as={MdRefresh} />}
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isDisabled={isLoading}
          borderColor={borderColor}
          _hover={{ borderColor: "brand.500" }}
        >
          Refresh
        </Button>
      </Flex>

      {/* ── Content ── */}
      {isLoading && (selectedBatch ? drafts.length === 0 : campaigns.length === 0) ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : selectedBatch ? (
        /* ══ DRAFT LIST (per-batch) ══ */
        <>
          <Box
            flex="1"
            h={{ base: "calc(100vh - 320px)", md: "calc(100vh - 280px)", xl: "calc(100vh - 280px)" }}
            overflowY="auto"
            overflowX="auto"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
          >
            <Table variant="simple" color="gray.500" minW="2400px">
              <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                <Tr>
                  {[
                    "ID", "Recipient Email", "Recipient Domain", "Full Name",
                    "First Name", "Designation", "Business Nature",
                    "Business Description", "Key Products", "Industry",
                    "Category", "Subcategory", "Special Category",
                    "Subject", "Mode", "Status",
                    "Follow-up #", "Word Count",
                    "Generated At", "Updated At",
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
                {drafts.length === 0 ? (
                  <Tr>
                    <Td colSpan={20} textAlign="center" py="40px" borderColor={borderColor}>
                      <Text color="black">No drafts found for this batch.</Text>
                    </Td>
                  </Tr>
                ) : (
                  drafts.map((d, idx) => (
                    <Tr
                      key={d.id ?? idx}
                      bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"}
                      _hover={{ bg: hoverBg }}
                      transition="all 0.2s"
                    >
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.id ?? "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                        <Text fontSize="sm" color={textColor} noOfLines={1} title={d.recipient_email}>
                          {d.recipient_email || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.recipient_domain || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.recipient_full_name || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.recipient_first_name || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.recipient_designation || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" maxW="160px">
                        <Text fontSize="sm" color={textColor} noOfLines={1} title={d.recipient_business_nature}>
                          {d.recipient_business_nature || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" maxW="240px">
                        <Text fontSize="sm" color={textColor} noOfLines={2} title={d.recipient_business_description}>
                          {d.recipient_business_description || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                        <Text fontSize="sm" color={textColor} noOfLines={1} title={d.recipient_key_products}>
                          {d.recipient_key_products || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.industry || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.category_name || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{d.subcategory_name || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        {d.special_category_value ? (
                          <Badge colorScheme="purple" variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
                            {d.special_category_value}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.400">—</Text>
                        )}
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" maxW="240px">
                        <Text fontSize="sm" color={textColor} noOfLines={2} title={d.email_subject}>
                          {d.email_subject || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{humanize(d.mode) || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                        {d.status ? (
                          <Badge colorScheme={statusScheme(d.status)} variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
                            {humanize(d.status)}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.400">—</Text>
                        )}
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                        <Text fontSize="sm" color={textColor}>{d.follow_up_number ?? "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                        <Text fontSize="sm" color={textColor}>{d.word_count ?? "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{formatDate(d.generated_at)}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text fontSize="sm" color={textColor}>{formatDate(d.updated_at)}</Text>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Draft pagination — same layout as Central Data Records */}
          <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
            <HStack spacing="12px">
              <Text color="black" fontSize="sm">
                Showing{" "}
                <Text as="span" fontWeight="700" color="brand.500">{drafts.length}</Text>{" "}
                of {draftTotal}
              </Text>
              <HStack spacing="8px">
                <Text color="black" fontSize="sm" whiteSpace="nowrap">
                  Per page:
                </Text>
                <Select
                  size="sm"
                  w="80px"
                  value={draftPageSize}
                  onChange={(e) => {
                    setDraftPageSize(Number(e.target.value));
                    setDraftPage(1);
                  }}
                  borderColor={borderColor}
                  _hover={{ borderColor: "brand.500" }}
                  bg={bgColor}
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
                onClick={() => setDraftPage((p) => Math.max(1, p - 1))}
                isDisabled={draftPage === 1 || draftsLoading}
                variant="outline"
              />
              {Array.from({ length: Math.min(draftTotalPages, 10) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={draftPage === p ? "solid" : "outline"}
                  colorScheme={draftPage === p ? "brand" : "gray"}
                  onClick={() => setDraftPage(p)}
                  isDisabled={draftsLoading}
                >
                  {p}
                </Button>
              ))}
              {draftTotalPages > 10 && (
                <Text fontSize="sm" color="gray.400">…{draftTotalPages} total</Text>
              )}
              <IconButton
                aria-label="Next page"
                icon={<MdChevronRight />}
                size="sm"
                onClick={() => setDraftPage((p) => Math.min(draftTotalPages, p + 1))}
                isDisabled={draftPage >= draftTotalPages || draftsLoading}
                variant="outline"
              />
            </HStack>
          </Flex>
        </>
      ) : (
        /* ══ CAMPAIGN LIST ══ */
        <Box
          flex="1"
          h={{ base: "calc(100vh - 290px)", md: "calc(100vh - 250px)", xl: "calc(100vh - 250px)" }}
          overflowY="auto"
          overflowX="auto"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
        >
          <Table variant="simple" color="gray.500" minW="1700px">
            <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
              <Tr>
                {[
                  "Campaign ID", "Batch Name", "Campaign Name",
                  "Category", "Subcategory", "Special Category",
                  "Industry", "Mode",
                  "Total Emails", "Generated", "Failed",
                  "Status", "Started At", "Completed At", "Created At",
                  "Action",
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
                    textAlign={h === "Action" ? "center" : undefined}
                  >
                    {h}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {campaigns.length === 0 ? (
                <Tr>
                  <Td colSpan={16} textAlign="center" py="40px" borderColor={borderColor}>
                    <Text color="black">No campaigns found.</Text>
                  </Td>
                </Tr>
              ) : (
                campaigns.map((c, idx) => (
                  <Tr
                    key={c.campaign_id ?? idx}
                    bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <Td borderColor={borderColor} pt="8px" pb="8px" maxW="200px">
                      <Text fontSize="sm" color={textColor} noOfLines={1} title={c.campaign_id}>
                        {c.campaign_id || "—"}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor} fontWeight="500">
                        {c.batch_name || "—"}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{c.campaign_name || "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{c.category_name || "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{c.subcategory_name || "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      {c.special_category_value ? (
                        <Badge colorScheme="purple" variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
                          {c.special_category_value}
                        </Badge>
                      ) : (
                        <Text fontSize="sm" color="gray.400">—</Text>
                      )}
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{c.industry || "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{humanize(c.mode) || "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                      <Text fontSize="sm" color={textColor}>{c.total_emails ?? "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                      <Text fontSize="sm" color={textColor}>{c.emails_generated ?? "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                      <Text fontSize="sm" color={textColor}>{c.emails_failed ?? "—"}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                      {c.status ? (
                        <Badge colorScheme={statusScheme(c.status)} variant="subtle" fontSize="0.7em" textTransform="none" whiteSpace="nowrap">
                          {humanize(c.status)}
                        </Badge>
                      ) : (
                        <Text fontSize="sm" color="gray.400">—</Text>
                      )}
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{formatDate(c.started_at)}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{formatDate(c.completed_at)}</Text>
                    </Td>
                    <Td borderColor={borderColor} pt="8px" pb="8px">
                      <Text fontSize="sm" color={textColor}>{formatDate(c.created_at)}</Text>
                    </Td>
                    {/* ── View icon ── */}
                    <Td borderColor={borderColor} pt="8px" pb="8px" textAlign="center">
                      <Tooltip label="View batch drafts" hasArrow placement="top">
                        <IconButton
                          aria-label="View batch drafts"
                          icon={<Icon as={MdVisibility} boxSize={4} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="brand"
                          isDisabled={!c.batch_name}
                          onClick={() => c.batch_name && handleOpenBatch(c.batch_name)}
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default DraftCampaigns;

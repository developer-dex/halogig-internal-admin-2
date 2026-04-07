import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
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
import { MdChevronLeft, MdChevronRight, MdRefresh, MdSearch } from "react-icons/md";
import { showError } from "../../../helpers/messageHelper";

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  return base ? base.replace(/\/$/, "") : "";
};

const LIMIT = 50;

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "1" },
  { label: "Paused", value: "2" },
  { label: "Completed", value: "3" },
  { label: "Bounced", value: "-1" },
  { label: "Unsubscribed", value: "-2" },
  { label: "Skipped", value: "-3" },
];

const INTEREST_OPTIONS = [
  { label: "All Interest", value: "" },
  { label: "Interested", value: "1" },
  { label: "Meeting Booked", value: "2" },
  { label: "Meeting Completed", value: "3" },
  { label: "Won", value: "4" },
  { label: "Not Interested", value: "-1" },
  { label: "Wrong Person", value: "-2" },
  { label: "Lost", value: "-3" },
  { label: "Out of Office", value: "0" },
];

const BOOL_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const statusBadgeColor = (label) => {
  if (!label) return "gray";
  const map = {
    Active: "green",
    Completed: "blue",
    Paused: "yellow",
    Bounced: "red",
    Unsubscribed: "orange",
    Skipped: "gray",
  };
  return map[label] || "gray";
};

const interestBadgeColor = (label) => {
  if (!label) return "gray";
  const map = {
    Interested: "green",
    "Meeting Booked": "teal",
    "Meeting Completed": "blue",
    Won: "purple",
    "Not Interested": "red",
    "Wrong Person": "orange",
    Lost: "red",
    "Out of Office": "gray",
  };
  return map[label] || "gray";
};

const defaultFilters = () => ({
  campaign_name: "",
  batch_name: "",
  status: "",
  interest_status: "",
  has_opened: "",
  has_replied: "",
  has_clicked: "",
  has_bounced: "",
  search: "",
});

const LeadStatusTab = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  // Dropdown options loaded from API (same sources as Create / Instantly)
  const [batchNames, setBatchNames] = useState([]);
  const [campaignNames, setCampaignNames] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const listsLoaded = useRef(false);

  const [filters, setFilters] = useState(defaultFilters());
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters());
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load batch names + campaign names once on mount
  useEffect(() => {
    if (listsLoaded.current) return;
    listsLoaded.current = true;

    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) return;

    setIsLoadingLists(true);
    Promise.all([
      axios.get(`${aiBaseUrl}/api/draft/batch-names`),
      axios.get(`${aiBaseUrl}/api/instantly/campaigns`, { params: { limit: 100 } }),
    ])
      .then(([batchRes, campaignsRes]) => {
        const names = batchRes?.data?.batch_names;
        setBatchNames(
          Array.isArray(names)
            ? names.map((n) => (typeof n === "string" ? n : n?.batch_name ?? "")).filter(Boolean)
            : []
        );
        const camp = campaignsRes?.data?.campaigns;
        setCampaignNames(
          Array.isArray(camp)
            ? camp.map((c) => c?.name).filter(Boolean)
            : []
        );
      })
      .catch((err) => {
        console.error("LeadStatusTab — load lists error:", err);
        showError("Failed to load batch / campaign lists");
      })
      .finally(() => setIsLoadingLists(false));
  }, []);

  const fetchLeads = useCallback(async (activeFilters, currentOffset) => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    setIsLoading(true);
    try {
      const params = { limit: LIMIT, offset: currentOffset };
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v !== "") params[k] = v;
      });
      const res = await axios.get(`${aiBaseUrl}/api/instantly/lead-statuses`, { params });
      setLeads(res?.data?.leads || []);
      setTotalCount(res?.data?.total_count ?? 0);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to fetch lead statuses");
      setLeads([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(appliedFilters, offset);
  }, [fetchLeads, appliedFilters, offset]);

  const handleApplyFilters = () => {
    setOffset(0);
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    const reset = defaultFilters();
    setFilters(reset);
    setAppliedFilters(reset);
    setOffset(0);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const handlePrev = () => {
    if (offset > 0) setOffset((p) => Math.max(0, p - LIMIT));
  };
  const handleNext = () => {
    if (currentPage < totalPages) setOffset((p) => p + LIMIT);
  };

  const fmt = (val) => (val != null ? String(val) : "—");
  const fmtDate = (val) => {
    if (!val) return "—";
    try {
      return new Date(val).toLocaleDateString();
    } catch {
      return val;
    }
  };

  return (
    <Box>
      {/* Filters */}
      <Box
        mb={4}
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
      >
        <Flex wrap="wrap" gap={3} mb={3}>
          <FormControl minW="160px" maxW="220px">
            <FormLabel fontSize="xs" mb={1}>Batch name</FormLabel>
            <Select
              size="sm"
              value={filters.batch_name}
              onChange={(e) => setFilters((f) => ({ ...f, batch_name: e.target.value }))}
              isDisabled={isLoadingLists}
            >
              <option value="">{isLoadingLists ? "Loading..." : "All batches"}</option>
              {batchNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="160px" maxW="220px">
            <FormLabel fontSize="xs" mb={1}>Campaign name</FormLabel>
            <Select
              size="sm"
              value={filters.campaign_name}
              onChange={(e) => setFilters((f) => ({ ...f, campaign_name: e.target.value }))}
              isDisabled={isLoadingLists}
            >
              <option value="">{isLoadingLists ? "Loading..." : "All campaigns"}</option>
              {campaignNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="160px" maxW="200px">
            <FormLabel fontSize="xs" mb={1}>Status</FormLabel>
            <Select
              size="sm"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="160px" maxW="200px">
            <FormLabel fontSize="xs" mb={1}>Interest status</FormLabel>
            <Select
              size="sm"
              value={filters.interest_status}
              onChange={(e) => setFilters((f) => ({ ...f, interest_status: e.target.value }))}
            >
              {INTEREST_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="120px" maxW="150px">
            <FormLabel fontSize="xs" mb={1}>Opened</FormLabel>
            <Select
              size="sm"
              value={filters.has_opened}
              onChange={(e) => setFilters((f) => ({ ...f, has_opened: e.target.value }))}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="120px" maxW="150px">
            <FormLabel fontSize="xs" mb={1}>Replied</FormLabel>
            <Select
              size="sm"
              value={filters.has_replied}
              onChange={(e) => setFilters((f) => ({ ...f, has_replied: e.target.value }))}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="120px" maxW="150px">
            <FormLabel fontSize="xs" mb={1}>Clicked</FormLabel>
            <Select
              size="sm"
              value={filters.has_clicked}
              onChange={(e) => setFilters((f) => ({ ...f, has_clicked: e.target.value }))}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="120px" maxW="150px">
            <FormLabel fontSize="xs" mb={1}>Bounced</FormLabel>
            <Select
              size="sm"
              value={filters.has_bounced}
              onChange={(e) => setFilters((f) => ({ ...f, has_bounced: e.target.value }))}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="200px" maxW="280px">
            <FormLabel fontSize="xs" mb={1}>Search (email / name / company)</FormLabel>
            <Input
              size="sm"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search..."
              onKeyDown={(e) => { if (e.key === "Enter") handleApplyFilters(); }}
            />
          </FormControl>
        </Flex>

        <HStack spacing={2}>
          <Button
            leftIcon={<MdSearch />}
            colorScheme="brand"
            size="sm"
            onClick={handleApplyFilters}
          >
            Apply
          </Button>
          <Button
            leftIcon={<MdRefresh />}
            variant="outline"
            size="sm"
            borderColor={borderColor}
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </HStack>
      </Box>

      {/* Table */}
      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Email</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">First name</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Last name</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Company</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Status</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Interest</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Opens</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Replies</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Clicks</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Last contacted</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Last opened</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Last replied</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Synced at</Th>
            </Tr>
          </Thead>
          <Tbody bg={bgColor}>
            {isLoading ? (
              <Tr>
                <Td colSpan={13} textAlign="center" py={10} borderColor={borderColor}>
                  <Spinner size="md" />
                </Td>
              </Tr>
            ) : leads.length === 0 ? (
              <Tr>
                <Td colSpan={13} textAlign="center" py={10} borderColor={borderColor}>
                  <Text color="gray.500" fontSize="sm">No leads found. Adjust filters or sync via Lead Status.</Text>
                </Td>
              </Tr>
            ) : (
              leads.map((lead, i) => (
                <Tr key={`${lead.recipient_email}-${i}`} _hover={{ bg: hoverBg }}>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{fmt(lead.recipient_email)}</Td>
                  <Td borderColor={borderColor} fontSize="xs">{fmt(lead.first_name)}</Td>
                  <Td borderColor={borderColor} fontSize="xs">{fmt(lead.last_name)}</Td>
                  <Td borderColor={borderColor} fontSize="xs">{fmt(lead.company_name)}</Td>
                  <Td borderColor={borderColor}>
                    <Badge colorScheme={statusBadgeColor(lead.status_label)} fontSize="xs">
                      {lead.status_label || fmt(lead.status)}
                    </Badge>
                  </Td>
                  <Td borderColor={borderColor}>
                    {lead.interest_label ? (
                      <Badge colorScheme={interestBadgeColor(lead.interest_label)} fontSize="xs">
                        {lead.interest_label}
                      </Badge>
                    ) : (
                      <Text fontSize="xs" color="gray.400">—</Text>
                    )}
                  </Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(lead.email_open_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(lead.email_reply_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(lead.email_click_count)}</Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{fmtDate(lead.last_contacted_at)}</Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{fmtDate(lead.last_opened_at)}</Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{fmtDate(lead.last_replied_at)}</Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{fmtDate(lead.synced_at)}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={3} flexWrap="wrap" gap={2}>
        <Text fontSize="sm" color="gray.500">
          {totalCount > 0
            ? `${offset + 1}–${Math.min(offset + LIMIT, totalCount)} of ${totalCount}`
            : "0 results"}
        </Text>
        <HStack>
          <IconButton
            icon={<MdChevronLeft />}
            size="sm"
            variant="outline"
            borderColor={borderColor}
            isDisabled={offset === 0 || isLoading}
            onClick={handlePrev}
            aria-label="Previous page"
          />
          <Text fontSize="sm">
            {currentPage} / {totalPages}
          </Text>
          <IconButton
            icon={<MdChevronRight />}
            size="sm"
            variant="outline"
            borderColor={borderColor}
            isDisabled={currentPage >= totalPages || isLoading}
            onClick={handleNext}
            aria-label="Next page"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default LeadStatusTab;

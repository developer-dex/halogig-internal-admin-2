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
import { MdRefresh, MdSearch } from "react-icons/md";
import { showError } from "../../../helpers/messageHelper";

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

const PAGE_SIZE = 50;

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "1" },
  { label: "Paused", value: "2" },
  { label: "Completed", value: "3" },
  { label: "Bounced", value: "-1" },
  { label: "Unsubscribed", value: "-2" },
  { label: "Skipped", value: "-3" },
];

const INTEREST_OPTIONS = [
  { label: "All interest", value: "" },
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

const STATUS_COLOR = {
  "1": "green",
  "2": "yellow",
  "3": "blue",
  "-1": "red",
  "-2": "orange",
  "-3": "gray",
};

const INTEREST_COLOR = {
  "1": "teal",
  "2": "purple",
  "3": "cyan",
  "4": "green",
  "-1": "red",
  "-2": "orange",
  "-3": "red",
  "0": "gray",
};

const fmtDate = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString();
  } catch (_) {
    return String(v);
  }
};

const LeadStatus = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const [filters, setFilters] = useState({
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

  const [inputSearch, setInputSearch] = useState("");

  const fetchLeads = useCallback(
    async (currentOffset = 0, currentFilters = filters) => {
      const aiBaseUrl = getAiBaseUrl();
      if (!aiBaseUrl) {
        showError("AI API endpoint is not configured");
        return;
      }
      setIsLoading(true);
      try {
        const params = { limit: PAGE_SIZE, offset: currentOffset };
        Object.entries(currentFilters).forEach(([k, v]) => {
          if (v !== "") params[k] = v;
        });
        const { data } = await axios.get(`${aiBaseUrl}/api/instantly/lead-statuses`, {
          params,
        });
        setLeads(Array.isArray(data?.leads) ? data.leads : []);
        setTotalCount(typeof data?.total_count === "number" ? data.total_count : 0);
      } catch (err) {
        console.error("LeadStatus fetch error:", err);
        showError(
          err?.response?.data?.message || err?.message || "Failed to load lead statuses"
        );
        setLeads([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchLeads(0, filters);
    setOffset(0);
  }, []);

  const handleFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setOffset(0);
    fetchLeads(0, next);
  };

  const handleSearch = () => {
    const next = { ...filters, search: inputSearch };
    setFilters(next);
    setOffset(0);
    fetchLeads(0, next);
  };

  const handleReset = () => {
    const cleared = {
      campaign_name: "",
      batch_name: "",
      status: "",
      interest_status: "",
      has_opened: "",
      has_replied: "",
      has_clicked: "",
      has_bounced: "",
      search: "",
    };
    setFilters(cleared);
    setInputSearch("");
    setOffset(0);
    fetchLeads(0, cleared);
  };

  const handlePrev = () => {
    const next = Math.max(0, offset - PAGE_SIZE);
    setOffset(next);
    fetchLeads(next);
  };

  const handleNext = () => {
    if (offset + PAGE_SIZE < totalCount) {
      const next = offset + PAGE_SIZE;
      setOffset(next);
      fetchLeads(next);
    }
  };

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
        <Flex wrap="wrap" gap={3} align="flex-end">
          <FormControl minW="140px" maxW="180px">
            <FormLabel fontSize="xs" mb={1}>
              Campaign name
            </FormLabel>
            <Input
              size="sm"
              value={filters.campaign_name}
              onChange={(e) => handleFilter("campaign_name", e.target.value)}
              borderColor={borderColor}
            />
          </FormControl>

          <FormControl minW="130px" maxW="160px">
            <FormLabel fontSize="xs" mb={1}>
              Batch name
            </FormLabel>
            <Input
              size="sm"
              value={filters.batch_name}
              onChange={(e) => handleFilter("batch_name", e.target.value)}
              borderColor={borderColor}
            />
          </FormControl>

          <FormControl minW="120px" maxW="160px">
            <FormLabel fontSize="xs" mb={1}>
              Status
            </FormLabel>
            <Select
              size="sm"
              value={filters.status}
              onChange={(e) => handleFilter("status", e.target.value)}
              borderColor={borderColor}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="140px" maxW="175px">
            <FormLabel fontSize="xs" mb={1}>
              Interest status
            </FormLabel>
            <Select
              size="sm"
              value={filters.interest_status}
              onChange={(e) => handleFilter("interest_status", e.target.value)}
              borderColor={borderColor}
            >
              {INTEREST_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="100px" maxW="130px">
            <FormLabel fontSize="xs" mb={1}>
              Opened
            </FormLabel>
            <Select
              size="sm"
              value={filters.has_opened}
              onChange={(e) => handleFilter("has_opened", e.target.value)}
              borderColor={borderColor}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="100px" maxW="130px">
            <FormLabel fontSize="xs" mb={1}>
              Replied
            </FormLabel>
            <Select
              size="sm"
              value={filters.has_replied}
              onChange={(e) => handleFilter("has_replied", e.target.value)}
              borderColor={borderColor}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="100px" maxW="130px">
            <FormLabel fontSize="xs" mb={1}>
              Clicked
            </FormLabel>
            <Select
              size="sm"
              value={filters.has_clicked}
              onChange={(e) => handleFilter("has_clicked", e.target.value)}
              borderColor={borderColor}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl minW="100px" maxW="130px">
            <FormLabel fontSize="xs" mb={1}>
              Bounced
            </FormLabel>
            <Select
              size="sm"
              value={filters.has_bounced}
              onChange={(e) => handleFilter("has_bounced", e.target.value)}
              borderColor={borderColor}
            >
              {BOOL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Search + buttons */}
          <FormControl minW="180px" maxW="240px">
            <FormLabel fontSize="xs" mb={1}>
              Search (email / name / company)
            </FormLabel>
            <HStack spacing={1}>
              <Input
                size="sm"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                borderColor={borderColor}
              />
              <Button size="sm" onClick={handleSearch} px={2}>
                <MdSearch />
              </Button>
            </HStack>
          </FormControl>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<MdRefresh />}
            onClick={handleReset}
            borderColor={borderColor}
            alignSelf="flex-end"
          >
            Reset
          </Button>
        </Flex>
      </Box>

      {/* Table */}
      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              {[
                "Email",
                "Name",
                "Company",
                "Status",
                "Interest",
                "Opens",
                "Replies",
                "Clicks",
                "Last Contacted",
                "Last Opened",
                "Last Replied",
                "Synced At",
              ].map((h) => (
                <Th key={h} color={textColor} borderColor={borderColor} whiteSpace="nowrap">
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody bg={bgColor}>
            {isLoading ? (
              <Tr>
                <Td colSpan={12} textAlign="center" py={10} borderColor={borderColor}>
                  <Spinner />
                </Td>
              </Tr>
            ) : leads.length === 0 ? (
              <Tr>
                <Td colSpan={12} textAlign="center" py={10} borderColor={borderColor}>
                  <Text color="gray.500" fontSize="sm">
                    No leads found. Adjust filters or sync first via Instantly tab.
                  </Text>
                </Td>
              </Tr>
            ) : (
              leads.map((lead, idx) => (
                <Tr key={lead.recipient_email || idx} _hover={{ bg: hoverBg }}>
                  <Td borderColor={borderColor} fontSize="xs">
                    {lead.recipient_email || "—"}
                  </Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">
                    {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"}
                  </Td>
                  <Td borderColor={borderColor} fontSize="xs">
                    {lead.company_name || "—"}
                  </Td>
                  <Td borderColor={borderColor}>
                    {lead.status_label ? (
                      <Badge
                        colorScheme={STATUS_COLOR[String(lead.status)] || "gray"}
                        fontSize="10px"
                      >
                        {lead.status_label}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td borderColor={borderColor}>
                    {lead.interest_label ? (
                      <Badge
                        colorScheme={INTEREST_COLOR[String(lead.interest_status)] || "gray"}
                        fontSize="10px"
                      >
                        {lead.interest_label}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">
                    {lead.email_open_count ?? "—"}
                  </Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">
                    {lead.email_reply_count ?? "—"}
                  </Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">
                    {lead.email_click_count ?? "—"}
                  </Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">
                    {fmtDate(lead.last_contacted_at)}
                  </Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">
                    {fmtDate(lead.last_opened_at)}
                  </Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">
                    {fmtDate(lead.last_replied_at)}
                  </Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">
                    {fmtDate(lead.synced_at)}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={3} flexWrap="wrap" gap={2}>
        <Text fontSize="xs" color="gray.500">
          {totalCount > 0
            ? `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, totalCount)} of ${totalCount}`
            : "No records"}
        </Text>
        <HStack>
          <Button size="xs" onClick={handlePrev} isDisabled={offset === 0 || isLoading}>
            Prev
          </Button>
          <Text fontSize="xs">
            {currentPage} / {totalPages}
          </Text>
          <Button
            size="xs"
            onClick={handleNext}
            isDisabled={offset + PAGE_SIZE >= totalCount || isLoading}
          >
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default LeadStatus;

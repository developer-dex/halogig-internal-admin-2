import React, { useCallback, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
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
import { MdSearch } from "react-icons/md";
import { showError } from "../../../helpers/messageHelper";

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

const today = () => new Date().toISOString().split("T")[0];
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const pct = (num, denom) => {
  if (!denom || denom === 0) return "—";
  return `${((num / denom) * 100).toFixed(1)}%`;
};

const CAMPAIGN_STATUS = {
  1: { label: "Active", color: "green" },
  2: { label: "Paused", color: "yellow" },
  3: { label: "Completed", color: "blue" },
  "-1": { label: "Bounced", color: "red" },
};

const CampaignPerformance = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState(null);

  const fetchData = useCallback(async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured");
      return;
    }
    if (!startDate || !endDate) {
      showError("Start date and end date are required");
      return;
    }
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (campaignName.trim()) params.campaign_name = campaignName.trim();
      const { data } = await axios.get(
        `${aiBaseUrl}/api/instantly/analytics/campaigns`,
        { params }
      );
      setRows(Array.isArray(data?.campaigns) ? data.campaigns : []);
    } catch (err) {
      console.error("CampaignPerformance fetch error:", err);
      showError(
        err?.response?.data?.message || err?.message || "Failed to load campaign performance"
      );
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [campaignName, startDate, endDate]);

  return (
    <Box>
      <Flex
        wrap="wrap"
        gap={3}
        align="flex-end"
        mb={5}
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
      >
        <FormControl minW="160px" maxW="220px">
          <FormLabel fontSize="xs" mb={1}>
            Campaign name (optional)
          </FormLabel>
          <Input
            size="sm"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl minW="140px" maxW="160px">
          <FormLabel fontSize="xs" mb={1}>
            Start date
          </FormLabel>
          <Input
            size="sm"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl minW="140px" maxW="160px">
          <FormLabel fontSize="xs" mb={1}>
            End date
          </FormLabel>
          <Input
            size="sm"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            borderColor={borderColor}
          />
        </FormControl>
        <Button
          size="sm"
          colorScheme="brand"
          leftIcon={<MdSearch />}
          onClick={fetchData}
          isLoading={isLoading}
          loadingText="Loading"
          alignSelf="flex-end"
        >
          Load
        </Button>
      </Flex>

      {isLoading && (
        <Flex justify="center" py={12}>
          <Spinner />
        </Flex>
      )}

      {!isLoading && rows === null && (
        <Text color="gray.500" fontSize="sm" textAlign="center" py={10}>
          Set date range and click Load to view campaign performance.
        </Text>
      )}

      {!isLoading && rows !== null && (
        <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
          <Table size="sm" variant="simple">
            <Thead bg={theadBg}>
              <Tr>
                {[
                  "Campaign",
                  "Status",
                  "Leads",
                  "Contacted",
                  "Sent",
                  "Opened",
                  "Open Rate",
                  "Replied",
                  "Reply Rate",
                  "Clicked",
                  "Bounced",
                  "Unsubscribed",
                  "Completed",
                ].map((h) => (
                  <Th key={h} color={textColor} borderColor={borderColor} whiteSpace="nowrap">
                    {h}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody bg={bgColor}>
              {rows.length === 0 ? (
                <Tr>
                  <Td colSpan={13} textAlign="center" py={10} borderColor={borderColor}>
                    <Text color="gray.500" fontSize="sm">
                      No campaigns found for this date range.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                rows.map((row, idx) => {
                  const status = CAMPAIGN_STATUS[String(row.campaign_status)];
                  return (
                    <Tr key={row.campaign_id || idx} _hover={{ bg: hoverBg }}>
                      <Td borderColor={borderColor} fontSize="xs" maxW="180px">
                        <Text noOfLines={1} title={row.campaign_name}>
                          {row.campaign_name || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        {status ? (
                          <Badge colorScheme={status.color} fontSize="10px">
                            {status.label}
                          </Badge>
                        ) : (
                          row.campaign_status ?? "—"
                        )}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.leads_count ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.contacted_count ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.emails_sent_count ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.open_count_unique ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} fontSize="xs" color="teal.500">
                        {pct(row.open_count_unique, row.contacted_count)}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.reply_count_unique ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} fontSize="xs" color="purple.500">
                        {pct(row.reply_count_unique, row.contacted_count)}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.link_click_count_unique ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.bounced_count ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.unsubscribed_count ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.completed_count ?? "—"}
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default CampaignPerformance;

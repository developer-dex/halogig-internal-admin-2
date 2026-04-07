import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  return base ? base.replace(/\/$/, "") : "";
};

const today = () => new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

const pct = (num, denom) => {
  if (!denom || denom === 0) return "—";
  return `${((num / denom) * 100).toFixed(1)}%`;
};

const OverviewTab = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const cardBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const summaryRowHoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOverview = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    if (!startDate || !endDate) {
      showError("Please select start and end dates");
      return;
    }
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (campaignName.trim()) params.campaign_name = campaignName.trim();
      const res = await axios.get(`${aiBaseUrl}/api/instantly/analytics/overview`, { params });
      setOverview(res?.data?.overview || null);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to fetch overview");
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const kpis = overview
    ? [
        { label: "Sent", value: overview.emails_sent_count ?? "—" },
        { label: "Contacted", value: overview.contacted_count ?? "—" },
        {
          label: "Opened",
          value: overview.open_count_unique ?? "—",
          rate: pct(overview.open_count_unique, overview.emails_sent_count),
          rateLabel: "open rate",
        },
        {
          label: "Replied",
          value: overview.reply_count_unique ?? "—",
          rate: pct(overview.reply_count_unique, overview.emails_sent_count),
          rateLabel: "reply rate",
        },
        {
          label: "Clicked",
          value: overview.link_click_count_unique ?? "—",
          rate: pct(overview.link_click_count_unique, overview.emails_sent_count),
          rateLabel: "click rate",
        },
        {
          label: "Bounced",
          value: overview.bounced_count ?? "—",
          rate: pct(overview.bounced_count, overview.emails_sent_count),
          rateLabel: "bounce rate",
          accent: "red",
        },
        { label: "Unsubscribed", value: overview.unsubscribed_count ?? "—", accent: "orange" },
        { label: "Completed", value: overview.completed_count ?? "—", accent: "blue" },
        { label: "Interested", value: overview.total_interested ?? "—", accent: "green" },
        { label: "Meeting Booked", value: overview.total_meeting_booked ?? "—", accent: "teal" },
        { label: "Meeting Completed", value: overview.total_meeting_completed ?? "—", accent: "teal" },
        { label: "Closed (Won)", value: overview.total_closed ?? "—", accent: "purple" },
      ]
    : [];

  return (
    <Box>
      {/* Filter bar */}
      <Flex wrap="wrap" gap={3} mb={5} align="flex-end">
        <FormControl minW="160px" maxW="220px">
          <FormLabel fontSize="xs" mb={1}>Campaign name</FormLabel>
          <Input
            size="sm"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="All campaigns"
          />
        </FormControl>
        <FormControl minW="140px" maxW="180px">
          <FormLabel fontSize="xs" mb={1}>Start date</FormLabel>
          <Input
            size="sm"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormControl>
        <FormControl minW="140px" maxW="180px">
          <FormLabel fontSize="xs" mb={1}>End date</FormLabel>
          <Input
            size="sm"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormControl>
        <HStack>
          <Button leftIcon={<MdSearch />} colorScheme="brand" size="sm" onClick={fetchOverview}>
            Load
          </Button>
          <Button
            leftIcon={<MdRefresh />}
            variant="outline"
            size="sm"
            borderColor={borderColor}
            onClick={() => { setOverview(null); setCampaignName(""); setStartDate(thirtyDaysAgo()); setEndDate(today()); }}
          >
            Reset
          </Button>
        </HStack>
      </Flex>

      {isLoading && (
        <Flex justify="center" py={10}>
          <Spinner />
        </Flex>
      )}

      {!isLoading && overview && (
        <>
          {/* KPI Cards */}
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
            gap={4}
            mb={6}
          >
            {kpis.map((kpi) => (
              <GridItem key={kpi.label}>
                <Box
                  p={4}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  bg={cardBg}
                >
                  <Stat>
                    <StatLabel fontSize="xs" color="gray.500">{kpi.label}</StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      color={kpi.accent ? `${kpi.accent}.500` : textColor}
                    >
                      {typeof kpi.value === "number"
                        ? kpi.value.toLocaleString()
                        : kpi.value}
                    </StatNumber>
                    {kpi.rate && (
                      <StatHelpText mb={0} fontSize="xs">
                        {kpi.rate} {kpi.rateLabel}
                      </StatHelpText>
                    )}
                  </Stat>
                </Box>
              </GridItem>
            ))}
          </Grid>

          {/* Summary table */}
          <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
            <Table size="sm" variant="simple">
              <Thead bg={theadBg}>
                <Tr>
                  <Th color={textColor} borderColor={borderColor}>Metric</Th>
                  <Th color={textColor} borderColor={borderColor} isNumeric>Value</Th>
                </Tr>
              </Thead>
              <Tbody bg={bgColor}>
                {Object.entries(overview).map(([key, val]) => (
                  <Tr key={key} _hover={{ bg: summaryRowHoverBg }}>
                    <Td borderColor={borderColor} fontSize="xs" textTransform="capitalize">
                      {key.replace(/_/g, " ")}
                    </Td>
                    <Td borderColor={borderColor} fontSize="xs" isNumeric>
                      {val != null ? String(val) : "—"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}

      {!isLoading && !overview && (
        <Flex justify="center" py={10}>
          <Text color="gray.500" fontSize="sm">
            Select date range and click Load to view overview data.
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default OverviewTab;

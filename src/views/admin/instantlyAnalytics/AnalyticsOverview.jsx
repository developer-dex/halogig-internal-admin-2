import React, { useCallback, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
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

const KpiCard = ({ label, value, sub, borderColor, bgColor, textColor }) => (
  <Box
    p={4}
    borderWidth="1px"
    borderRadius="md"
    borderColor={borderColor}
    bg={bgColor}
  >
    <Stat>
      <StatLabel fontSize="xs" color="gray.500">
        {label}
      </StatLabel>
      <StatNumber fontSize="xl" color={textColor}>
        {value ?? "—"}
      </StatNumber>
      {sub && (
        <Text fontSize="xs" color="gray.400" mt={1}>
          {sub}
        </Text>
      )}
    </Stat>
  </Box>
);

const AnalyticsOverview = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");

  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState(null);

  const fetchOverview = useCallback(async () => {
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
        `${aiBaseUrl}/api/instantly/analytics/overview`,
        { params }
      );
      setOverview(data?.overview || null);
    } catch (err) {
      console.error("AnalyticsOverview fetch error:", err);
      showError(
        err?.response?.data?.message || err?.message || "Failed to load overview"
      );
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignName, startDate, endDate]);

  const o = overview || {};

  return (
    <Box>
      {/* Filters */}
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
          onClick={fetchOverview}
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

      {!isLoading && overview === null && (
        <Text color="gray.500" fontSize="sm" textAlign="center" py={10}>
          Set date range and click Load to view KPI summary.
        </Text>
      )}

      {!isLoading && overview !== null && (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 7 }} spacing={3}>
          <KpiCard
            label="Sent"
            value={(o.emails_sent_count ?? 0).toLocaleString()}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Contacted"
            value={(o.contacted_count ?? 0).toLocaleString()}
            sub={pct(o.contacted_count, o.emails_sent_count)}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Opened (unique)"
            value={(o.open_count_unique ?? 0).toLocaleString()}
            sub={pct(o.open_count_unique, o.contacted_count)}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Replied (unique)"
            value={(o.reply_count_unique ?? 0).toLocaleString()}
            sub={pct(o.reply_count_unique, o.contacted_count)}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Clicked (unique)"
            value={(o.link_click_count_unique ?? 0).toLocaleString()}
            sub={pct(o.link_click_count_unique, o.contacted_count)}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Bounced"
            value={(o.bounced_count ?? 0).toLocaleString()}
            sub={pct(o.bounced_count, o.emails_sent_count)}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Interested"
            value={(o.total_interested ?? 0).toLocaleString()}
            sub={pct(o.total_interested, o.contacted_count)}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Meeting Booked"
            value={(o.total_meeting_booked ?? 0).toLocaleString()}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Meeting Completed"
            value={(o.total_meeting_completed ?? 0).toLocaleString()}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Closed / Won"
            value={(o.total_closed ?? 0).toLocaleString()}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Unsubscribed"
            value={(o.unsubscribed_count ?? 0).toLocaleString()}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
          <KpiCard
            label="Completed"
            value={(o.completed_count ?? 0).toLocaleString()}
            borderColor={borderColor}
            bgColor={bgColor}
            textColor={textColor}
          />
        </SimpleGrid>
      )}
    </Box>
  );
};

export default AnalyticsOverview;

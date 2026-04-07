import React, { useCallback, useState } from "react";
import axios from "axios";
import {
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

const DailyTrends = () => {
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
  const [totalDays, setTotalDays] = useState(null);

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
        `${aiBaseUrl}/api/instantly/analytics/daily`,
        { params }
      );
      const daily = Array.isArray(data?.daily_analytics) ? data.daily_analytics : [];
      setRows(daily);
      setTotalDays(data?.total_days ?? daily.length);
    } catch (err) {
      console.error("DailyTrends fetch error:", err);
      showError(
        err?.response?.data?.message || err?.message || "Failed to load daily trends"
      );
      setRows([]);
      setTotalDays(null);
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
          Set date range and click Load to view daily trends.
        </Text>
      )}

      {!isLoading && rows !== null && (
        <>
          {totalDays !== null && (
            <Text fontSize="xs" color="gray.500" mb={2}>
              {totalDays} day(s) returned
            </Text>
          )}
          <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
            <Table size="sm" variant="simple">
              <Thead bg={theadBg}>
                <Tr>
                  {[
                    "Date",
                    "Sent",
                    "Contacted",
                    "New Leads Contacted",
                    "Opened",
                    "Unique Opened",
                    "Replies",
                    "Unique Replies",
                    "Clicks",
                    "Unique Clicks",
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
                    <Td colSpan={10} textAlign="center" py={10} borderColor={borderColor}>
                      <Text color="gray.500" fontSize="sm">
                        No daily data for this date range.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  rows.map((row, idx) => (
                    <Tr key={row.date || idx} _hover={{ bg: hoverBg }}>
                      <Td borderColor={borderColor} fontSize="xs" fontWeight="medium">
                        {row.date || "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.sent ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.contacted ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.new_leads_contacted ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.opened ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs" color="teal.500">
                        {row.unique_opened ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.replies ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs" color="purple.500">
                        {row.unique_replies ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs">
                        {row.clicks ?? "—"}
                      </Td>
                      <Td borderColor={borderColor} isNumeric fontSize="xs" color="blue.500">
                        {row.unique_clicks ?? "—"}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DailyTrends;

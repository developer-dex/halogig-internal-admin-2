import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
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

const DailyTrendsTab = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) { showError("AI API endpoint not configured"); return; }
    if (!startDate || !endDate) { showError("Please select start and end dates"); return; }
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (campaignName.trim()) params.campaign_name = campaignName.trim();
      const res = await axios.get(`${aiBaseUrl}/api/instantly/analytics/daily`, { params });
      setRows(res?.data?.daily_analytics || []);
      setTotalDays(res?.data?.total_days ?? 0);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to fetch daily analytics");
      setRows([]);
      setTotalDays(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fmt = (v) => (v != null ? (typeof v === "number" ? v.toLocaleString() : String(v)) : "—");

  return (
    <Box>
      <Flex wrap="wrap" gap={3} mb={5} align="flex-end" justify="flex-end">
        <FormControl minW="160px" maxW="220px">
          <FormLabel fontSize="xs" mb={1}>Campaign name</FormLabel>
          <Input size="sm" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="All campaigns" />
        </FormControl>
        <FormControl minW="140px" maxW="180px">
          <FormLabel fontSize="xs" mb={1}>Start date</FormLabel>
          <Input size="sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormControl>
        <FormControl minW="140px" maxW="180px">
          <FormLabel fontSize="xs" mb={1}>End date</FormLabel>
          <Input size="sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormControl>
        <HStack>
          <Button leftIcon={<MdSearch />} colorScheme="brand" size="sm" onClick={fetchData}>Load</Button>
          <Button leftIcon={<MdRefresh />} variant="outline" size="sm" borderColor={borderColor} onClick={() => { setRows([]); setTotalDays(0); setCampaignName(""); setStartDate(thirtyDaysAgo()); setEndDate(today()); }}>Reset</Button>
        </HStack>
      </Flex>

      {totalDays > 0 && (
        <Text fontSize="xs" color="gray.500" mb={2}>{totalDays} day{totalDays !== 1 ? "s" : ""}</Text>
      )}

      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Date</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Sent</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Contacted</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">New contacted</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Opened</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Unique opened</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Replies</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Unique replies</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Clicks</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Unique clicks</Th>
            </Tr>
          </Thead>
          <Tbody bg={bgColor}>
            {isLoading ? (
              <Tr><Td colSpan={10} textAlign="center" py={10} borderColor={borderColor}><Spinner /></Td></Tr>
            ) : rows.length === 0 ? (
              <Tr><Td colSpan={10} textAlign="center" py={10} borderColor={borderColor}><Text color="gray.500" fontSize="sm">No data. Select a date range and click Load.</Text></Td></Tr>
            ) : (
              rows.map((r, i) => (
                <Tr key={r.date || i} _hover={{ bg: hoverBg }}>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{r.date || "—"}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.sent)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.contacted)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.new_leads_contacted)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.opened)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs" fontWeight="semibold">{fmt(r.unique_opened)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.replies)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs" fontWeight="semibold">{fmt(r.unique_replies)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.clicks)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs" fontWeight="semibold">{fmt(r.unique_clicks)}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DailyTrendsTab;

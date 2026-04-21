import React, { useState } from "react";
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

const pct = (num, denom) => {
  if (!denom || denom === 0) return "—";
  return `${((num / denom) * 100).toFixed(1)}%`;
};

const statusBadge = (status) => {
  const map = {
    1: { label: "Active", color: "green" },
    2: { label: "Paused", color: "yellow" },
    3: { label: "Completed", color: "blue" },
    "-1": { label: "Error", color: "red" },
  };
  const s = map[String(status)];
  return s ? <Badge colorScheme={s.color} fontSize="xs">{s.label}</Badge> : <Text fontSize="xs">{String(status ?? "—")}</Text>;
};

const CampaignPerformanceTab = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) { showError("AI API endpoint not configured"); return; }
    if (!startDate || !endDate) { showError("Please select start and end dates"); return; }
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (campaignName.trim()) params.campaign_name = campaignName.trim();
      const res = await axios.get(`${aiBaseUrl}/api/instantly/analytics/campaigns`, { params });
      setRows(res?.data?.campaigns || []);
      setTotal(res?.data?.total ?? 0);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to fetch campaign performance");
      setRows([]);
      setTotal(0);
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
          <Button leftIcon={<MdRefresh />} variant="outline" size="sm" borderColor={borderColor} onClick={() => { setRows([]); setTotal(0); setCampaignName(""); setStartDate(thirtyDaysAgo()); setEndDate(today()); }}>Reset</Button>
        </HStack>
      </Flex>

      {total > 0 && (
        <Text fontSize="xs" color="gray.500" mb={2}>{total} campaign{total !== 1 ? "s" : ""}</Text>
      )}

      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Campaign</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Status</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Leads</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Sent</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Contacted</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Opened</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Open rate</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Replied</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Reply rate</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Clicked</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Bounced</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Unsubscribed</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Completed</Th>
            </Tr>
          </Thead>
          <Tbody bg={bgColor}>
            {isLoading ? (
              <Tr><Td colSpan={13} textAlign="center" py={10} borderColor={borderColor}><Spinner /></Td></Tr>
            ) : rows.length === 0 ? (
              <Tr><Td colSpan={13} textAlign="center" py={10} borderColor={borderColor}><Text color="gray.500" fontSize="sm">No data. Select a date range and click Load.</Text></Td></Tr>
            ) : (
              rows.map((r, i) => (
                <Tr key={r.campaign_id || i} _hover={{ bg: hoverBg }}>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{r.campaign_name || "—"}</Td>
                  <Td borderColor={borderColor}>{statusBadge(r.campaign_status)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.leads_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.emails_sent_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.contacted_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.open_count_unique)}</Td>
                  <Td borderColor={borderColor} fontSize="xs">{pct(r.open_count_unique, r.emails_sent_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.reply_count_unique)}</Td>
                  <Td borderColor={borderColor} fontSize="xs">{pct(r.reply_count_unique, r.emails_sent_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.link_click_count_unique)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.bounced_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.unsubscribed_count)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.completed_count)}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default CampaignPerformanceTab;

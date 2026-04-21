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

const AccountHealthTab = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [emailAccounts, setEmailAccounts] = useState("");
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) { showError("AI API endpoint not configured"); return; }
    if (!startDate || !endDate) { showError("Please select start and end dates"); return; }
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (emailAccounts.trim()) params.emails = emailAccounts.trim();
      const res = await axios.get(`${aiBaseUrl}/api/instantly/analytics/account-daily`, { params });
      setRows(res?.data?.account_analytics || []);
      setTotalEntries(res?.data?.total_entries ?? 0);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to fetch account health data");
      setRows([]);
      setTotalEntries(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fmt = (v) => (v != null ? (typeof v === "number" ? v.toLocaleString() : String(v)) : "—");

  return (
    <Box>
      <Flex wrap="wrap" gap={3} mb={5} align="flex-end" justify="flex-end">
        <FormControl minW="240px" maxW="380px">
          <FormLabel fontSize="xs" mb={1}>Email accounts (comma-separated, optional)</FormLabel>
          <Input
            size="sm"
            value={emailAccounts}
            onChange={(e) => setEmailAccounts(e.target.value)}
            placeholder="sender1@example.com, sender2@example.com"
          />
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
          <Button leftIcon={<MdRefresh />} variant="outline" size="sm" borderColor={borderColor} onClick={() => { setRows([]); setTotalEntries(0); setEmailAccounts(""); setStartDate(thirtyDaysAgo()); setEndDate(today()); }}>Reset</Button>
        </HStack>
      </Flex>

      {totalEntries > 0 && (
        <Text fontSize="xs" color="gray.500" mb={2}>{totalEntries} entr{totalEntries !== 1 ? "ies" : "y"}</Text>
      )}

      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg={theadBg}>
            <Tr>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Date</Th>
              <Th color={textColor} borderColor={borderColor} whiteSpace="nowrap">Email account</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Sent</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Bounced</Th>
              <Th color={textColor} borderColor={borderColor} isNumeric whiteSpace="nowrap">Contacted</Th>
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
              <Tr><Td colSpan={11} textAlign="center" py={10} borderColor={borderColor}><Spinner /></Td></Tr>
            ) : rows.length === 0 ? (
              <Tr><Td colSpan={11} textAlign="center" py={10} borderColor={borderColor}><Text color="gray.500" fontSize="sm">No data. Select a date range and click Load.</Text></Td></Tr>
            ) : (
              rows.map((r, i) => (
                <Tr key={`${r.date}-${r.email_account}-${i}`} _hover={{ bg: hoverBg }}>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{r.date || "—"}</Td>
                  <Td borderColor={borderColor} fontSize="xs" whiteSpace="nowrap">{r.email_account || "—"}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.sent)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs" color={r.bounced > 0 ? "red.500" : undefined}>{fmt(r.bounced)}</Td>
                  <Td borderColor={borderColor} isNumeric fontSize="xs">{fmt(r.contacted)}</Td>
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

export default AccountHealthTab;

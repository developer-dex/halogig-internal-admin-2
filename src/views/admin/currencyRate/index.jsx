import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Input,
  Badge,
  Spinner,
  HStack,
  Select,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdRefresh, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import {
  getCurrencyRates,
  refreshCurrencyRate,
  clearCurrencyRateState,
} from '../../../features/admin/currencyRateSlice';

// Major currencies to pin at the top of the conversion rate breakdown
const PINNED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'JPY', 'SGD', 'CHF'];

// Currency full names for display
const CURRENCY_NAMES = {
  USD: 'US Dollar',
  INR: 'Indian Rupee',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  JPY: 'Japanese Yen',
  SGD: 'Singapore Dollar',
  CHF: 'Swiss Franc',
};

function buildRateRows(ratesJson) {
  if (!ratesJson?.conversion_rates) return [];
  const entries = Object.entries(ratesJson.conversion_rates);

  const pinned = PINNED_CURRENCIES.map((code) => ({
    code,
    name: CURRENCY_NAMES[code] || code,
    rate: ratesJson.conversion_rates[code] ?? '--',
    isPinned: true,
  }));

  const rest = entries
    .filter(([code]) => !PINNED_CURRENCIES.includes(code))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, rate]) => ({
      code,
      name: code,
      rate,
      isPinned: false,
    }));

  return [...pinned, ...rest];
}

export default function CurrencyExchange() {
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [dateFilter, setDateFilter] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  const { isLoading, isRefreshing, rates, totalCount } = useSelector(
    (s) => s.currencyRate || {},
  );

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const expandedBg = useColorModeValue('#F0F4FF', 'navy.700');
  const pinnedBadgeBg = useColorModeValue('blue.50', 'blue.900');
  const pinnedBadgeColor = useColorModeValue('blue.700', 'blue.200');

  const fetchList = useCallback(
    (page, limit, date) => {
      dispatch(getCurrencyRates({ page, limit, date }));
    },
    [dispatch],
  );

  useEffect(() => {
    fetchList(currentPage, pageLimit, dateFilter);
    return () => dispatch(clearCurrencyRateState());
  }, []);

  const handleDateChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);
    setCurrentPage(1);
    fetchList(1, pageLimit, val);
  };

  const handleRefresh = async () => {
    await dispatch(refreshCurrencyRate());
    // After refresh, reload the list so today's updated record appears
    setDateFilter('');
    setCurrentPage(1);
    fetchList(1, pageLimit, '');
  };

  const handlePageLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setPageLimit(newLimit);
    setCurrentPage(1);
    fetchList(1, newLimit, dateFilter);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchList(newPage, pageLimit, dateFilter);
  };

  const toggleExpand = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const rows = useMemo(() => (Array.isArray(rates) ? rates : []), [rates]);
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageLimit));

  const formatDateTime = (utcString) => {
    if (!utcString) return '--';
    try {
      return new Date(utcString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return '--';
    }
  };

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          {/* ── Header Row ─────────────────────────────────────────── */}
          <Flex justify="space-between" align="center" mb="12px" flexWrap="wrap" gap="8px">
            <Box>
              <Text color={textColor} fontSize="l" fontWeight="700">
                Currency Exchange Rates
              </Text>
              <Text color="gray.500" fontSize="xs" mt="2px">
                Daily USD base rates cached from exchangerate-api.com ·{' '}
                <Text as="span" fontWeight="600">
                  {totalCount}
                </Text>{' '}
                record{totalCount !== 1 ? 's' : ''} stored
              </Text>
            </Box>

            <HStack spacing="8px" flexWrap="wrap">
              {/* Date filter */}
              <Tooltip label="Filter by a specific date">
                <Input
                  type="date"
                  size="sm"
                  value={dateFilter}
                  onChange={handleDateChange}
                  borderColor={borderColor}
                  _hover={{ borderColor: 'brand.500' }}
                  w="160px"
                  color={textColor}
                />
              </Tooltip>

              {dateFilter && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setDateFilter('');
                    setCurrentPage(1);
                    fetchList(1, pageLimit, '');
                  }}
                >
                  Clear
                </Button>
              )}

              {/* Refresh button */}
              <Tooltip label="Fetch today's live rate from the API and save to database">
                <Button
                  size="sm"
                  leftIcon={
                    isRefreshing ? (
                      <Spinner size="xs" />
                    ) : (
                      <MdRefresh style={{ fontSize: '16px' }} />
                    )
                  }
                  colorScheme="brand"
                  isLoading={isRefreshing}
                  loadingText="Refreshing…"
                  onClick={handleRefresh}
                  px="16px"
                >
                  Refresh Rate
                </Button>
              </Tooltip>
            </HStack>
          </Flex>

          {/* ── Table ──────────────────────────────────────────────── */}
          {isLoading && rows.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                h={{
                  base: 'calc(100vh - 200px)',
                  md: 'calc(100vh - 170px)',
                  xl: 'calc(100vh - 170px)',
                }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="860px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                        w="50px"
                      >
                        #
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Date
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Base Currency
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        1 USD → INR
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        1 USD → EUR
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        1 USD → GBP
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Last Updated (UTC)
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        All Rates
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={8} textAlign="center" py="40px">
                          <Text color="black">
                            {dateFilter
                              ? `No rate found for ${dateFilter}`
                              : 'No currency rate records found. Click "Refresh Rate" to fetch today\'s data.'}
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((record, index) => {
                        const isOddRow = index % 2 === 0;
                        const isExpanded = expandedRowId === record.id;
                        const rateRows = isExpanded ? buildRateRows(record.rates_json) : [];

                        return (
                          <React.Fragment key={record.id}>
                            <Tr
                              bg={isOddRow ? '#F4F7FE' : 'transparent'}
                              _hover={{ bg: hoverBg }}
                              transition="all 0.2s"
                            >
                              {/* Row number */}
                              <Td borderColor={borderColor} pt="8px" pb="8px">
                                <Text color="gray.500" fontSize="xs">
                                  {(currentPage - 1) * pageLimit + index + 1}
                                </Text>
                              </Td>

                              {/* Date */}
                              <Td borderColor={borderColor} pt="8px" pb="8px">
                                <Text color={textColor} fontSize="sm" fontWeight="600">
                                  {record.date}
                                </Text>
                              </Td>

                              {/* Base currency */}
                              <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                                <Badge
                                  bg="green.100"
                                  color="green.800"
                                  px="8px"
                                  py="4px"
                                  borderRadius="full"
                                  fontSize="xs"
                                  fontWeight="700"
                                >
                                  {record.rates_json?.base_code || 'USD'}
                                </Badge>
                              </Td>

                              {/* INR */}
                              <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                                <Text color={textColor} fontSize="sm" fontWeight="600">
                                  ₹{' '}
                                  {record.rates_json?.conversion_rates?.INR?.toFixed(4) ?? '--'}
                                </Text>
                              </Td>

                              {/* EUR */}
                              <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                                <Text color={textColor} fontSize="sm">
                                  €{' '}
                                  {record.rates_json?.conversion_rates?.EUR?.toFixed(4) ?? '--'}
                                </Text>
                              </Td>

                              {/* GBP */}
                              <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                                <Text color={textColor} fontSize="sm">
                                  £{' '}
                                  {record.rates_json?.conversion_rates?.GBP?.toFixed(4) ?? '--'}
                                </Text>
                              </Td>

                              {/* Last updated */}
                              <Td borderColor={borderColor} pt="8px" pb="8px">
                                <Text color={textColor} fontSize="xs">
                                  {formatDateTime(record.rates_json?.time_last_update_utc)}
                                </Text>
                              </Td>

                              {/* Expand / collapse */}
                              <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme={isExpanded ? 'brand' : 'gray'}
                                  onClick={() => toggleExpand(record.id)}
                                  borderRadius="full"
                                  px="12px"
                                >
                                  {isExpanded ? 'Hide' : 'View All'}
                                </Button>
                              </Td>
                            </Tr>

                            {/* ── Expanded: inline rate breakdown ── */}
                            {isExpanded && (
                              <Tr>
                                <Td
                                  colSpan={8}
                                  bg={expandedBg}
                                  borderColor={borderColor}
                                  p="0"
                                >
                                  <Box p="16px">
                                    <Text
                                      fontSize="xs"
                                      fontWeight="700"
                                      color={textColor}
                                      mb="10px"
                                      textTransform="uppercase"
                                      letterSpacing="0.05em"
                                    >
                                      All conversion rates for {record.date} (1 USD =)
                                    </Text>
                                    <Box
                                      display="grid"
                                      gridTemplateColumns={{
                                        base: 'repeat(2, 1fr)',
                                        md: 'repeat(4, 1fr)',
                                        xl: 'repeat(6, 1fr)',
                                      }}
                                      gap="6px"
                                    >
                                      {rateRows.map(({ code, name, rate, isPinned }) => (
                                        <Flex
                                          key={code}
                                          align="center"
                                          justify="space-between"
                                          bg={isPinned ? pinnedBadgeBg : bgColor}
                                          border="1px solid"
                                          borderColor={isPinned ? 'blue.200' : borderColor}
                                          borderRadius="6px"
                                          px="10px"
                                          py="6px"
                                        >
                                          <Box>
                                            <Text
                                              fontSize="xs"
                                              fontWeight="700"
                                              color={isPinned ? pinnedBadgeColor : textColor}
                                            >
                                              {code}
                                            </Text>
                                            {isPinned && (
                                              <Text fontSize="9px" color="gray.400">
                                                {name}
                                              </Text>
                                            )}
                                          </Box>
                                          <Text
                                            fontSize="xs"
                                            fontWeight={isPinned ? '700' : 'normal'}
                                            color={textColor}
                                          >
                                            {typeof rate === 'number' ? rate.toFixed(4) : rate}
                                          </Text>
                                        </Flex>
                                      ))}
                                    </Box>
                                  </Box>
                                </Td>
                              </Tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* ── Pagination ──────────────────────────────────────── */}
              <Flex
                justify="space-between"
                align="center"
                pt="8px"
                borderTop="1px solid"
                borderColor={borderColor}
                flexWrap="wrap"
                gap="8px"
              >
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing{' '}
                    <Text as="span" fontWeight="700" color="brand.500">
                      {rows.length}
                    </Text>{' '}
                    of {totalCount}
                  </Text>
                  <HStack spacing="8px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">
                      Per page:
                    </Text>
                    <Select
                      size="sm"
                      w="80px"
                      value={pageLimit}
                      onChange={handlePageLimitChange}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'brand.500' }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </Select>
                  </HStack>
                </HStack>

                <HStack spacing="8px">
                  <IconButton
                    aria-label="Previous page"
                    icon={<MdChevronLeft />}
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    isDisabled={currentPage === 1}
                    variant="outline"
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={currentPage === p ? 'solid' : 'outline'}
                        colorScheme={currentPage === p ? 'brand' : 'gray'}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  <IconButton
                    aria-label="Next page"
                    icon={<MdChevronRight />}
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    variant="outline"
                  />
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

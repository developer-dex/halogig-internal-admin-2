import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Button,
  useColorModeValue,
  HStack,
  IconButton,
  Select,
} from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight, MdRefresh } from "react-icons/md";
import { fetchEmailCampaigns } from "../../../features/admin/emailCampaignsSlice";
import { showError } from "../../../helpers/messageHelper";

const EmailSent = () => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        fetchEmailCampaigns({
          page,
          limit: pageSize,
        })
      );
      const data = response?.payload?.data?.data;
      setRows(data?.email_campaigns || []);
      setTotalCount(data?.total_count || 0);
    } catch (error) {
      showError("Failed to load email campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, page, pageSize]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusColorScheme = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'sent':
      case 'delivered':
        return { bg: 'transparent', color: 'green.600', border: 'green.600' };
      case 'pending':
        return { bg: 'transparent', color: 'orange.500', border: 'orange.500' };
      case 'failed':
      case 'bounced':
        return { bg: 'transparent', color: 'red.500', border: 'red.500' };
      case 'opened':
        return { bg: 'transparent', color: 'blue.500', border: 'blue.500' };
      case 'clicked':
        return { bg: 'transparent', color: 'purple.500', border: 'purple.500' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black' };
    }
  };

  const renderStatusTag = (status) => {
    const statusColors = getStatusColorScheme(status);
    return (
      <Button
        size="sm"
        bg={statusColors.bg}
        color={statusColors.color}
        borderColor={statusColors.border}
        borderWidth="2px"
        borderRadius="full"
        fontWeight="normal"
        fontSize="xs"
        textTransform="capitalize"
        _hover={{ opacity: 0.8, transform: 'translateY(-2px)' }}
        _disabled={{
          opacity: 1,
          cursor: 'default',
          bg: statusColors.bg,
          color: statusColors.color,
          borderColor: statusColors.border
        }}
        isDisabled
        cursor="default"
      >
        {status || "—"}
      </Button>
    );
  };

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleRefresh = () => {
    setPage(1);
    fetchData();
  };

  return (
    <>
      <Flex justify="flex-end" align="center" mb="10px" gap="12px">
        <Button
          leftIcon={<MdRefresh />}
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isDisabled={isLoading}
        >
          Refresh
        </Button>
      </Flex>

      {isLoading && rows.length === 0 ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : (
        <>
          <Box
            flex="1"
            h={{ base: 'calc(100vh - 290px)', md: 'calc(100vh - 250px)', xl: 'calc(100vh - 250px)' }}
            overflowY="auto"
            overflowX="auto"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
          >
            <Table variant="simple" color="gray.500" minW="1400px">
              <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                <Tr>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    ID
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Batch Name
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Recipient Email
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Domain
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Special Category
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Category
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Email Subject
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Sendgrid Message ID
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                    Sendgrid Status
                  </Th>
                  <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                    Sent At
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={10} textAlign="center" py="40px">
                      <Text color="black">No records found</Text>
                    </Td>
                  </Tr>
                ) : (
                  rows.map((item, index) => {
                    // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                    const isOddRow = index % 2 === 0;
                    return (
                    <Tr key={item.id} bg={isOddRow ? '#F8FAFD' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.id || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.batch_name || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="200px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.recipient_email || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.recipient_domain || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.special_category_value || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">{item.category_name || "—"}</Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="250px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.email_subject || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} maxW="200px" pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {item.sendgrid_message_id || "—"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                        {renderStatusTag(item.sendgrid_status)}
                      </Td>
                      <Td borderColor={borderColor} pt="8px" pb="8px">
                        <Text color={textColor} fontSize="sm" fontWeight="normal">
                          {formatDate(item.sent_at)}
                        </Text>
                      </Td>
                    </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
            <HStack spacing="12px">
              <Text color="black" fontSize="sm">
                Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
              </Text>
              <HStack spacing="8px">
                <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                <Select
                  size="sm"
                  w="80px"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  borderColor={borderColor}
                  _hover={{ borderColor: 'brand.500' }}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                </Select>
              </HStack>
            </HStack>

            <HStack spacing="8px">
              <IconButton
                aria-label="Previous page"
                icon={<MdChevronLeft />}
                size="sm"
                onClick={handlePrev}
                isDisabled={page === 1 || isLoading}
                variant="outline"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 10)
                .map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={page === p ? 'solid' : 'outline'}
                    colorScheme={page === p ? 'brand' : 'gray'}
                    onClick={() => setPage(p)}
                    isDisabled={isLoading}
                  >
                    {p}
                  </Button>
                ))}
              <IconButton
                aria-label="Next page"
                icon={<MdChevronRight />}
                size="sm"
                onClick={handleNext}
                isDisabled={page >= totalPages || isLoading}
                variant="outline"
              />
            </HStack>
          </Flex>
        </>
      )}
    </>
  );
};

export default EmailSent;

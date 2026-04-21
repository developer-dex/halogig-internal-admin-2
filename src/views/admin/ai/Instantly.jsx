import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { MdAdd, MdEmail, MdPeople, MdRefresh } from "react-icons/md";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import FollowupEmailModal from "./FollowupEmailModal";
import LeadStatusSyncModal from "./LeadStatusSyncModal";

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

const Instantly = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const panelBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  const createModal = useDisclosure();
  const followupModal = useDisclosure();
  const leadStatusModal = useDisclosure();

  const [batchNames, setBatchNames] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isRefreshingTable, setIsRefreshingTable] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  /** "split" = batch + campaign (push-leads). "combine" = one name (push-same). */
  const [pushMode, setPushMode] = useState("split");
  const [combinedCampaignName, setCombinedCampaignName] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const combineNameOptions = useMemo(() => {
    const set = new Set(batchNames.filter(Boolean));
    (campaigns || []).forEach((c) => {
      if (c?.name) set.add(String(c.name));
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [batchNames, campaigns]);

  const loadLists = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsLoadingLists(true);
    try {
      const [batchRes, campaignsRes] = await Promise.all([
        axios.get(`${aiBaseUrl}/api/draft/batch-names`),
        axios.get(`${aiBaseUrl}/api/instantly/campaigns`, {
          params: {
            limit: 100,
          },
        }),
      ]);

      const names = batchRes?.data?.batch_names;
      const normalizedNames = Array.isArray(names)
        ? names
            .map((n) => (typeof n === "string" ? n : n?.batch_name ?? ""))
            .filter(Boolean)
        : [];
      setBatchNames(normalizedNames);

      const camp = campaignsRes?.data?.campaigns;
      setCampaigns(Array.isArray(camp) ? camp : []);
    } catch (err) {
      console.error("Instantly — load lists error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load batch names or campaigns";
      showError(msg);
      setBatchNames([]);
      setCampaigns([]);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedBatchName("");
    setSelectedCampaignName("");
    setPushMode("split");
    setCombinedCampaignName("");
    createModal.onOpen();
  };

  useEffect(() => {
    if (!createModal.isOpen) return;
    loadLists();
  }, [createModal.isOpen]);

  const handleReloadLists = () => loadLists();

  const handleRefreshTable = async () => {
    setIsRefreshingTable(true);
    try {
      // Reserved for future push history / table data.
      await new Promise((r) => setTimeout(r, 150));
    } finally {
      setIsRefreshingTable(false);
    }
  };

  const handleCancelModal = () => {
    createModal.onClose();
    setSelectedBatchName("");
    setSelectedCampaignName("");
    setPushMode("split");
    setCombinedCampaignName("");
  };

  const handlePushModeChange = (value) => {
    setPushMode(value);
    if (value === "split") {
      setCombinedCampaignName("");
    } else {
      setSelectedBatchName("");
      setSelectedCampaignName("");
    }
  };

  const handleExecute = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    if (pushMode === "split") {
      if (!selectedBatchName.trim()) {
        showError("Please select a batch name");
        return;
      }
      if (!selectedCampaignName.trim()) {
        showError("Please select a campaign");
        return;
      }
    } else {
      if (!combinedCampaignName.trim()) {
        showError("Please select a campaign name (combine)");
        return;
      }
    }

    setIsExecuting(true);
    try {
      if (pushMode === "split") {
        const { data } = await axios.post(`${aiBaseUrl}/api/instantly/push-leads`, {
          batch_name: selectedBatchName.trim(),
          campaign_name: selectedCampaignName.trim(),
        });

        if (data?.success === false) {
          showError(data?.message || "Push to Instantly failed");
          return;
        }

        const sent = data?.total_leads_sent ?? data?.leads_uploaded ?? "—";
        showSuccess(
          `Push completed. Leads sent: ${sent}. Drafts: ${data?.total_drafts ?? "—"}`
        );
      } else {
        const { data } = await axios.post(`${aiBaseUrl}/api/instantly/push-same`, {
          campaign_name: combinedCampaignName.trim(),
        });

        if (data?.success === false) {
          showError(data?.message || "Push to Instantly failed");
          return;
        }

        showSuccess(data?.message || "Same-name push to Instantly completed");
      }

      createModal.onClose();
      setSelectedBatchName("");
      setSelectedCampaignName("");
      setPushMode("split");
      setCombinedCampaignName("");
    } catch (err) {
      console.error("Instantly — execute error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to push to Instantly";
      showError(msg);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={4} mb={4} flexWrap="wrap">
        <Box minW={{ base: "100%", md: "280px" }}>
          <Text color={textColor} fontWeight="700" fontSize="md" lineHeight="1.2">
            Instantly
          </Text>
          <Text color={subtleText} fontSize="sm" mt={1}>
            Push draft batches into Instantly campaigns and manage follow-ups.
          </Text>
        </Box>

        <Flex justify="flex-end" align="center" gap={3} flexWrap="wrap">
          <Button leftIcon={<MdAdd />} colorScheme="brand" size="sm" onClick={handleOpenCreate}>
            Create
          </Button>
          <Button
            leftIcon={<MdEmail />}
            variant="outline"
            size="sm"
            borderColor={borderColor}
            onClick={followupModal.onOpen}
            bg={bgColor}
          >
            Followup Email
          </Button>
          <Button
            leftIcon={<MdPeople />}
            variant="outline"
            size="sm"
            borderColor={borderColor}
            onClick={leadStatusModal.onOpen}
            bg={bgColor}
          >
            Lead Status
          </Button>
          <Button
            leftIcon={<MdRefresh />}
            variant="outline"
            size="sm"
            borderColor={borderColor}
            onClick={handleRefreshTable}
            isLoading={isRefreshingTable}
            loadingText="Refreshing"
            bg={bgColor}
          >
            Refresh
          </Button>
        </Flex>
      </Flex>

      <Box
        overflowX="auto"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="8px"
        bg={bgColor}
      >
        <Table variant="simple" color="gray.500" minW="1100px">
          <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
            <Tr>
              <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                Push ID
              </Th>
              <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                Batch name
              </Th>
              <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                Campaign
              </Th>
              <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                Drafts
              </Th>
              <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                Leads sent
              </Th>
              <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                Status
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr _hover={{ bg: hoverBg }} bg="#F4F7FE">
              <Td colSpan={6} textAlign="center" py={10} borderColor={borderColor}>
                <Text color="gray.500" fontSize="sm">
                  No data yet. Use Create to push drafts to an Instantly campaign.
                </Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={createModal.isOpen} onClose={handleCancelModal} isCentered size="xl">
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader color={textColor}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700">Push drafts to Instantly</Text>
              <Text fontSize="sm" color={subtleText} fontWeight="500">
                Select a batch + campaign (recommended), or use a single combined name.
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Text fontSize="sm" color={subtleText} flex="1" minW={0}>
                  Lists load when this dialog opens. Reload if you don’t see the latest campaigns.
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReloadLists}
                  isLoading={isLoadingLists}
                  flexShrink={0}
                >
                  Reload lists
                </Button>
              </Flex>

              {isLoadingLists ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : (
                <RadioGroup value={pushMode} onChange={handlePushModeChange}>
                  <Stack spacing={3} align="stretch">
                    <Box
                      borderWidth="1px"
                      borderColor={pushMode === "split" ? "brand.400" : borderColor}
                      borderRadius="12px"
                      p={4}
                      bg={pushMode === "split" ? panelBg : "transparent"}
                    >
                      <Radio value="split" colorScheme="brand">
                        <Text as="span" fontWeight="700" fontSize="sm">Batch + Campaign</Text>
                      </Radio>
                      <Text fontSize="xs" color={subtleText} mt={1} mb={3}>
                        Best for tracking: batch stays separate from campaign name.
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} opacity={pushMode === "split" ? 1 : 0.45}>
                        <FormControl isRequired={pushMode === "split"}>
                          <FormLabel fontSize="sm" color={textColor}>Batch name</FormLabel>
                          <Select
                            size="sm"
                            bg={bgColor}
                            borderColor={borderColor}
                            placeholder="Select batch name"
                            value={selectedBatchName}
                            onChange={(e) => setSelectedBatchName(e.target.value)}
                            isDisabled={pushMode !== "split"}
                          >
                            {batchNames.map((name) => (
                              <option key={String(name)} value={name}>
                                {name}
                              </option>
                            ))}
                          </Select>
                          <FormHelperText fontSize="xs" color={subtleText}>
                            Source draft batch.
                          </FormHelperText>
                        </FormControl>
                        <FormControl isRequired={pushMode === "split"}>
                          <FormLabel fontSize="sm" color={textColor}>Campaign name</FormLabel>
                          <Select
                            size="sm"
                            bg={bgColor}
                            borderColor={borderColor}
                            placeholder="Select campaign"
                            value={selectedCampaignName}
                            onChange={(e) => setSelectedCampaignName(e.target.value)}
                            isDisabled={pushMode !== "split"}
                          >
                            {campaigns
                              .filter((c) => c?.name)
                              .map((c) => {
                                const name = c.name;
                                return (
                                  <option key={String(c?.id ?? name)} value={name}>
                                    {name}
                                  </option>
                                );
                              })}
                          </Select>
                          <FormHelperText fontSize="xs" color={subtleText}>
                            Target Instantly campaign.
                          </FormHelperText>
                        </FormControl>
                      </SimpleGrid>
                    </Box>

                    <Flex align="center" gap={3} py={1}>
                      <Divider borderColor={borderColor} />
                      <Text fontSize="xs" fontWeight="800" color="gray.500" flexShrink={0} letterSpacing="0.08em">
                        OR
                      </Text>
                      <Divider borderColor={borderColor} />
                    </Flex>

                    <Box
                      borderWidth="1px"
                      borderColor={pushMode === "combine" ? "brand.400" : borderColor}
                      borderRadius="12px"
                      p={4}
                      bg={pushMode === "combine" ? panelBg : "transparent"}
                    >
                      <Radio value="combine" colorScheme="brand">
                        <Text as="span" fontWeight="700" fontSize="sm">Single campaign name (combine)</Text>
                      </Radio>
                      <Text fontSize="xs" color={subtleText} mt={1} mb={3}>
                        Uses one name as both the batch and campaign when pushing leads.
                      </Text>
                      <FormControl isRequired={pushMode === "combine"} opacity={pushMode === "combine" ? 1 : 0.45}>
                        <FormLabel fontSize="sm" color={textColor}>Campaign name</FormLabel>
                        <Select
                          size="sm"
                          bg={bgColor}
                          borderColor={borderColor}
                          placeholder="Select name"
                          value={combinedCampaignName}
                          onChange={(e) => setCombinedCampaignName(e.target.value)}
                          isDisabled={pushMode !== "combine"}
                        >
                          {combineNameOptions.map((name) => (
                            <option key={String(name)} value={name}>
                              {name}
                            </option>
                          ))}
                        </Select>
                        <FormHelperText fontSize="xs" color={subtleText}>
                          Useful when you want identical naming in Instantly.
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  </Stack>
                </RadioGroup>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={handleCancelModal} isDisabled={isExecuting}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleExecute}
              isLoading={isExecuting}
              loadingText="Executing"
              isDisabled={
                isLoadingLists
                || (pushMode === "split"
                  && (!selectedBatchName.trim() || !selectedCampaignName.trim()))
                || (pushMode === "combine" && !combinedCampaignName.trim())
              }
            >
              Execute
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FollowupEmailModal
        isOpen={followupModal.isOpen}
        onClose={followupModal.onClose}
        textColor={textColor}
        borderColor={borderColor}
      />

      <LeadStatusSyncModal
        isOpen={leadStatusModal.isOpen}
        onClose={leadStatusModal.onClose}
        textColor={textColor}
        borderColor={borderColor}
      />
    </Box>
  );
};

export default Instantly;

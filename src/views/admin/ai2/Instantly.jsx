import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Code,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
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
} from "@chakra-ui/react";
import { MdAdd, MdEmail, MdPeople, MdRefresh } from "react-icons/md";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";
import FollowupEmailModalV2 from "./FollowupEmailModal";
import LeadStatusSyncModalV2 from "./LeadStatusSyncModal";

const InstantlyV2 = () => {
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

  /** Single name passed to `POST /instantly/push-same` as `campaign_name` (same batch + campaign). */
  const [pushSameCampaignName, setPushSameCampaignName] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const aiBaseUrl = getAiV2BaseUrl();

  const combineNameOptions = useMemo(() => {
    const s = new Set(batchNames.filter(Boolean).map((x) => String(x)));
    (campaigns || []).forEach((c) => {
      if (c?.name) s.add(String(c.name));
    });
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [batchNames, campaigns]);

  const loadLists = useCallback(async () => {
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    setIsLoadingLists(true);
    try {
      const [batchRes, campaignsRes] = await Promise.all([
        axios.get(`${aiBaseUrl}/draft/batch-names`),
        axios.get(`${aiBaseUrl}/instantly/campaigns`, { params: { limit: 100 } }),
      ]);

      const names = batchRes?.data?.batch_names;
      const list = Array.isArray(names) ? names.filter(Boolean).map(String) : [];
      setBatchNames(list);

      const camp = campaignsRes?.data?.campaigns;
      setCampaigns(Array.isArray(camp) ? camp : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load batch names or campaigns";
      showError(msg);
      setBatchNames([]);
      setCampaigns([]);
    } finally {
      setIsLoadingLists(false);
    }
  }, [aiBaseUrl]);

  useEffect(() => {
    if (!createModal.isOpen) return;
    loadLists();
  }, [createModal.isOpen, loadLists]);

  const handleOpenCreate = () => {
    setPushSameCampaignName("");
    createModal.onOpen();
  };

  const handleExecute = async () => {
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    if (!pushSameCampaignName.trim()) {
      showError("Please select a campaign name");
      return;
    }

    setIsExecuting(true);
    try {
      const { data } = await axios.post(`${aiBaseUrl}/instantly/push-same`, {
        campaign_name: pushSameCampaignName.trim(),
      });
      if (data?.success === false) {
        showError(data?.message || "Push to Instantly failed");
        return;
      }
      showSuccess(
        `Push completed. Leads uploaded: ${data?.leads_uploaded ?? "—"} · Drafts: ${data?.total_drafts ?? "—"} · Skipped: ${data?.skipped_count ?? "—"}`,
      );

      createModal.onClose();
      setPushSameCampaignName("");
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to push to Instantly");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRefreshTable = async () => {
    setIsRefreshingTable(true);
    try {
      await new Promise((r) => setTimeout(r, 150));
    } finally {
      setIsRefreshingTable(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={4} mb={4} flexWrap="wrap">
        <Box minW={{ base: "100%", md: "280px" }}>
          <Text color={textColor} fontWeight="700" fontSize="md" lineHeight="1.2">
            Instantly (V2)
          </Text>
          <Text color={subtleText} fontSize="sm" mt={1}>
            Push V2 draft batches into Instantly campaigns and manage follow-ups.
          </Text>
        </Box>

        <Flex justify="flex-end" align="center" gap={3} flexWrap="wrap">
          <Button leftIcon={<MdAdd />} colorScheme="brand" size="sm" onClick={handleOpenCreate}>
            Create
          </Button>
          <Button leftIcon={<MdEmail />} variant="outline" size="sm" borderColor={borderColor} onClick={followupModal.onOpen} bg={bgColor}>
            Followup Email
          </Button>
          <Button leftIcon={<MdPeople />} variant="outline" size="sm" borderColor={borderColor} onClick={leadStatusModal.onOpen} bg={bgColor}>
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

      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="8px" bg={bgColor}>
        <Table variant="simple" color="gray.500" minW="1100px">
          <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
            <Tr>
              {["Push ID", "Batch name", "Campaign", "Drafts", "Leads uploaded", "Skipped"].map((h) => (
                <Th key={h} borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                  {h}
                </Th>
              ))}
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

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader color={textColor}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700">
                Push drafts to Instantly (V2)
              </Text>
              <Text fontSize="sm" color={subtleText} fontWeight="500">
                One name for both draft batch and Instantly campaign (<Code fontSize="xs">POST …/instantly/push-same</Code>).
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
                <Button size="sm" variant="outline" onClick={loadLists} isLoading={isLoadingLists} flexShrink={0}>
                  Reload lists
                </Button>
              </Flex>

              {isLoadingLists ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : (
                <Box borderWidth="1px" borderColor="brand.400" borderRadius="12px" p={4} bg={panelBg}>
                  <Text fontWeight="700" fontSize="sm" color={textColor} mb={1}>
                    Campaign name
                  </Text>
                  <Text fontSize="xs" color={subtleText} mb={3}>
                    Request body: <Code fontSize="xs">{`{ "campaign_name": "…" }`}</Code> (same response shape as split push-leads).
                  </Text>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color={textColor}>
                      Name
                    </FormLabel>
                    <Select
                      size="sm"
                      bg={bgColor}
                      borderColor={borderColor}
                      placeholder="Select name"
                      value={pushSameCampaignName}
                      onChange={(e) => setPushSameCampaignName(e.target.value)}
                    >
                      {combineNameOptions.map((name) => (
                        <option key={String(name)} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText fontSize="xs" color={subtleText}>
                      Options merge draft batch names and Instantly campaigns from the APIs above — reload lists if stale.
                    </FormHelperText>
                  </FormControl>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={createModal.onClose} isDisabled={isExecuting}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleExecute}
              isLoading={isExecuting}
              loadingText="Executing"
              isDisabled={isLoadingLists || !pushSameCampaignName.trim()}
            >
              Execute
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FollowupEmailModalV2 isOpen={followupModal.isOpen} onClose={followupModal.onClose} textColor={textColor} borderColor={borderColor} />
      <LeadStatusSyncModalV2 isOpen={leadStatusModal.isOpen} onClose={leadStatusModal.onClose} textColor={textColor} borderColor={borderColor} />
    </Box>
  );
};

export default InstantlyV2;


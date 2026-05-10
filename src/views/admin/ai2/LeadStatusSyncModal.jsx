import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
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
  Text,
  VStack,
} from "@chakra-ui/react";
import { showError } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

const LeadStatusSyncModalV2 = ({ isOpen, onClose, textColor, borderColor }) => {
  const [batchNames, setBatchNames] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadsSynced, setLeadsSynced] = useState(null);

  const aiBaseUrl = getAiV2BaseUrl();

  const loadLists = async () => {
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
      setBatchNames(Array.isArray(names) ? names.filter(Boolean).map(String) : []);

      const camp = campaignsRes?.data?.campaigns;
      setCampaigns(Array.isArray(camp) ? camp : []);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load batch names or campaigns");
      setBatchNames([]);
      setCampaigns([]);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setLeadsSynced(null);
    setSelectedBatchName("");
    setSelectedCampaignName("");
    loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setLeadsSynced(null);
    setSelectedBatchName("");
    setSelectedCampaignName("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedBatchName.trim()) {
      showError("Please select a batch name");
      return;
    }
    if (!selectedCampaignName.trim()) {
      showError("Please select a campaign");
      return;
    }
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsSubmitting(true);
    try {
      // Not part of the published V2 docs, but kept for feature parity with AI module.
      const { data } = await axios.post(`${aiBaseUrl}/instantly/sync-leads`, {
        batch_name: selectedBatchName.trim(),
        campaign_name: selectedCampaignName.trim(),
      });

      if (data?.success === false) {
        showError(data?.message || "Lead sync failed");
        return;
      }

      const raw = data?.leads_synced;
      const n = Number(raw);
      setLeadsSynced(Number.isFinite(n) ? n : null);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to sync leads from Instantly");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader color={textColor}>Sync lead status from Instantly (AI 2)</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Text fontSize="sm" color="gray.500" flex="1" minW={0}>
                Loads batch names and Instantly campaigns, then requests a status sync.
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
              <>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Batch name</FormLabel>
                  <Select
                    placeholder="Select batch name"
                    value={selectedBatchName}
                    onChange={(e) => setSelectedBatchName(e.target.value)}
                    borderColor={borderColor}
                  >
                    {batchNames.map((name) => (
                      <option key={String(name)} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Campaign name</FormLabel>
                  <Select
                    placeholder="Select campaign"
                    value={selectedCampaignName}
                    onChange={(e) => setSelectedCampaignName(e.target.value)}
                    borderColor={borderColor}
                  >
                    {campaigns
                      .filter((c) => c?.name)
                      .map((c) => (
                        <option key={String(c?.id ?? c.name)} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </>
            )}

            {leadsSynced !== null && (
              <Alert status="success" borderRadius="md" variant="subtle">
                <AlertIcon />
                <Text fontWeight="medium">
                  Leads synced: <strong>{leadsSynced}</strong>
                </Text>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={handleClose} isDisabled={isSubmitting}>
            Close
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Syncing"
            isDisabled={isLoadingLists || !selectedBatchName.trim() || !selectedCampaignName.trim()}
          >
            Sync
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LeadStatusSyncModalV2;


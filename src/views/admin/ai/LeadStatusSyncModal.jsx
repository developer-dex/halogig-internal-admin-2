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

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

/**
 * Sync Instantly lead statuses into DB — same list sources as Create, POST /api/instantly/sync-leads.
 * Stays open after submit to show leads_synced; user closes with Close or X.
 */
const LeadStatusSyncModal = ({ isOpen, onClose, textColor, borderColor }) => {
  const [batchNames, setBatchNames] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadsSynced, setLeadsSynced] = useState(null);

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
          params: { limit: 100 },
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
      console.error("LeadStatusSyncModal — load lists error:", err);
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

  useEffect(() => {
    if (!isOpen) return;
    setLeadsSynced(null);
    setSelectedBatchName("");
    setSelectedCampaignName("");
    loadLists();
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

    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`${aiBaseUrl}/api/instantly/sync-leads`, {
        batch_name: selectedBatchName.trim(),
        campaign_name: selectedCampaignName.trim(),
      });

      if (data?.success === false) {
        showError(data?.message || "Lead sync failed");
        return;
      }

      const raw = data?.leads_synced;
      if (raw == null || raw === "") {
        setLeadsSynced(null);
      } else {
        const num = Number(raw);
        setLeadsSynced(Number.isFinite(num) ? num : null);
      }
    } catch (err) {
      console.error("LeadStatusSyncModal — sync-leads error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to sync leads from Instantly";
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader color={textColor}>Sync lead status from Instantly</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
              <Text fontSize="sm" color="gray.500" flex="1" minW={0}>
                Same lists as Create. Pulls all leads for the campaign and saves status to the
                database.
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={loadLists}
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
                      .filter((c) => c && String(c.name ?? "").trim() !== "")
                      .map((c) => {
                        const name = c.name;
                        return (
                          <option key={String(c?.id ?? name)} value={name}>
                            {name}
                          </option>
                        );
                      })}
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
            isDisabled={isLoadingLists}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LeadStatusSyncModal;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
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
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { getApi, postApi } from "../../../services/api";
import { apiEndPoints } from "../../../config/path";
import { showError, showSuccess } from "../../../helpers/messageHelper";

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

const defaultForm = () => ({
  originalBatchName: "",
  originalCampaignName: "",
  newCampaignName: "",
  userPrompt: "",
  subjectPrompt: "",
});

/**
 * Follow-up Instantly flow: separate modal from Create (same visual language).
 */
const FollowupEmailModal = ({ isOpen, onClose, textColor, borderColor }) => {
  const [batchNames, setBatchNames] = useState([]);
  const [originalCampaignNames, setOriginalCampaignNames] = useState([]);
  const [newCampaignOptions, setNewCampaignOptions] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const resetForm = () => setForm(defaultForm());

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const loadLists = async () => {
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsLoadingLists(true);
    try {
      // Order must match destructuring: batch (AI) → draft campaign names (internal API) → Instantly campaigns (AI)
      const [batchRes, draftCampaignNamesRes, instantlyCampaignsRes] = await Promise.all([
        axios.get(`${aiBaseUrl}/api/draft/batch-names`),
        getApi(`${aiBaseUrl}/api/draft/campaign-names`),
        getApi(`${aiBaseUrl}/api/instantly/campaigns`, { params: { limit: 100 } }),
      ]);

      const names = batchRes?.data?.batch_names;
      const normalizedBatches = Array.isArray(names)
        ? names
            .map((n) => (typeof n === "string" ? n : n?.batch_name ?? ""))
            .filter(Boolean)
        : [];
      setBatchNames(normalizedBatches);

      const d = draftCampaignNamesRes?.data;
      const list = Array.isArray(d?.data?.campaign_names)
        ? d.data.campaign_names
        : Array.isArray(d?.campaign_names)
          ? d.campaign_names
          : [];
      setOriginalCampaignNames(list);

      const rawCampaigns = instantlyCampaignsRes?.data?.campaigns;
      const campList = Array.isArray(rawCampaigns) ? rawCampaigns : [];
      // API returns { id, name, status, ... } — keep objects so option value = name for submit
      setNewCampaignOptions(
        campList.filter((c) => c && String(c.name ?? "").trim() !== "")
      );
    } catch (err) {
      console.error("FollowupEmailModal — load lists error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load follow-up lists";
      showError(msg);
      setBatchNames([]);
      setNewCampaignOptions([]);
      setOriginalCampaignNames([]);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    loadLists();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!form.originalBatchName.trim()) {
      showError("Please select current batch name");
      return;
    }
    if (!form.originalCampaignName.trim()) {
      showError("Please select current campaign name");
      return;
    }
    if (!form.newCampaignName.trim()) {
      showError("Please select new campaign name");
      return;
    }
    if (!form.userPrompt.trim()) {
      showError("Please enter user prompt");
      return;
    }
    if (!form.subjectPrompt.trim()) {
      showError("Please enter subject prompt");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postApi(apiEndPoints.FOLLOWUP_START, {
        original_batch_name: form.originalBatchName.trim(),
        original_campaign_name: form.originalCampaignName.trim(),
        new_campaign_name: form.newCampaignName.trim(),
        user_prompt: form.userPrompt.trim(),
        subject_prompt: form.subjectPrompt.trim(),
        word_limit: 150,
      });

      const body = res?.data;
      if (body?.success === false) {
        showError(body?.message || "Follow-up start failed");
        return;
      }

      if (res.status === 202 || body?.success) {
        const tracker = body?.tracker_id ?? "—";
        const round = body?.follow_up_number ?? "—";
        showSuccess(
          `Follow-up started (tracker ${tracker}, follow-up #${round}).`
        );
        handleClose();
        return;
      }

      showSuccess(body?.message || "Request submitted.");
      handleClose();
    } catch (err) {
      console.error("FollowupEmailModal — submit error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start follow-up";
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="4xl">
      <ModalOverlay />
      <ModalContent mx={4} maxW="min(96vw, 960px)" w="full">
        <ModalHeader color={textColor}>Follow-up email</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                onClick={loadLists}
                isLoading={isLoadingLists}
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
                  <FormLabel fontSize="sm">Current batch name</FormLabel>
                  <Select
                    placeholder="Select batch name"
                    value={form.originalBatchName}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        originalBatchName: e.target.value,
                      }))
                    }
                  >
                    {batchNames.map((name) => (
                      <option key={String(name)} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Current campaign name</FormLabel>
                  <Select
                    placeholder="Select original campaign"
                    value={form.originalCampaignName}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        originalCampaignName: e.target.value,
                      }))
                    }
                  >
                    {originalCampaignNames.map((name) => (
                      <option key={String(name)} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">New campaign name</FormLabel>
                  <Select
                    placeholder="Select Instantly campaign"
                    value={form.newCampaignName}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        newCampaignName: e.target.value,
                      }))
                    }
                  >
                    {newCampaignOptions
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
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">User prompt</FormLabel>
                  <Textarea
                    value={form.userPrompt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userPrompt: e.target.value }))
                    }
                    rows={4}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Subject prompt</FormLabel>
                  <Textarea
                    value={form.subjectPrompt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subjectPrompt: e.target.value }))
                    }
                    rows={3}
                    borderColor={borderColor}
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={handleClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting"
            isDisabled={isLoadingLists}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FollowupEmailModal;

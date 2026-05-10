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
import { postApi } from "../../../services/api";
import { apiEndPoints } from "../../../config/path";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

const createInitialForm = () => ({
  originalBatchName: "",
  originalCampaignName: "",
  newCampaignName: "",
  userPrompt: "",
  subjectPrompt: "",
});

const FollowupEmailModalV2 = ({ isOpen, onClose, textColor, borderColor }) => {
  const [batchNames, setBatchNames] = useState([]);
  const [originalCampaignNames, setOriginalCampaignNames] = useState([]);
  const [newCampaignOptions, setNewCampaignOptions] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(createInitialForm);

  const aiBaseUrl = getAiV2BaseUrl();

  const reset = () => setForm(createInitialForm());

  const handleClose = () => {
    reset();
    onClose();
  };

  const loadLists = async () => {
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsLoadingLists(true);
    try {
      const [batchRes, campaignNamesRes, instantlyRes] = await Promise.all([
        axios.get(`${aiBaseUrl}/draft/batch-names`),
        axios.get(`${aiBaseUrl}/draft/campaign-names`),
        axios.get(`${aiBaseUrl}/instantly/campaigns`, { params: { limit: 100 } }),
      ]);

      const batch = batchRes?.data?.batch_names;
      setBatchNames(Array.isArray(batch) ? batch.filter(Boolean).map(String) : []);

      const cn = campaignNamesRes?.data?.campaign_names;
      setOriginalCampaignNames(Array.isArray(cn) ? cn.filter(Boolean).map(String) : []);

      const camps = instantlyRes?.data?.campaigns;
      setNewCampaignOptions(Array.isArray(camps) ? camps.filter((c) => c?.name) : []);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load follow-up lists");
      setBatchNames([]);
      setOriginalCampaignNames([]);
      setNewCampaignOptions([]);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    reset();
    loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (res?.status === 202 || body?.success) {
        showSuccess(
          `Follow-up started (tracker ${body?.tracker_id ?? "—"}, follow-up #${body?.follow_up_number ?? "—"}).`,
        );
      } else {
        showSuccess(body?.message || "Request submitted.");
      }
      handleClose();
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to start follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="4xl">
      <ModalOverlay />
      <ModalContent mx={4} maxW="min(96vw, 960px)" w="full">
        <ModalHeader color={textColor}>Follow-up email (AI 2)</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="flex-end">
              <Button size="sm" variant="outline" onClick={loadLists} isLoading={isLoadingLists}>
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
                    onChange={(e) => setForm((f) => ({ ...f, originalBatchName: e.target.value }))}
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
                  <FormLabel fontSize="sm">Current campaign name</FormLabel>
                  <Select
                    placeholder="Select original campaign"
                    value={form.originalCampaignName}
                    onChange={(e) => setForm((f) => ({ ...f, originalCampaignName: e.target.value }))}
                    borderColor={borderColor}
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
                    onChange={(e) => setForm((f) => ({ ...f, newCampaignName: e.target.value }))}
                    borderColor={borderColor}
                  >
                    {newCampaignOptions.map((c) => (
                      <option key={String(c?.id ?? c.name)} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">User prompt</FormLabel>
                  <Textarea
                    value={form.userPrompt}
                    onChange={(e) => setForm((f) => ({ ...f, userPrompt: e.target.value }))}
                    rows={4}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Subject prompt</FormLabel>
                  <Textarea
                    value={form.subjectPrompt}
                    onChange={(e) => setForm((f) => ({ ...f, subjectPrompt: e.target.value }))}
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
          <Button colorScheme="brand" onClick={handleSubmit} isLoading={isSubmitting} loadingText="Submitting" isDisabled={isLoadingLists}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FollowupEmailModalV2;


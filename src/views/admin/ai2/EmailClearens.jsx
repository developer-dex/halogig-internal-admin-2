import React, { useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdCloudUpload, MdDownload } from "react-icons/md";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

const headerValue = (headers, name) => {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name];
};

const fileBaseName = (fileName) => {
  if (!fileName || typeof fileName !== "string") return "export";
  const i = fileName.lastIndexOf(".");
  return i > 0 ? fileName.slice(0, i) : fileName;
};

const EmailClearensV2 = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastStats, setLastStats] = useState(null);

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const mutedBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const aiBaseUrl = getAiV2BaseUrl();

  const pickFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const extOk = file.name.toLowerCase().endsWith(".csv");
    const typeOk = file.type === "text/csv" || file.type === "application/vnd.ms-excel" || extOk;
    if (!typeOk) {
      showError("Please choose a CSV file.");
      e.target.value = "";
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showError("File must be 25 MB or smaller.");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setLastStats(null);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setLastStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cleanDownload = async () => {
    if (!selectedFile) {
      showError("Please select a CSV file.");
      return;
    }
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    setIsUploading(true);
    setLastStats(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(`${aiBaseUrl}/csv/clean`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const headers = response.headers || {};
      const original = headerValue(headers, "x-original-count");
      const cleaned = headerValue(headers, "x-cleaned-count");
      const removed = headerValue(headers, "x-removed-count");
      if (original != null || cleaned != null || removed != null) {
        setLastStats({
          original: original ?? "—",
          cleaned: cleaned ?? "—",
          removed: removed ?? "—",
        });
      }

      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const downloadName = `${fileBaseName(selectedFile.name)}_cleaned.csv`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showSuccess(`Download started: ${downloadName}`);
    } catch (err) {
      let msg = err?.response?.data?.message || err?.message || "Failed to clean CSV";
      const data = err?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          try {
            const j = JSON.parse(text);
            msg = j?.message || j?.error || text || msg;
          } catch {
            msg = text || msg;
          }
        } catch {
          /* ignore */
        }
      }
      showError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      <Heading as="h1" size="lg" color={textColor} fontWeight="700" mb={2}>
        Email Clearance (V2)
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={6} maxW="3xl">
        Upload a CSV that includes an email column (any layout). Rows whose emails appear in discarded or disposed lists are removed. You receive a cleaned CSV download.
      </Text>

      <Card variant="outline" borderColor={borderColor} bg={cardBg} borderRadius="xl">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFileChange} />

            <Flex flexWrap="wrap" gap={3} align="center">
              <Button leftIcon={<Icon as={MdCloudUpload} />} variant="outline" size="sm" onClick={pickFile} isDisabled={isUploading} borderColor={borderColor}>
                Choose CSV
              </Button>
              <Button
                leftIcon={<Icon as={MdDownload} />}
                colorScheme="brand"
                size="sm"
                onClick={cleanDownload}
                isLoading={isUploading}
                loadingText="Cleaning…"
                isDisabled={!selectedFile || isUploading}
              >
                Clean & download
              </Button>
              {selectedFile && (
                <Button variant="ghost" size="sm" onClick={clearFile} isDisabled={isUploading}>
                  Clear
                </Button>
              )}
            </Flex>

            {selectedFile && (
              <Text fontSize="sm" color={textColor}>
                Selected: <Text as="span" fontWeight="600">{selectedFile.name}</Text>
                {" · "}
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Text>
            )}

            {lastStats && (
              <Box borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={mutedBg} px={4} py={3}>
                <HStack spacing={6} flexWrap="wrap">
                  <Text fontSize="sm" color={textColor}>
                    Original: <Text as="span" fontWeight="700">{lastStats.original}</Text>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Cleaned: <Text as="span" fontWeight="700">{lastStats.cleaned}</Text>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Removed: <Text as="span" fontWeight="700">{lastStats.removed}</Text>
                  </Text>
                </HStack>
              </Box>
            )}

            {!aiBaseUrl && (
              <Box borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={mutedBg} px={4} py={3}>
                <Text fontSize="sm" color="gray.600">
                  Configure <strong>REACT_APP_AI_API_ENDPOINT</strong> to enable V2 API calls.
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EmailClearensV2;


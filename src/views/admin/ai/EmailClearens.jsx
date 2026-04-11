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

const getAiBaseUrl = () => {
  const base = process.env.REACT_APP_AI_API_ENDPOINT;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
};

const getHeader = (headers, name) => {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name];
};

const baseNameFromFile = (fileName) => {
  if (!fileName || typeof fileName !== "string") return "export";
  const i = fileName.lastIndexOf(".");
  return i > 0 ? fileName.slice(0, i) : fileName;
};

const EmailClearens = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastStats, setLastStats] = useState(null);

  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const mutedBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().endsWith(".csv");
    const okType =
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      ext;
    if (!okType) {
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

  const handleCleanDownload = async () => {
    if (!selectedFile) {
      showError("Please select a CSV file.");
      return;
    }
    const aiBaseUrl = getAiBaseUrl();
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true);
    setLastStats(null);
    try {
      const response = await axios.post(`${aiBaseUrl}/api/csv/clean`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const headers = response.headers || {};
      const original = getHeader(headers, "x-original-count");
      const cleaned = getHeader(headers, "x-cleaned-count");
      const removed = getHeader(headers, "x-removed-count");

      if (original != null || cleaned != null || removed != null) {
        setLastStats({
          original: original ?? "—",
          cleaned: cleaned ?? "—",
          removed: removed ?? "—",
        });
      }

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "text/csv;charset=utf-8" });

      const base = baseNameFromFile(selectedFile.name);
      const downloadName = `${base}_cleaned.csv`;

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
      console.error("EmailClearens — csv/clean error:", err);
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
          /* keep msg */
        }
      }
      showError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setLastStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Box>
      <Heading as="h1" size="lg" color={textColor} fontWeight="700" mb={2}>
        Email Clearens
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={6} maxW="3xl">
        Upload a CSV that includes an email column (any layout). Rows whose emails appear in
        discarded or disposed lists are removed. You receive a cleaned CSV download.
      </Text>

      <Card variant="outline" borderColor={borderColor} bg={cardBg} borderRadius="xl">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <Flex flexWrap="wrap" gap={3} align="center">
              <Button
                leftIcon={<Icon as={MdCloudUpload} />}
                variant="outline"
                size="sm"
                onClick={handlePickFile}
                isDisabled={isUploading}
                borderColor={borderColor}
              >
                Choose CSV
              </Button>
              <Button
                leftIcon={<Icon as={MdDownload} />}
                colorScheme="brand"
                size="sm"
                onClick={handleCleanDownload}
                isLoading={isUploading}
                loadingText="Cleaning…"
                isDisabled={!selectedFile || isUploading}
              >
                Clean & download
              </Button>
              {selectedFile && (
                <Button variant="ghost" size="sm" onClick={handleClearFile} isDisabled={isUploading}>
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
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                bg={mutedBg}
                px={4}
                py={3}
              >
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
                  Last run (response headers)
                </Text>
                <HStack spacing={6} flexWrap="wrap">
                  <Text fontSize="sm" color={textColor}>
                    Original: <Text as="span" fontWeight="700" color="brand.500">{lastStats.original}</Text>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Cleaned: <Text as="span" fontWeight="700" color="brand.500">{lastStats.cleaned}</Text>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Removed: <Text as="span" fontWeight="700" color="brand.500">{lastStats.removed}</Text>
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EmailClearens;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { MdExpandMore, MdInfoOutline } from "react-icons/md";
import { apiEndPoints } from "../../../config/path";
import { getApi } from "../../../services/api";
import { showError, showSuccess } from "../../../helpers/messageHelper";
import { getAiV2BaseUrl } from "./aiV2BaseUrl";

const kebabCase = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-");

/** V2 `/draft/generate` expects paths like `/ai-service/ai-developers` (full path after domain). */
const buildSlugUrlsFromSlugLink = (slugLink) => {
  if (!slugLink || !String(slugLink).trim()) return { slugUrl: "", fullSlugUrl: "" };
  let pathStr = String(slugLink).trim();
  pathStr = pathStr.replace(/^https?:\/\/(?:www\.)?halogig\.com\/?/i, "");
  pathStr = pathStr.replace(/^\/+/, "");
  pathStr = pathStr.replace(/\/+$/, "");
  if (!pathStr) return { slugUrl: "", fullSlugUrl: "" };
  return {
    slugUrl: `/${pathStr}`,
    fullSlugUrl: `https://halogig.com/${pathStr}`,
  };
};

/** Active web_rot rows filtered by admin API (LIKE on industry). */
const fetchActiveWebRotRowsForIndustry = async (getApi, industry) => {
  const params = new URLSearchParams({
    industry: industry.trim(),
    status: "active",
    limit: "500",
    page: "1",
  });
  const res = await getApi(`${apiEndPoints.GET_WEB_ROT_DATA}?${params.toString()}`);
  const block = res?.data?.data;
  return Array.isArray(block?.data) ? block.data : [];
};

/** V2 requires exact `service_name` match; tolerate case mismatch when resolving slug only. */
const pickExactServiceWebRotRow = (rows, subCategoryName) => {
  const target = String(subCategoryName).trim();
  if (!target || !Array.isArray(rows)) return null;
  const hasSlug = (r) => r?.slug_link && String(r.slug_link).trim();

  let m = rows.find((r) => String(r.service_name ?? "").trim() === target && hasSlug(r));
  if (m) return m;

  const tLower = target.toLowerCase();
  m = rows.find((r) => String(r.service_name ?? "").trim().toLowerCase() === tLower && hasSlug(r));
  return m || null;
};

const pickUniqueSlugLinkRow = (slugLinks, subCategoryName) => {
  const target = String(subCategoryName).trim();
  if (!target || !Array.isArray(slugLinks)) return null;
  let m = slugLinks.find((r) => String(r.service_name ?? "").trim() === target && r.slug_link);
  if (m) return m;
  const tLower = target.toLowerCase();
  return slugLinks.find((r) => String(r.service_name ?? "").trim().toLowerCase() === tLower && r.slug_link) || null;
};

/**
 * Fallback: Pick a website-data slug row for the selected taxonomy category + subcategory (legacy heuristic).
 */
const resolveWebsiteSlugRow = (websiteSlugs, categoryName, subCategoryName) => {
  if (!Array.isArray(websiteSlugs) || websiteSlugs.length === 0) return null;
  const subKebab = kebabCase(subCategoryName);
  const catKebab = kebabCase(categoryName);
  if (!subKebab) return null;

  const tryFind = (pred) => websiteSlugs.find(pred) || null;

  let m = tryFind((s) => {
    const fs = String(s.full_slug || "").replace(/^\/+/, "");
    const parts = fs.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    return last === subKebab || fs === subKebab || fs.endsWith(`/${subKebab}`);
  });
  if (m) return m;

  m = tryFind((s) => {
    const sl = String(s.slug || "").replace(/^\/+/, "");
    return kebabCase(sl) === subKebab || sl === subKebab;
  });
  if (m) return m;

  m = tryFind((s) => (s.full_slug || "").toLowerCase().includes(subKebab));
  if (m) return m;

  if (catKebab) {
    const catScoped = websiteSlugs.filter((s) => {
      const cat = kebabCase(s.category || "");
      const fs = String(s.full_slug || "").toLowerCase();
      return cat === catKebab || fs.startsWith(`${catKebab}/`) || fs.includes(`/${catKebab}/`);
    });
    m = catScoped.find((s) => (s.full_slug || "").toLowerCase().includes(subKebab));
    if (m) return m;
  }

  return null;
};

/** Website Data row → V2 `slugUrl` / `fullSlugUrl` using full path (e.g. `/ai-service/ai-developers`). */
const normalizePathNoDomain = (p) =>
  String(p ?? "")
    .trim()
    .replace(/^https?:\/\/(?:www\.)?halogig\.com\/?/i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

const buildSlugFieldsFromWebsiteRow = (selectedSlug) => {
  const pathNorm = normalizePathNoDomain(selectedSlug?.full_slug);
  if (!pathNorm) return { slugUrl: "", fullSlugUrl: "" };
  return {
    slugUrl: `/${pathNorm}`,
    fullSlugUrl: `https://halogig.com/${pathNorm}`,
  };
};

const encodeSlugPickRot = (slugLink, serviceName) =>
  `ROT:${JSON.stringify({
    slug_link: String(slugLink ?? ""),
    service_name: String(serviceName ?? ""),
  })}`;

const encodeSlugPickWd = (id) => `WD:${String(id ?? "")}`;

/** @returns {{ src:'rot', slug_link:string, service_name:string } | { src:'wd', id:string } | null} */
const decodeSlugPick = (v) => {
  if (!v || typeof v !== "string") return null;
  if (v.startsWith("ROT:")) {
    try {
      const o = JSON.parse(v.slice(4));
      if (o?.slug_link) return { src: "rot", slug_link: o.slug_link, service_name: o.service_name ?? "" };
    } catch {
      /* ignore */
    }
    return null;
  }
  if (v.startsWith("WD:")) {
    const id = v.slice(3);
    return id ? { src: "wd", id } : null;
  }
  return null;
};

const EMAIL_TOKENS = [
  { token: "<first_name>", description: "Recipient's first name (if available)." },
  { token: "<full_name>", description: "Recipient's full name (if available)." },
  { token: "<designation>", description: "Recipient's job title (if available)." },
  { token: "<company_name>", description: "Company name from email domain." },
  { token: "<business_nature>", description: "Company business nature." },
  { token: "<industry>", description: "Industry sector." },
  { token: "<category_name>", description: "Selected category name." },
  { token: "<subcategory_name>", description: "Selected subcategory name." },
  { token: "<email>", description: "Recipient email." },
];

const GenerateEmailsV2 = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const codeExampleBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const pageShellBg = useColorModeValue("gray.50", "gray.900");
  const sectionHeaderBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const accordionBtnBg = useColorModeValue("white", "whiteAlpha.50");
  const menuHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");

  const aiBaseUrl = getAiV2BaseUrl();
  const helpModal = useDisclosure();

  const [batchNames, setBatchNames] = useState([]);
  const [isLoadingBatchNames, setIsLoadingBatchNames] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState("");

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState("");

  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);

  const [websiteSlugs, setWebsiteSlugs] = useState([]);
  /** From `GET admin/web-rot-data/unique-slug-links` — pairs `service_name` + `slug_link`. */
  const [webRotSlugLinks, setWebRotSlugLinks] = useState([]);
  const [isLoadingSlugs, setIsLoadingSlugs] = useState(false);
  /** Encoded slug row; empty uses auto-resolve (industry + subcategory). */
  const [selectedSlugPick, setSelectedSlugPick] = useState("");
  const [slugSearchTerm, setSlugSearchTerm] = useState("");

  const [includeUrl, setIncludeUrl] = useState("true");
  const [wordLimit, setWordLimit] = useState(150);
  const [userPrompt, setUserPrompt] = useState("");
  const [subjectPrompt, setSubjectPrompt] = useState("");

  const [isExecuting, setIsExecuting] = useState(false);
  const [lastCampaignId, setLastCampaignId] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c?.id ?? c?.category_id ?? "") === String(categoryId)) || null,
    [categories, categoryId],
  );
  const selectedSubCategory = useMemo(
    () => subCategoryOptions.find((s) => String(s?.id ?? s?.sub_category_id ?? "") === String(subCategoryId)) || null,
    [subCategoryOptions, subCategoryId],
  );

  /** One entry per URL path; web_rot preferred over website data when paths collide. Same list style as legacy Generate Emails (`ai-service/...`). */
  const slugMenuEntries = useMemo(() => {
    const byPath = new Map();
    (webRotSlugLinks || []).forEach((r) => {
      const slug = String(r.slug_link ?? "").trim();
      const svc = String(r.service_name ?? "").trim();
      if (!slug) return;
      const displayPath = normalizePathNoDomain(slug);
      if (!displayPath) return;
      const kl = displayPath.toLowerCase();
      if (!byPath.has(kl)) {
        byPath.set(kl, {
          key: encodeSlugPickRot(slug, svc),
          displayPath,
        });
      }
    });
    (websiteSlugs || []).forEach((w) => {
      const fs = String(w.full_slug ?? "").trim();
      if (!fs) return;
      const displayPath = normalizePathNoDomain(fs);
      if (!displayPath) return;
      const kl = displayPath.toLowerCase();
      if (!byPath.has(kl)) {
        byPath.set(kl, {
          key: encodeSlugPickWd(w.id),
          displayPath,
        });
      }
    });
    return [...byPath.values()].sort((a, b) => a.displayPath.localeCompare(b.displayPath));
  }, [webRotSlugLinks, websiteSlugs]);

  const filteredSlugMenuEntries = useMemo(() => {
    const q = slugSearchTerm.trim().toLowerCase();
    if (!q) return slugMenuEntries;
    return slugMenuEntries.filter((e) => e.displayPath.toLowerCase().includes(q));
  }, [slugMenuEntries, slugSearchTerm]);

  const selectedSlugDisplayPath = useMemo(() => {
    if (!selectedSlugPick) return "";
    const hit = slugMenuEntries.find((e) => e.key === selectedSlugPick);
    if (hit) return hit.displayPath;
    const picked = decodeSlugPick(selectedSlugPick);
    if (picked?.src === "rot" && picked.slug_link) return normalizePathNoDomain(picked.slug_link);
    if (picked?.src === "wd") {
      const row = websiteSlugs.find((w) => String(w.id ?? "") === String(picked.id));
      return row ? normalizePathNoDomain(row.full_slug) : "";
    }
    return "";
  }, [selectedSlugPick, slugMenuEntries, websiteSlugs]);

  useEffect(() => {
    setSelectedSlugPick("");
    setSlugSearchTerm("");
  }, [subCategoryId, selectedIndustry]);

  const loadBatchNames = async () => {
    if (!aiBaseUrl) return;
    setIsLoadingBatchNames(true);
    try {
      const { data } = await axios.get(`${aiBaseUrl}/batch-names`);
      const raw = data?.batch_names;
      setBatchNames(Array.isArray(raw) ? raw.filter(Boolean).map(String) : []);
    } catch {
      setBatchNames([]);
    } finally {
      setIsLoadingBatchNames(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await getApi(apiEndPoints.GET_ALL_CATEGORIES);
      const list = res?.data?.data;
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadIndustries = async () => {
    setIsLoadingIndustries(true);
    try {
      const res = await getApi(apiEndPoints.GET_WEB_ROT_UNIQUE_INDUSTRIES);
      const raw = res?.data?.data;
      const list = Array.isArray(raw) ? raw.filter((x) => x != null && String(x).trim() !== "") : [];
      setIndustries(list.map((x) => String(x).trim()));
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load industries");
      setIndustries([]);
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  /** Website slugs + web_rot slug links loaded for resolve-time fallbacks (V2 aligns with web_rot_data). */
  const loadSlugReferenceCaches = async () => {
    setIsLoadingSlugs(true);
    try {
      const [slugRes, linkRes] = await Promise.all([
        getApi(apiEndPoints.GET_WEBSITE_DATA_SLUG),
        getApi(apiEndPoints.GET_WEB_ROT_UNIQUE_SLUG_LINKS),
      ]);
      setWebsiteSlugs(Array.isArray(slugRes?.data?.data) ? slugRes.data.data : []);
      setWebRotSlugLinks(Array.isArray(linkRes?.data?.data) ? linkRes.data.data : []);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load slug reference data");
      setWebsiteSlugs([]);
      setWebRotSlugLinks([]);
    } finally {
      setIsLoadingSlugs(false);
    }
  };

  const loadSubCategories = async (catId) => {
    if (!catId) {
      setSubCategoryOptions([]);
      return;
    }
    setIsLoadingSubCategories(true);
    try {
      const res = await getApi(`${apiEndPoints.GET_SUB_CATEGORIES_BY_CATEGORY}/${catId}/information`);
      const list = res?.data?.data;
      setSubCategoryOptions(Array.isArray(list) ? list : []);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to load subcategories");
      setSubCategoryOptions([]);
    } finally {
      setIsLoadingSubCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadIndustries();
    loadSlugReferenceCaches();
    if (aiBaseUrl) loadBatchNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSubCategoryId("");
    if (categoryId) loadSubCategories(categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleExecute = async () => {
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }
    if (!selectedBatchName.trim()) {
      showError("Please select a batch name");
      return;
    }
    if (!selectedCategory) {
      showError("Please select a category");
      return;
    }
    if (!selectedSubCategory) {
      showError("Please select a subcategory");
      return;
    }
    if (!selectedIndustry.trim()) {
      showError("Please select an industry");
      return;
    }

    const categoryName = String(selectedCategory?.name ?? selectedCategory?.category_name ?? "").trim();
    let subCategoryName = String(
      selectedSubCategory?.name ?? selectedSubCategory?.sub_category_name ?? selectedSubCategory?.service_name ?? "",
    ).trim();
    let industryForPayload = selectedIndustry.trim();

    let slugUrl = "";
    let fullSlugUrl = "";

    /** 0) User-selected slug path (explicit). */
    const picked = decodeSlugPick(selectedSlugPick);
    if (picked?.src === "rot") {
      const svc = String(picked.service_name ?? "").trim();
      if (svc) subCategoryName = svc;
      ({ slugUrl, fullSlugUrl } = buildSlugUrlsFromSlugLink(picked.slug_link));
    } else if (picked?.src === "wd") {
      const row = websiteSlugs.find((w) => String(w.id ?? "") === String(picked.id));
      if (row) {
        const built = buildSlugFieldsFromWebsiteRow(row);
        slugUrl = built.slugUrl;
        fullSlugUrl = built.fullSlugUrl;
      }
    }

    /** 1) Preferred: active `web_rot_data` row for selected industry + exact `service_name` (V2 source of truth). */
    if (!slugUrl || !fullSlugUrl) {
      try {
        const rotRows = await fetchActiveWebRotRowsForIndustry(getApi, industryForPayload);
        const rotRow = pickExactServiceWebRotRow(rotRows, subCategoryName);
        if (rotRow?.slug_link) {
          subCategoryName = String(rotRow.service_name).trim();
          industryForPayload = String(rotRow.industry ?? industryForPayload).trim();
          ({ slugUrl, fullSlugUrl } = buildSlugUrlsFromSlugLink(rotRow.slug_link));
        }
      } catch {
        /* try fallbacks below */
      }
    }

    /** 2) `unique-slug-links`: same DB table, keyed by service_name (+ slug_link). */
    if (!slugUrl || !fullSlugUrl) {
      const linkRow = pickUniqueSlugLinkRow(webRotSlugLinks, subCategoryName);
      if (linkRow?.slug_link) {
        subCategoryName = String(linkRow.service_name).trim();
        ({ slugUrl, fullSlugUrl } = buildSlugUrlsFromSlugLink(linkRow.slug_link));
      }
    }

    /** 3) Legacy: Website Data grouped slugs (may not match web_rot — last resort). */
    if (!slugUrl || !fullSlugUrl) {
      const slugRowWd = resolveWebsiteSlugRow(websiteSlugs, categoryName, subCategoryName);
      if (slugRowWd) {
        const built = buildSlugFieldsFromWebsiteRow(slugRowWd);
        slugUrl = built.slugUrl;
        fullSlugUrl = built.fullSlugUrl;
      }
    }

    if (!slugUrl || !fullSlugUrl) {
      showError(
        [
          "No slug found for this run.",
          "Pick a slug in the slug dropdown, or leave it on auto and ensure active web_rot_data matches subcategory + industry with slug_link set.",
          "Taxonomy subcategory must match web_rot_data.service_name when using auto-resolve.",
        ].join(" "),
      );
      return;
    }

    setIsExecuting(true);
    setLastCampaignId("");
    try {
      const payload = {
        batchName: selectedBatchName.trim(),
        categoryName,
        subCategoryName,
        industry: industryForPayload,
        slugUrl,
        fullSlugUrl,
        user_prompt: userPrompt,
        subject_prompt: subjectPrompt,
        word_limit: Number(wordLimit) || 150,
        include_url: includeUrl === "true",
      };

      const res = await axios.post(`${aiBaseUrl}/draft/generate`, payload, {
        validateStatus: (s) => (s >= 200 && s < 300) || s === 202,
      });

      if (res?.data?.success === false) {
        showError(res?.data?.message || "Draft generation request failed");
        return;
      }

      const id = res?.data?.campaign_id || "";
      setLastCampaignId(id);
      showSuccess(id ? `Draft generation started (campaign_id: ${id}).` : "Draft generation started.");
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Failed to start draft generation");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Box bg={pageShellBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} p={{ base: 4, md: 5 }}>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={3} mb={4} flexWrap="wrap">
        <Box>
          <Heading as="h2" size="md" color={textColor} fontWeight="700">
            Generate Emails (V2)
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Generate drafts for all valid emails in a batch (category is passed at generation time).
          </Text>
        </Box>
        <Button leftIcon={<Icon as={MdInfoOutline} />} size="sm" variant="outline" onClick={helpModal.onOpen} borderColor={borderColor}>
          Prompt help
        </Button>
      </Flex>

      <Card variant="outline" borderColor={borderColor} bg={cardBg} borderRadius="xl">
        <CardHeader pb={3} bg={sectionHeaderBg} borderTopRadius="xl">
          <Heading as="h3" size="sm" color={textColor} fontWeight="700">
            Generation inputs
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {!aiBaseUrl && (
              <Alert status="warning" borderRadius="md" variant="subtle">
                <AlertIcon />
                <Box>
                  <AlertTitle>Missing AI endpoint</AlertTitle>
                  <AlertDescription>
                    Configure <strong>REACT_APP_AI_API_ENDPOINT</strong> to enable V2 calls.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <HStack spacing={4} flexWrap="wrap" align="flex-start">
              <FormControl w={{ base: "100%", md: "280px" }} isRequired>
                <FormLabel fontSize="sm" color={textColor}>
                  Batch name
                </FormLabel>
                <Select
                  size="sm"
                  borderColor={borderColor}
                  placeholder={isLoadingBatchNames ? "Loading..." : "Select batch"}
                  value={selectedBatchName}
                  onChange={(e) => setSelectedBatchName(e.target.value)}
                  isDisabled={isLoadingBatchNames || !aiBaseUrl}
                >
                  {batchNames.map((n) => (
                    <option key={String(n)} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl w={{ base: "100%", md: "260px" }} isRequired>
                <FormLabel fontSize="sm" color={textColor}>
                  Category
                </FormLabel>
                <Select
                  size="sm"
                  borderColor={borderColor}
                  placeholder={isLoadingCategories ? "Loading..." : "Select category"}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  isDisabled={isLoadingCategories}
                >
                  {categories.map((c) => {
                    const id = String(c?.id ?? c?.category_id ?? "");
                    const name = c?.name ?? c?.category_name ?? id;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl w={{ base: "100%", md: "300px" }} isRequired>
                <FormLabel fontSize="sm" color={textColor}>
                  Subcategory
                </FormLabel>
                <Select
                  size="sm"
                  borderColor={borderColor}
                  placeholder={isLoadingSubCategories ? "Loading..." : "Select subcategory"}
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  isDisabled={!categoryId || isLoadingSubCategories}
                >
                  {subCategoryOptions.map((s) => {
                    const id = String(s?.id ?? s?.sub_category_id ?? "");
                    const name = s?.name ?? s?.sub_category_name ?? s?.service_name ?? id;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4} flexWrap="wrap" align="flex-start">
              <FormControl w={{ base: "100%", md: "340px" }} isRequired>
                <FormLabel fontSize="sm" color={textColor}>
                  Industry
                </FormLabel>
                <Select
                  size="sm"
                  borderColor={borderColor}
                  placeholder={isLoadingIndustries ? "Loading industries..." : "Select industry"}
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  isDisabled={isLoadingIndustries || industries.length === 0}
                >
                  {industries.map((name) => (
                    <option key={String(name)} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <FormControl maxW={{ base: "100%", md: "480px" }}>
              <FormLabel fontSize="sm" color={textColor}>
                Slug
              </FormLabel>
              <VStack align="stretch" spacing={2}>
                <Menu closeOnSelect>
                  <MenuButton
                    as={Button}
                    rightIcon={<MdExpandMore />}
                    size="sm"
                    variant="outline"
                    borderColor={borderColor}
                    width="100%"
                    fontWeight="normal"
                    height="auto"
                    minH="32px"
                    py={2}
                    isDisabled={isLoadingSlugs}
                  >
                    <Flex w="100%" align="center" minW={0} gap={2}>
                      <Text flex="1" fontSize="sm" noOfLines={1} textAlign="left">
                        {selectedSlugDisplayPath || "Select slug"}
                      </Text>
                    </Flex>
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto" minW="300px">
                    <Box px={2} pt={2} pb={1}>
                      <Input
                        placeholder="Search slug…"
                        size="sm"
                        borderColor={borderColor}
                        value={slugSearchTerm}
                        onChange={(e) => setSlugSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </Box>
                    {filteredSlugMenuEntries.length === 0 ? (
                      <MenuItem isDisabled fontSize="sm">
                        No slugs found
                      </MenuItem>
                    ) : (
                      filteredSlugMenuEntries.map((e) => (
                        <MenuItem
                          key={e.key}
                          _hover={{ bg: menuHoverBg }}
                          onClick={() => {
                            setSelectedSlugPick(e.key);
                            setSlugSearchTerm("");
                          }}
                        >
                          <Text fontSize="sm" color={textColor}>
                            {e.displayPath}
                          </Text>
                        </MenuItem>
                      ))
                    )}
                  </MenuList>
                </Menu>

                {selectedSlugPick ? (
                  <Tag
                    size="md"
                    maxW="100%"
                    variant="subtle"
                    colorScheme="blue"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    <TagLabel overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flex="1" minW={0} title={selectedSlugDisplayPath}>
                      {selectedSlugDisplayPath}
                    </TagLabel>
                    <TagCloseButton
                      color="red.500"
                      _hover={{ bg: "red.50", color: "red.600" }}
                      onClick={() => setSelectedSlugPick("")}
                      aria-label="Clear slug selection"
                    />
                  </Tag>
                ) : null}
              </VStack>
            </FormControl>

            <HStack spacing={4} flexWrap="wrap" align="flex-start">
              <FormControl w={{ base: "100%", md: "220px" }}>
                <FormLabel fontSize="sm" color={textColor}>
                  Include URL
                </FormLabel>
                <Select size="sm" borderColor={borderColor} value={includeUrl} onChange={(e) => setIncludeUrl(e.target.value)}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </FormControl>

              <FormControl w={{ base: "100%", md: "220px" }}>
                <FormLabel fontSize="sm" color={textColor}>
                  Word limit
                </FormLabel>
                <Input size="sm" borderColor={borderColor} type="number" min={50} max={400} value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel fontSize="sm" color={textColor}>
                User prompt (optional)
              </FormLabel>
              <Textarea borderColor={borderColor} rows={4} value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} placeholder="Extra instructions for the email body..." />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color={textColor}>
                Subject prompt (optional)
              </FormLabel>
              <Textarea borderColor={borderColor} rows={3} value={subjectPrompt} onChange={(e) => setSubjectPrompt(e.target.value)} placeholder="Extra instructions for subject line..." />
            </FormControl>

            <Flex justify="space-between" align="center" flexWrap="wrap" gap={3} pt={2}>
              <Box>
                {lastCampaignId ? (
                  <Text fontSize="sm" color="gray.600">
                    Last campaign id: <Badge colorScheme="brand" variant="subtle">{lastCampaignId}</Badge>
                  </Text>
                ) : null}
              </Box>
              <Button
                colorScheme="brand"
                onClick={handleExecute}
                isLoading={isExecuting}
                loadingText="Starting…"
                isDisabled={!aiBaseUrl || isLoadingSlugs}
              >
                Generate drafts
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      <Modal isOpen={helpModal.isOpen} onClose={helpModal.onClose} isCentered size="3xl">
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader color={textColor}>Prompt tokens (V2)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box bg={codeExampleBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" p={4} mb={4}>
              <Text fontSize="sm" color="gray.600">
                Use these placeholders in your prompts. Availability depends on enrichment data.
              </Text>
            </Box>

            <Accordion allowMultiple>
              {EMAIL_TOKENS.map((t) => (
                <AccordionItem key={t.token} borderColor={borderColor}>
                  <h2>
                    <AccordionButton bg={accordionBtnBg} _hover={{ bg: accordionBtnBg }}>
                      <Box flex="1" textAlign="left">
                        <Code fontSize="sm">{t.token}</Code>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text fontSize="sm" color="gray.600">
                      {t.description}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={helpModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GenerateEmailsV2;


import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Select,
  useColorModeValue,
  Radio,
  RadioGroup,
  Stack,
  IconButton,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  VStack,
  HStack,
  Input,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Icon,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Portal,
} from "@chakra-ui/react";
import { MdClose, MdExpandMore, MdInfoOutline } from "react-icons/md";
import axios from "axios";
import { getApi, postApi } from "../../../services/api";
import { apiEndPoints } from "../../../config/path";
import { showError, showSuccess } from "../../../helpers/messageHelper";

/** Placeholders for email / subject prompts (Generate Emails). */
const EMAIL_PROMPT_TEMPLATE_VARIABLES = [
  {
    token: "<first_name>",
    description: "Recipient's first name.",
    examplePrompt: "Hi <first_name>,",
    exampleResult: "Hi Anurag,",
    requiresFlag: "include_first_name = true",
  },
  {
    token: "<full_name>",
    description: "Recipient's full name.",
    examplePrompt: "Dear <full_name>,",
    exampleResult: "Dear Anurag Tandon,",
    requiresFlag: "include_full_name = true",
  },
  {
    token: "<designation>",
    description: "Recipient's job title.",
    examplePrompt: "As a <designation> at <company_name>...",
    exampleResult: "As a VP Engineering at Tata Motors...",
    requiresFlag: "include_designation = true",
  },
  {
    token: "<company_name>",
    description: "Company name from email domain.",
    examplePrompt: "I noticed <company_name> is growing fast.",
    exampleResult: "I noticed Flipkart is growing fast.",
    alwaysAvailable: true,
  },
  {
    token: "<business_nature>",
    description: "What the company does (Manufacturer, Trader, etc).",
    examplePrompt: "As a leading <business_nature>...",
    exampleResult: "As a leading Kitchen Appliances Manufacturer...",
    alwaysAvailable: true,
  },
  {
    token: "<industry>",
    description: "Industry sector.",
    examplePrompt: "The <industry> sector is adopting AI.",
    exampleResult: "The Building Materials sector is adopting AI.",
    alwaysAvailable: true,
  },
  {
    token: "<category_name>",
    description: "Service category being promoted.",
    examplePrompt: "Our <category_name> team can help.",
    exampleResult: "Our AI Developer team can help.",
    alwaysAvailable: true,
  },
  {
    token: "<subcategory_name>",
    description: "Specific service being promoted.",
    examplePrompt: "We offer <subcategory_name> services.",
    exampleResult: "We offer Machine Learning Developer services.",
    alwaysAvailable: true,
  },
  {
    token: "<email>",
    description: "Recipient's email address.",
    examplePrompt: "Sent to <email>",
    exampleResult: "Sent to john@flipkart.com",
    alwaysAvailable: true,
  },
];

const GenerateEmails = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const cardBg = useColorModeValue("white", "gray.700");
  const promptGuidelinesModal = useDisclosure();
  const sampleModalHeaderIconBg = useColorModeValue("brand.50", "whiteAlpha.100");
  const sampleCardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const sampleCardIconBg = useColorModeValue("white", "whiteAlpha.100");
  const codeExampleBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const pageShellBg = useColorModeValue("gray.50", "gray.900");
  const sectionHeaderBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const accordionBtnBg = useColorModeValue("white", "whiteAlpha.50");

  // State for special category type selection (1, 2, or 3)
  const [selectedCategoryType, setSelectedCategoryType] = useState("");
  
  // State for special category values from API
  const [specialCategoryValues, setSpecialCategoryValues] = useState([]);
  const [isLoadingSpecialCategories, setIsLoadingSpecialCategories] = useState(false);
  
  // State for selected items from the multi-select
  const [selectedItems, setSelectedItems] = useState([]);
  
  // State for all categories from API
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // State for sub-categories (keyed by category id)
  const [subCategories, setSubCategories] = useState({});
  const [loadingSubCategories, setLoadingSubCategories] = useState({});

  // State for each selected item's category, sub-category, and slug selections
  const [itemSelections, setItemSelections] = useState({});

  // State for website data slugs
  const [websiteSlugs, setWebsiteSlugs] = useState([]);
  const [isLoadingSlugs, setIsLoadingSlugs] = useState(false);
  const [slugSearchTerms, setSlugSearchTerms] = useState({});

  // State for category and sub-category search terms
  const [categorySearchTerms, setCategorySearchTerms] = useState({});
  const [subCategorySearchTerms, setSubCategorySearchTerms] = useState({});

  // State for multi-select dropdown
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  // State for batch names
  const [batchNames, setBatchNames] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [isLoadingBatchNames, setIsLoadingBatchNames] = useState(false);

  // State for execute operation
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch special category values when both category type and batch are selected
  useEffect(() => {
    if (selectedCategoryType && selectedBatchId) {
      fetchSpecialCategoryValues(selectedCategoryType, selectedBatchId);
    } else {
      setSpecialCategoryValues([]);
      setSelectedItems([]);
      setItemSelections({});
    }
  }, [selectedCategoryType, selectedBatchId]);

  // Fetch all categories, batch names, and slugs on mount
  useEffect(() => {
    fetchCategories();
    fetchBatchNames();
    fetchWebsiteSlugs();
  }, []);

  // Debug: Log categories when they change
  useEffect(() => {
    console.log("Categories state updated:", categories);
  }, [categories]);

  const fetchSpecialCategoryValues = async (categoryType, batchId) => {
    setIsLoadingSpecialCategories(true);
    try {
      const response = await postApi(apiEndPoints.GET_UNIQUE_SPECIAL_CATEGORY, {
        category: categoryType,
        batch_id: batchId,
      });
      const data = response?.data?.data || [];
      // Extract unique values and filter out null/empty
      const categoryKey = `special_category_${categoryType}`;
      const uniqueValues = data
        .map((item) => item[categoryKey])
        .filter((value) => value !== null && value !== "" && value !== undefined);
      setSpecialCategoryValues(uniqueValues);
    } catch (error) {
      showError("Failed to fetch special category values");
      console.error("fetchSpecialCategoryValues error:", error);
    } finally {
      setIsLoadingSpecialCategories(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await getApi(apiEndPoints.GET_ALL_CATEGORIES);
      console.log("Categories API Response:", response);
      const data = response?.data?.data || [];
      console.log("Categories Data:", data);
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        console.warn("No categories found in response");
        setCategories([]);
      }
    } catch (error) {
      showError("Failed to fetch categories");
      console.error("fetchCategories error:", error);
      console.error("Error response:", error?.response);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (subCategories[categoryId]) return; // Already fetched
    
    setLoadingSubCategories((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const response = await getApi(
        `${apiEndPoints.GET_SUB_CATEGORIES_BY_CATEGORY}/${categoryId}/information`
      );
      const data = response?.data?.data || [];
      setSubCategories((prev) => ({ ...prev, [categoryId]: data }));
    } catch (error) {
      showError("Failed to fetch sub-categories");
      console.error("fetchSubCategories error:", error);
    } finally {
      setLoadingSubCategories((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const fetchBatchNames = async () => {
    setIsLoadingBatchNames(true);
    try {
      const response = await getApi(apiEndPoints.GET_BATCH_NAME);
      console.log("Batch Names API Response:", response);
      const data = response?.data?.data || [];
      console.log("Batch Names Data:", data);
      // Store full batch objects with batch_name and batch_id
      setBatchNames(data);
    } catch (error) {
      showError("Failed to fetch batch names");
      console.error("fetchBatchNames error:", error);
      console.error("Error response:", error?.response);
      setBatchNames([]);
    } finally {
      setIsLoadingBatchNames(false);
    }
  };

  const handleCategoryTypeChange = (value) => {
    setSelectedCategoryType(value);
    setSelectedItems([]);
    setItemSelections({});
  };

  const handleBatchNameChange = (batchName) => {
    setSelectedBatchName(batchName);
    // Find the batch_id for the selected batch_name
    const selectedBatch = batchNames.find((batch) => batch.batch_name === batchName);
    if (selectedBatch) {
      setSelectedBatchId(selectedBatch.batch_id);
    } else {
      setSelectedBatchId("");
    }
    // Clear category selection when batch changes
    setSelectedCategoryType("");
    setSelectedItems([]);
    setItemSelections({});
  };

  const handleSpecialCategorySelect = (value) => {
    if (selectedItems.includes(value)) {
      // Remove item
      setSelectedItems((prev) => prev.filter((item) => item !== value));
      setItemSelections((prev) => {
        const newSelections = { ...prev };
        delete newSelections[value];
        return newSelections;
      });
      } else {
      // Add item
      setSelectedItems((prev) => [...prev, value]);
      setItemSelections((prev) => ({
        ...prev,
        [value]: {
          categoryId: "",
          subCategoryId: "",
          slugId: "",
          userPrompt: "",
          subjectPrompt: "",
          wordLimit: "",
        },
      }));
    }
  };

  const handleRemoveItem = (value) => {
    setSelectedItems((prev) => prev.filter((item) => item !== value));
    setItemSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[value];
      return newSelections;
    });
    // Clear search terms for this item
    setCategorySearchTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[value];
      return newTerms;
    });
    setSubCategorySearchTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[value];
      return newTerms;
    });
    setSlugSearchTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[value];
      return newTerms;
    });
  };

  const handleCategoryChange = (itemValue, categoryId) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemValue]: { ...prev[itemValue], categoryId, subCategoryId: "", slugId: "" },
    }));
    // Clear category search term when category is selected
    setCategorySearchTerms((prev) => ({
      ...prev,
      [itemValue]: "",
    }));
    if (categoryId) {
      fetchSubCategories(categoryId);
    }
  };

  const handleCategorySearchChange = (itemValue, searchTerm) => {
    setCategorySearchTerms((prev) => ({
      ...prev,
      [itemValue]: searchTerm,
    }));
  };

  const handleSubCategoryChange = (itemValue, subCategoryId) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemValue]: { ...prev[itemValue], subCategoryId, slugId: "" },
    }));
    // Clear sub-category search term when sub-category is selected
    setSubCategorySearchTerms((prev) => ({
      ...prev,
      [itemValue]: "",
    }));
  };

  const handleSubCategorySearchChange = (itemValue, searchTerm) => {
    setSubCategorySearchTerms((prev) => ({
      ...prev,
      [itemValue]: searchTerm,
    }));
  };

  const handleSlugChange = (itemValue, slugId) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemValue]: { ...prev[itemValue], slugId },
    }));
    // Clear slug search term after selection
    setSlugSearchTerms((prev) => ({
      ...prev,
      [itemValue]: "",
    }));
  };

  const handleSlugSearchChange = (itemValue, searchTerm) => {
    setSlugSearchTerms((prev) => ({
      ...prev,
      [itemValue]: searchTerm,
    }));
  };

  const handleItemFieldChange = (itemValue, field, value) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemValue]: {
        ...prev[itemValue],
        [field]: value,
      },
    }));
  };

  const fetchWebsiteSlugs = async () => {
    setIsLoadingSlugs(true);
    try {
      const response = await getApi(apiEndPoints.GET_WEBSITE_DATA_SLUG);
      const data = response?.data?.data || [];
      setWebsiteSlugs(data);
    } catch (error) {
      showError("Failed to fetch website slugs");
      console.error("fetchWebsiteSlugs error:", error);
      setWebsiteSlugs([]);
    } finally {
      setIsLoadingSlugs(false);
    }
  };

  const handleReset = () => {
    setSelectedCategoryType("");
    setSpecialCategoryValues([]);
    setSelectedItems([]);
    setItemSelections({});
    setSelectedBatchName("");
    setSelectedBatchId("");
  };

  const handleExecute = async () => {
    // Validate that all items have category, sub-category, and slug selected
    const incompleteItems = selectedItems.filter((item) => {
      const selection = itemSelections[item];
      return (
        !selection?.categoryId ||
        !selection?.subCategoryId ||
        !selection?.slugId ||
        !selection?.wordLimit
      );
    });

    if (incompleteItems.length > 0) {
      showError("Please fill all required fields for each selected item");
      return;
    }

    if (selectedItems.length === 0) {
      showError("Please select at least one special category value");
      return;
    }

    if (!selectedBatchName) {
      showError("Please select a batch name");
      return;
    }

    // Prepare data for execution
    const emailData = selectedItems.map((item) => {
      const selection = itemSelections[item];
      const categoryId = selection.categoryId;
      const subCategoryId = selection.subCategoryId;
      
      // Find category name
      const category = categories.find((cat) => cat.id.toString() === categoryId.toString());
      const categoryName = category?.name || "";
      
      // Find sub-category name
      const availableSubCategories = subCategories[categoryId] || [];
      const subCategory = availableSubCategories.find(
        (subCat) => subCat.id.toString() === subCategoryId.toString()
      );
      const subCategoryName = subCategory?.name || "";

      // Find slug
      const slugId = selection.slugId;
      const selectedSlug = websiteSlugs.find(
        (slug) => slug.id?.toString() === slugId?.toString()
      );
      const fullSlug = selectedSlug?.full_slug 
        ? `https://halogig.com/${selectedSlug.full_slug}` 
        : "";
      return {
        specialCategoryType: selectedCategoryType,
        specialCategoryValue: item,
        categoryId: Number(categoryId),
        categoryName: categoryName,
        subCategoryId: Number(subCategoryId),
        subCategoryName: subCategoryName,
        slugUrl: `/${selectedSlug?.full_slug?.split('/').pop()}`,
        batchName: selectedBatchName,
        fullSlugUrl: fullSlug,
        user_prompt: selection?.userPrompt?.trim() || "",
        subject_prompt: selection?.subjectPrompt?.trim() || "",
        word_limit: Number(selection?.wordLimit),
      };
    });

    console.log("Execute data:", emailData);

    const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
    if (!aiBaseUrl) {
      showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
      return;
    }

    // Call the API
    setIsExecuting(true);
    try {
      const response = await axios.post(`${aiBaseUrl}/api/draft/generate`, {
        emailData: emailData,
      });
      
      console.log("Campaign send response:", response);
      showSuccess("Campaign execution started successfully");
      
      // Optionally reset the form after successful execution
      // handleReset();
    } catch (error) {
      console.error("Campaign send error:", error);
      const errorMessage = error?.response?.data?.message || "Failed to start campaign execution";
      showError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Box bg={pageShellBg} borderRadius="2xl" py={{ base: 4, md: 6 }} px={{ base: 3, md: 5 }}>
      <VStack spacing={5} align="stretch">
        {/* Page hero — Chakra Card pattern (v3-style title + description + action) */}
        <Card variant="outline" borderRadius="xl" borderColor={borderColor} boxShadow="sm" bg={cardBg} overflow="hidden">
          <CardBody py={{ base: 4, md: 5 }} px={{ base: 4, md: 6 }}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "flex-start" }}
              justify="space-between"
              gap={4}
            >
              <Box flex="1" minW={0}>
                <Heading as="h1" size="lg" color={textColor} fontWeight="700" letterSpacing="-0.02em">
                  Generate emails
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={2} lineHeight="tall" maxW="2xl">
                  Pick a batch and special-category values, configure prompts per row, then execute. Open{" "}
                  <Text as="span" fontWeight="600" color="brand.600">
                    Prompt Guidelines
                  </Text>{" "}
                  for supported template variables.
                </Text>
              </Box>
              <Button
                leftIcon={<Icon as={MdInfoOutline} boxSize={5} />}
                variant="outline"
                size="sm"
                borderColor={borderColor}
                onClick={promptGuidelinesModal.onOpen}
                _hover={{ borderColor: "brand.500", bg: sampleModalHeaderIconBg }}
                alignSelf={{ base: "stretch", md: "center" }}
                flexShrink={0}
              >
                Prompt Guidelines
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Batch name */}
        <Card variant="outline" borderRadius="xl" borderColor={borderColor} boxShadow="sm" bg={cardBg} overflow="hidden">
          <CardHeader
            py={3}
            px={{ base: 4, md: 5 }}
            bg={sectionHeaderBg}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <Heading size="sm" color={textColor} fontWeight="700">
              1 · Batch name
            </Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={1}>
              All downstream filters use this batch.
            </Text>
          </CardHeader>
          <CardBody px={{ base: 4, md: 5 }} py={4}>
            <Select
              placeholder={
                isLoadingBatchNames
                  ? "Loading batch names..."
                  : batchNames.length === 0
                  ? "No batch names available"
                  : "Select batch name"
              }
              value={selectedBatchName}
              onChange={(e) => handleBatchNameChange(e.target.value)}
              isDisabled={isLoadingBatchNames || batchNames.length === 0}
              maxW="420px"
              size="md"
              borderRadius="lg"
              borderColor={borderColor}
              _hover={{ borderColor: "gray.300" }}
              focusBorderColor="brand.500"
            >
              {batchNames.map((batch, index) => (
                <option key={index} value={batch.batch_name}>
                  {batch.batch_name}
                </option>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Category type */}
        <Card variant="outline" borderRadius="xl" borderColor={borderColor} boxShadow="sm" bg={cardBg} overflow="hidden">
          <CardHeader
            py={3}
            px={{ base: 4, md: 5 }}
            bg={sectionHeaderBg}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <Heading size="sm" color={textColor} fontWeight="700">
              2 · Special category
            </Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={1}>
              Choose which special category column to target.
            </Text>
          </CardHeader>
          <CardBody px={{ base: 4, md: 5 }} py={4}>
            <RadioGroup value={selectedCategoryType} onChange={handleCategoryTypeChange}>
              <Stack direction={{ base: "column", sm: "row" }} spacing={5} flexWrap="wrap">
                <Radio value="1" colorScheme="brand" isDisabled={!selectedBatchId}>
                  <Text color={textColor} fontSize="sm">
                    Special Category 1
                  </Text>
                </Radio>
                <Radio value="2" colorScheme="brand" isDisabled={!selectedBatchId}>
                  <Text color={textColor} fontSize="sm">
                    Special Category 2
                  </Text>
                </Radio>
                <Radio value="3" colorScheme="brand" isDisabled={!selectedBatchId}>
                  <Text color={textColor} fontSize="sm">
                    Special Category 3
                  </Text>
                </Radio>
              </Stack>
            </RadioGroup>
            {!selectedBatchId && (
              <Text color="gray.500" fontSize="xs" mt={3}>
                Select a batch name first.
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Special category values */}
        {selectedCategoryType && selectedBatchId && (
          <Card variant="outline" borderRadius="xl" borderColor={borderColor} boxShadow="sm" bg={cardBg} overflow="hidden">
            <CardHeader
              py={3}
              px={{ base: 4, md: 5 }}
              bg={sectionHeaderBg}
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              <Heading size="sm" color={textColor} fontWeight="700">
                3 · Category values
              </Heading>
              <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={1}>
                Multi-select rows to include in this run.
              </Text>
            </CardHeader>
            <CardBody px={{ base: 4, md: 5 }} py={4}>
              {isLoadingSpecialCategories ? (
                <Flex align="center" gap={2}>
                  <Spinner size="sm" color="brand.500" />
                  <Text color="gray.500" fontSize="sm">
                    Loading values...
                  </Text>
                </Flex>
              ) : specialCategoryValues.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  No values found for this category in the selected batch.
                </Text>
              ) : (
                <Menu closeOnSelect={false} isOpen={isMultiSelectOpen} onClose={() => setIsMultiSelectOpen(false)}>
                  <MenuButton
                    as={Button}
                    rightIcon={<MdExpandMore />}
                    variant="outline"
                    width="100%"
                    maxW="420px"
                    textAlign="left"
                    fontWeight="normal"
                    borderRadius="lg"
                    borderColor={borderColor}
                    onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                    _hover={{ borderColor: "brand.400", bg: hoverBg }}
                  >
                    {selectedItems.length > 0
                      ? `${selectedItems.length} item(s) selected`
                      : "Select values..."}
                  </MenuButton>
                  <Portal>
                    <MenuList
                      maxH="300px"
                      overflowY="auto"
                      minW="400px"
                      borderRadius="lg"
                      zIndex="dropdown"
                    >
                      {specialCategoryValues.map((value, index) => (
                        <MenuItem
                          key={index}
                          onClick={() => handleSpecialCategorySelect(value)}
                          _hover={{ bg: hoverBg }}
                        >
                          <Checkbox
                            isChecked={selectedItems.includes(value)}
                            colorScheme="brand"
                            pointerEvents="none"
                            mr={3}
                          />
                          <Text fontSize="sm" color={textColor}>
                            {value}
                          </Text>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Portal>
                </Menu>
              )}
            </CardBody>
          </Card>
        )}

        {/* Per-item configuration */}
        {selectedItems.length > 0 && (
          <Card variant="outline" borderRadius="xl" borderColor={borderColor} boxShadow="sm" bg={cardBg} overflow="hidden">
            <CardHeader
              py={3}
              px={{ base: 4, md: 5 }}
              bg={sectionHeaderBg}
              borderBottomWidth="1px"
              borderColor={borderColor}
            >
              <Heading size="sm" color={textColor} fontWeight="700">
                4 · Draft inputs per value
              </Heading>
              <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={1}>
                Map category, sub-category, slug, and prompts for each selected row.
              </Text>
            </CardHeader>
            <CardBody px={{ base: 3, md: 4 }} py={4}>
          <VStack spacing={4} align="stretch">
            {selectedItems.map((item, index) => {
              const selection = itemSelections[item] || {};
              const selectedCategoryId = selection.categoryId;
              const availableSubCategories = selectedCategoryId
                ? subCategories[selectedCategoryId] || []
                : [];
              const isLoadingSubCats = loadingSubCategories[selectedCategoryId];
              
              // Filter categories based on search term
              const categorySearchTerm = categorySearchTerms[item] || "";
              const filteredCategories = categories.filter((cat) =>
                cat.name?.toLowerCase().includes(categorySearchTerm.toLowerCase())
              );
              
              // Filter sub-categories based on search term
              const subCategorySearchTerm = subCategorySearchTerms[item] || "";
              const filteredSubCategories = availableSubCategories.filter((subCat) =>
                subCat.name?.toLowerCase().includes(subCategorySearchTerm.toLowerCase())
              );
              
              // Filter slugs based on search term
              const slugSearchTerm = slugSearchTerms[item] || "";
              const filteredSlugs = websiteSlugs.filter((slug) =>
                slug.full_slug?.toLowerCase().includes(slugSearchTerm.toLowerCase())
              );

              return (
                <Card
                  key={index}
                  variant="outline"
                  borderRadius="xl"
                  borderColor={borderColor}
                  borderLeftWidth="4px"
                  borderLeftColor="brand.400"
                  bg={cardBg}
                  boxShadow="xs"
                >
                  <CardBody p={{ base: 3, md: 4 }}>
                  <Text color={textColor} fontSize="sm" fontWeight="600" mb={3}>
                    Draft generation inputs
                  </Text>
                  <VStack spacing={3} align="stretch" mb={4}>
                    <Box>
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        User Prompt
                      </Text>
                      <Textarea
                        placeholder="Enter user prompt..."
                        value={selection.userPrompt || ""}
                        onChange={(e) => handleItemFieldChange(item, "userPrompt", e.target.value)}
                        size="sm"
                        minH="110px"
                        resize="vertical"
                        borderRadius="lg"
                        borderColor={borderColor}
                        _hover={{ borderColor: "gray.300" }}
                        focusBorderColor="brand.500"
                      />
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        Subject Prompt
                      </Text>
                      <Textarea
                        placeholder="Enter subject prompt..."
                        value={selection.subjectPrompt || ""}
                        onChange={(e) => handleItemFieldChange(item, "subjectPrompt", e.target.value)}
                        size="sm"
                        minH="90px"
                        resize="vertical"
                        borderRadius="lg"
                        borderColor={borderColor}
                        _hover={{ borderColor: "gray.300" }}
                        focusBorderColor="brand.500"
                      />
                    </Box>
                    <Box>
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        Word Limit
                      </Text>
                      <Input
                        placeholder="Enter word limit"
                        type="number"
                        min={1}
                        value={selection.wordLimit || ""}
                        onChange={(e) => handleItemFieldChange(item, "wordLimit", e.target.value)}
                        size="sm"
                      />
                    </Box>
                  </VStack>
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "stretch", md: "center" }}
                    gap={4}
                  >
                    {/* Item Name */}
                    <Box flex="1" minW="200px">
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        Selected Value
                      </Text>
                      <Text
                        color={textColor}
                        fontSize="sm"
                        fontWeight="500"
                        noOfLines={2}
                      >
                        {item}
                      </Text>
                    </Box>

                    {/* Category Dropdown with Search */}
                    <Box flex="1" minW="180px">
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        Category
                      </Text>
                      <Menu closeOnSelect={true}>
                        <MenuButton
                          as={Button}
                          rightIcon={<MdExpandMore />}
                          size="sm"
                          variant="outline"
                          width="100%"
                          textAlign="left"
                          fontWeight="normal"
                          isDisabled={isLoadingCategories || categories.length === 0}
                        >
                          {selection.categoryId
                            ? filteredCategories.find((c) => c.id?.toString() === selection.categoryId?.toString())?.name || "Select category"
                            : isLoadingCategories
                            ? "Loading categories..."
                            : categories.length === 0
                            ? "No categories available"
                            : "Select category"}
                        </MenuButton>
                        <MenuList maxH="300px" overflowY="auto" minW="250px">
                          <Box p={2}>
                            <Input
                              placeholder="Search category..."
                              size="sm"
                              value={categorySearchTerm}
                              onChange={(e) => handleCategorySearchChange(item, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </Box>
                          {filteredCategories.length === 0 ? (
                            <MenuItem isDisabled>
                              <Text fontSize="sm" color="gray.500">
                                No categories found
                              </Text>
                            </MenuItem>
                          ) : (
                            filteredCategories.map((cat) => (
                              <MenuItem
                                key={cat.id}
                                onClick={() => handleCategoryChange(item, cat.id)}
                                _hover={{ bg: hoverBg }}
                              >
                                <Text fontSize="sm" color={textColor}>
                                  {cat.name}
                                </Text>
                              </MenuItem>
                            ))
                          )}
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* Sub-Category Dropdown with Search */}
                    <Box flex="1" minW="180px">
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        Sub Category
                      </Text>
                      <Menu closeOnSelect={true}>
                        <MenuButton
                          as={Button}
                          rightIcon={<MdExpandMore />}
                          size="sm"
                          variant="outline"
                          width="100%"
                          textAlign="left"
                          fontWeight="normal"
                          isDisabled={!selection.categoryId || isLoadingSubCats}
                        >
                          {selection.subCategoryId
                            ? filteredSubCategories.find((s) => s.id?.toString() === selection.subCategoryId?.toString())?.name || "Select sub-category"
                            : isLoadingSubCats
                            ? "Loading..."
                            : selection.categoryId
                            ? "Select sub-category"
                            : "Select category first"}
                        </MenuButton>
                        <MenuList maxH="300px" overflowY="auto" minW="250px">
                          <Box p={2}>
                            <Input
                              placeholder="Search sub-category..."
                              size="sm"
                              value={subCategorySearchTerm}
                              onChange={(e) => handleSubCategorySearchChange(item, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </Box>
                          {filteredSubCategories.length === 0 ? (
                            <MenuItem isDisabled>
                              <Text fontSize="sm" color="gray.500">
                                {selection.categoryId ? "No sub-categories found" : "Select category first"}
                              </Text>
                            </MenuItem>
                          ) : (
                            filteredSubCategories.map((subCat) => (
                              <MenuItem
                                key={subCat.id}
                                onClick={() => handleSubCategoryChange(item, subCat.id)}
                                _hover={{ bg: hoverBg }}
                              >
                                <Text fontSize="sm" color={textColor}>
                                  {subCat.name}
                                </Text>
                              </MenuItem>
                            ))
                          )}
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* Slug Dropdown with Search */}
                    <Box flex="1" minW="200px">
                      <Text color="gray.500" fontSize="xs" mb={1}>
                        Slug
                      </Text>
                      <Menu closeOnSelect={true}>
                        <MenuButton
                          as={Button}
                          rightIcon={<MdExpandMore />}
                          size="sm"
                          variant="outline"
                          width="100%"
                          textAlign="left"
                          fontWeight="normal"
                          isDisabled={isLoadingSlugs}
                        >
                          {selection.slugId
                            ? (() => {
                                // Use websiteSlugs (full list) to find selected slug, not filteredSlugs
                                const selectedSlug = websiteSlugs.find((s) => 
                                  s.id?.toString() === selection.slugId?.toString() || 
                                  s.id === selection.slugId
                                );
                                return selectedSlug?.full_slug || "Select slug";
                              })()
                            : "Select slug"}
                        </MenuButton>
                        <MenuList maxH="300px" overflowY="auto" minW="300px">
                          <Box p={2}>
                            <Input
                              placeholder="Search slug..."
                              size="sm"
                              value={slugSearchTerm}
                              onChange={(e) => handleSlugSearchChange(item, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </Box>
                          {filteredSlugs.length === 0 ? (
                            <MenuItem isDisabled>
                              <Text fontSize="sm" color="gray.500">
                                No slugs found
                              </Text>
                            </MenuItem>
                          ) : (
                            filteredSlugs.map((slug) => (
                              <MenuItem
                                key={slug.id}
                                onClick={() => handleSlugChange(item, slug.id)}
                                _hover={{ bg: hoverBg }}
                              >
                                <Text fontSize="sm" color={textColor}>
                                  {slug.full_slug}
                                </Text>
                              </MenuItem>
                            ))
                          )}
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* Remove Button */}
                    <IconButton
                      aria-label="Remove item"
                      icon={<MdClose />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveItem(item)}
                      alignSelf={{ base: "flex-end", md: "center" }}
                    />
                  </Flex>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
            </CardBody>
          </Card>
        )}

        <Card variant="outline" borderRadius="xl" borderColor={borderColor} bg={cardBg} boxShadow="sm">
          <CardBody py={4} px={{ base: 4, md: 5 }}>
            <Flex justify="flex-end" gap={3} flexWrap="wrap">
              <Button
                variant="outline"
                borderRadius="lg"
                onClick={handleReset}
                isDisabled={!selectedCategoryType && selectedItems.length === 0}
              >
                Reset
              </Button>
              <Button
                colorScheme="brand"
                borderRadius="lg"
                onClick={handleExecute}
                isDisabled={selectedItems.length === 0 || !selectedBatchName || isExecuting}
                isLoading={isExecuting}
                loadingText="Executing..."
              >
                Execute
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>

      <Modal
        isOpen={promptGuidelinesModal.isOpen}
        onClose={promptGuidelinesModal.onClose}
        isCentered
        size="4xl"
        motionPreset="slideInBottom"
        scrollBehavior="inside"
      >
        {/* Chakra MCP dialog-with-backdrop-blur pattern (v2 ModalOverlay mapping) */}
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent
          borderRadius="2xl"
          mx={4}
          maxH="92vh"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="xl"
        >
          <ModalHeader pb={3} borderBottomWidth="1px" borderColor={borderColor} bg={sectionHeaderBg}>
            <HStack align="center" spacing={3}>
              <Flex
                align="center"
                justify="center"
                w="44px"
                h="44px"
                borderRadius="xl"
                bg={sampleModalHeaderIconBg}
                color="brand.500"
                flexShrink={0}
              >
                <Icon as={MdInfoOutline} boxSize={6} />
              </Flex>
              <Heading as="h2" size="md" color={textColor} fontWeight="700" lineHeight="short">
                Template variables for email prompts
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={4} pb={4} px={{ base: 4, md: 6 }} overflowY="auto">
            <Text fontSize="sm" color="gray.600" lineHeight="tall" mb={4}>
              Use these placeholders in your user prompt and subject prompt. They are replaced with real recipient
              data when drafts are generated.
            </Text>
            <Alert status="info" variant="subtle" borderRadius="xl" mb={5}>
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Copy tokens exactly</AlertTitle>
                <AlertDescription fontSize="xs" display="block">
                  Include the angle brackets. Some variables need matching include flags on the request — see each row.
                </AlertDescription>
              </Box>
            </Alert>
            <Accordion
              allowMultiple
              defaultIndex={EMAIL_PROMPT_TEMPLATE_VARIABLES.map((_, i) => i)}
            >
              {EMAIL_PROMPT_TEMPLATE_VARIABLES.map((row) => (
                <AccordionItem
                  key={row.token}
                  border="1px solid"
                  borderColor={sampleCardBorder}
                  borderRadius="xl"
                  overflow="hidden"
                  bg={cardBg}
                  mb={2}
                >
                  <h2>
                    <AccordionButton
                      px={4}
                      py={3}
                      bg={accordionBtnBg}
                      _expanded={{ bg: sampleModalHeaderIconBg }}
                      _hover={{ bg: codeExampleBg }}
                    >
                      <HStack flex="1" textAlign="left" spacing={3} align="flex-start">
                        <Code
                          fontSize="sm"
                          px={2}
                          py={1}
                          borderRadius="md"
                          colorScheme="brand"
                          fontWeight="700"
                        >
                          {row.token}
                        </Code>
                        <Box flex="1" minW={0}>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {row.description}
                          </Text>
                          <HStack mt={1} spacing={2} flexWrap="wrap">
                            {row.alwaysAvailable ? (
                              <Badge colorScheme="green" variant="subtle" fontSize="0.65em">
                                Always available
                              </Badge>
                            ) : (
                              <Badge colorScheme="purple" variant="subtle" fontSize="0.65em">
                                Requires flag
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel px={4} pb={4} pt={0}>
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={codeExampleBg}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        mb={2}
                      >
                        Example
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack align="flex-start" spacing={2} flexWrap="wrap">
                          <Badge variant="outline" fontSize="0.65em" colorScheme="gray">
                            Prompt
                          </Badge>
                          <Code
                            fontSize="xs"
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                            display="block"
                            w="100%"
                            p={2}
                            borderRadius="md"
                            bg={sampleCardIconBg}
                          >
                            {row.examplePrompt}
                          </Code>
                        </HStack>
                        <HStack align="center" spacing={2} color="gray.400" fontSize="sm">
                          <Text as="span" aria-hidden>
                            →
                          </Text>
                          <Text fontSize="xs" fontWeight="600" color="gray.500">
                            After replacement
                          </Text>
                        </HStack>
                        <HStack align="flex-start" spacing={2} flexWrap="wrap">
                          <Badge variant="outline" fontSize="0.65em" colorScheme="green">
                            Result
                          </Badge>
                          <Code
                            fontSize="xs"
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                            display="block"
                            w="100%"
                            p={2}
                            borderRadius="md"
                            bg={sampleCardIconBg}
                          >
                            {row.exampleResult}
                          </Code>
                        </HStack>
                      </VStack>
                    </Box>
                    {!row.alwaysAvailable && (
                      <HStack mt={3} flexWrap="wrap" spacing={2} align="center">
                        <Text fontSize="xs" fontWeight="600" color="gray.500">
                          Requires:
                        </Text>
                        <Code fontSize="xs" px={2} py={0.5} borderRadius="md">
                          {row.requiresFlag}
                        </Code>
                      </HStack>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </ModalBody>
          <ModalFooter pt={2} borderTopWidth="1px" borderColor={borderColor} bg={sectionHeaderBg} gap={2}>
            <Button variant="outline" borderRadius="lg" onClick={promptGuidelinesModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GenerateEmails;

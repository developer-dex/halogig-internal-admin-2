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
  Divider,
  Input,
} from "@chakra-ui/react";
import { MdClose, MdExpandMore, MdPreview } from "react-icons/md";
import axios from "axios";
import { getApi, postApi } from "../../../services/api";
import { apiEndPoints } from "../../../config/path";
import { showError, showSuccess } from "../../../helpers/messageHelper";

const GenerateEmails = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#F4F7FE", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const cardBg = useColorModeValue("white", "gray.700");

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

  // State for HTML templates
  const [htmlTemplates, setHtmlTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

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

  // Fetch all categories, batch names, templates, and slugs on mount
  useEffect(() => {
    fetchCategories();
    fetchBatchNames();
    fetchHtmlTemplates();
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

  const fetchHtmlTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await getApi(apiEndPoints.GET_HTML_TEMPLATE);
      const data = response?.data?.data || [];
      setHtmlTemplates(data);
    } catch (error) {
      showError("Failed to fetch HTML templates");
      console.error("fetchHtmlTemplates error:", error);
      setHtmlTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handlePreviewTemplate = (htmlContent, templateType) => {
    if (!htmlContent) {
      showError("Template content is empty");
      return;
    }
    
    // Create a new window with the HTML content
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.document.title = `${templateType} Template Preview`;
    } else {
      showError("Please allow popups to preview templates");
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
        [value]: { categoryId: "", subCategoryId: "", slugId: "" },
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
    setSelectedTemplateId(null);
  };

  const handleExecute = async () => {
    // Validate that all items have category, sub-category, and slug selected
    const incompleteItems = selectedItems.filter((item) => {
      const selection = itemSelections[item];
      return !selection?.categoryId || !selection?.subCategoryId || !selection?.slugId;
    });

    if (incompleteItems.length > 0) {
      showError("Please select category, sub-category, and slug for all items");
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

    if (!selectedTemplateId) {
      showError("Please select an HTML template");
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
        htmlId: Number(selectedTemplateId),
        fullSlugUrl: fullSlug,
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
      const response = await axios.post(`${aiBaseUrl}/api/campaign/send`, {
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
    <Box>
      {/* Batch Name Selection - Moved to First */}
      <Box mb={6}>
        <Text color={textColor} fontSize="md" fontWeight="600" mb={3}>
          Select Batch Name:
        </Text>
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
          maxW="400px"
        >
          {batchNames.map((batch, index) => (
            <option key={index} value={batch.batch_name}>
              {batch.batch_name}
            </option>
          ))}
        </Select>
      </Box>

      {/* Special Category Type Selection - Moved to Second */}
      <Box mb={6}>
        <Text color={textColor} fontSize="md" fontWeight="600" mb={3}>
          Select the Category you want to generate:
        </Text>
        <RadioGroup 
          value={selectedCategoryType} 
          onChange={handleCategoryTypeChange}
        >
          <Stack direction="row" spacing={6}>
            <Radio 
              value="1" 
              colorScheme="brand"
              isDisabled={!selectedBatchId}
            >
              <Text color={textColor} fontSize="sm">Special Category 1</Text>
            </Radio>
            <Radio 
              value="2" 
              colorScheme="brand"
              isDisabled={!selectedBatchId}
            >
              <Text color={textColor} fontSize="sm">Special Category 2</Text>
            </Radio>
            <Radio 
              value="3" 
              colorScheme="brand"
              isDisabled={!selectedBatchId}
            >
              <Text color={textColor} fontSize="sm">Special Category 3</Text>
            </Radio>
          </Stack>
        </RadioGroup>
        {!selectedBatchId && (
          <Text color="gray.500" fontSize="xs" mt={2}>
            Please select a batch name first
          </Text>
        )}
      </Box>

      {/* Special Category Values Multi-Select */}
      {selectedCategoryType && selectedBatchId && (
        <Box mb={6}>
          <Text color={textColor} fontSize="md" fontWeight="600" mb={3}>
            Select Special Category Values:
          </Text>
          
          {isLoadingSpecialCategories ? (
            <Flex align="center" gap={2}>
              <Spinner size="sm" color="brand.500" />
              <Text color="gray.500" fontSize="sm">Loading values...</Text>
            </Flex>
          ) : specialCategoryValues.length === 0 ? (
            <Text color="gray.500" fontSize="sm">No values found for this category in the selected batch</Text>
          ) : (
            <Menu closeOnSelect={false} isOpen={isMultiSelectOpen} onClose={() => setIsMultiSelectOpen(false)}>
              <MenuButton
                as={Button}
                rightIcon={<MdExpandMore />}
                variant="outline"
                width="100%"
                maxW="400px"
                textAlign="left"
                fontWeight="normal"
                onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
              >
                {selectedItems.length > 0
                  ? `${selectedItems.length} item(s) selected`
                  : "Select values..."}
              </MenuButton>
              <MenuList maxH="300px" overflowY="auto" minW="400px">
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
                    <Text fontSize="sm" color={textColor}>{value}</Text>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
        </Box>
      )}

      {/* Selected Items List */}
      {selectedItems.length > 0 && (
        <Box mb={6}>
          <Text color={textColor} fontSize="md" fontWeight="600" mb={3}>
            Selected Items:
          </Text>
          <VStack spacing={3} align="stretch">
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
                <Box
                  key={index}
                  p={4}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                >
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
                </Box>
              );
            })}
          </VStack>
        </Box>
      )}

      {/* HTML Templates Section */}
      <Box mb={6}>
        <Text color={textColor} fontSize="md" fontWeight="600" mb={3}>
          HTML Templates:
        </Text>
        
        {isLoadingTemplates ? (
          <Flex align="center" justify="center" py={8}>
            <Spinner size="md" color="brand.500" />
            <Text color="gray.500" fontSize="sm" ml={3}>Loading templates...</Text>
          </Flex>
        ) : htmlTemplates.length === 0 ? (
          <Text color="gray.500" fontSize="sm" py={4}>
            No HTML templates found
          </Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {htmlTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.html_id;
              return (
              <Box
                key={template.html_id}
                p={4}
                bg={isSelected ? "brand.50" : cardBg}
                border="2px solid"
                borderColor={isSelected ? "brand.500" : borderColor}
                borderRadius="8px"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  borderColor: isSelected ? "brand.500" : "brand.300",
                  boxShadow: isSelected ? "md" : "sm",
                }}
                onClick={() => setSelectedTemplateId(template.html_id)}
              >
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "stretch", md: "center" }}
                  justify="space-between"
                  gap={4}
                >
                  <Box flex="1">
                    <Text color="gray.500" fontSize="xs" mb={1}>
                      Template ID
                    </Text>
                    <Text color={textColor} fontSize="sm" fontWeight="500">
                      #{template.html_id}
                    </Text>
                    {template.created_at && (
                      <>
                        <Text color="gray.500" fontSize="xs" mt={2} mb={1}>
                          Created At
                        </Text>
                        <Text color={textColor} fontSize="xs">
                          {new Date(template.created_at).toLocaleString()}
                        </Text>
                      </>
                    )}
                  </Box>
                  
                  <HStack spacing={3}>
                    <Button
                      leftIcon={<MdPreview />}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => handlePreviewTemplate(template.general_template, "General")}
                      isDisabled={!template.general_template}
                    >
                      Preview General
                    </Button>
                    <Button
                      leftIcon={<MdPreview />}
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      onClick={() => handlePreviewTemplate(template.dummy_template, "Dummy")}
                      isDisabled={!template.dummy_template}
                    >
                      Preview Dummy
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTemplateId === template.html_id ? "solid" : "outline"}
                      colorScheme={selectedTemplateId === template.html_id ? "brand" : "gray"}
                      onClick={() => setSelectedTemplateId(template.html_id)}
                    >
                      {selectedTemplateId === template.html_id ? "Selected" : "Select"}
                    </Button>
                  </HStack>
                </Flex>
              </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Action Buttons */}
      <Divider my={6} />
      <Flex justify="flex-end" gap={4}>
        <Button
          variant="outline"
          onClick={handleReset}
          isDisabled={!selectedCategoryType && selectedItems.length === 0}
        >
          Reset
        </Button>
        <Button
          colorScheme="brand"
          onClick={handleExecute}
          isDisabled={selectedItems.length === 0 || !selectedBatchName || !selectedTemplateId || isExecuting}
          isLoading={isExecuting}
          loadingText="Executing..."
        >
          Execute
        </Button>
      </Flex>
    </Box>
  );
};

export default GenerateEmails;

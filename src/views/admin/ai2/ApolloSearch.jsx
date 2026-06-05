import React, { useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdClear,
  MdPerson,
  MdEmail,
  MdBusiness,
  MdMemory,
  MdWork,
  MdSearch,
  MdFilterList,
} from "react-icons/md";
import { showError, showSuccess } from "../../../helpers/messageHelper";

// ── Predefined options from Apollo docs ──────────────────────

const SENIORITY_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "founder", label: "Founder" },
  { value: "c_suite", label: "C-Suite" },
  { value: "partner", label: "Partner" },
  { value: "vp", label: "VP" },
  { value: "head", label: "Head" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "entry", label: "Entry" },
  { value: "intern", label: "Intern" },
];

const EMAIL_STATUS_OPTIONS = [
  { value: "verified", label: "Verified", color: "green" },
  { value: "likely to engage", label: "Likely to Engage", color: "green" },
  { value: "unverified", label: "Unverified", color: "yellow" },
  { value: "user_managed", label: "User Managed", color: "yellow" },
  { value: "update_required", label: "Update Required", color: "red" },
  { value: "unavailable", label: "Unavailable", color: "red" },
];

const EMPLOYEE_RANGE_OPTIONS = [
  { value: "1,10", label: "1 – 10" },
  { value: "11,20", label: "11 – 20" },
  { value: "21,50", label: "21 – 50" },
  { value: "51,100", label: "51 – 100" },
  { value: "101,200", label: "101 – 200" },
  { value: "201,500", label: "201 – 500" },
  { value: "501,1000", label: "501 – 1,000" },
  { value: "1001,2000", label: "1,001 – 2,000" },
  { value: "2001,5000", label: "2,001 – 5,000" },
  { value: "5001,10000", label: "5,001 – 10,000" },
  { value: "10001,1000000", label: "10,001+" },
];

const TITLE_SUGGESTIONS = [
  "manager", "project manager", "teacher", "owner", "student",
  "director", "software engineer", "consultant", "account manager", "engineer",
  "professor", "sales manager", "sales", "partner", "associate",
  "president", "administrative assistant", "supervisor", "general manager", "realtor",
];

const LOCATION_SUGGESTIONS = [
  "United States", "Americas", "North America", "EMEA",
  "Europe", "European Union", "Germany", "India",
  "United Kingdom", "Russia", "California, US", "Texas, US",
  "San Francisco Bay Area", "Greater Los Angeles Area",
  "Greater New York City Area", "Greater Philadelphia Area",
  "Dallas/Fort Worth Area", "Greater Houston Area",
  "Miami/Fort Lauderdale Area", "Greater Denver Area",
];

const KEYWORD_SUGGESTIONS = [
  "business", "consulting & services", "it services & it consulting",
  "software development", "advertising services", "medical practices",
  "project management", "community engagement", "technology, information & internet",
  "hospitals & health care", "wellness & fitness services", "quality assurance",
  "risk management", "non-profit organizations", "digital marketing",
  "customer satisfaction", "digital transformation", "customer service",
  "marketing services", "customer support",
];

const TECHNOLOGY_SUGGESTIONS = [
  "salesforce", "hubspot", "marketo", "slack", "zoom",
  "shopify", "google_analytics", "wordpress_org", "google_tag_manager",
  "gmail", "google_apps", "intercom", "zendesk", "stripe", "aws",
];

// ── Tag Input Component ──────────────────────────────────────

const TagInput = ({
  label, values, onChange, suggestions, placeholder,
  helperText, isDisabled,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
  const bgColor = useColorModeValue("white", "navy.700");
  const suggBg = useColorModeValue("white", "gray.700");
  const suggHover = useColorModeValue("gray.100", "gray.600");

  const addValue = (val) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeValue = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addValue(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const filteredSuggestions = suggestions
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(inputValue.toLowerCase()) &&
          !values.includes(s)
      )
    : [];

  return (
    <FormControl isDisabled={isDisabled}>
      <FormLabel fontSize="sm" fontWeight="600">{label}</FormLabel>
      {values.length > 0 && (
        <Wrap spacing={1} mb={2}>
          {values.map((v) => (
            <WrapItem key={v}>
              <Tag size="sm" borderRadius="full" variant="solid" colorScheme="brand">
                <TagLabel>{v}</TagLabel>
                <TagCloseButton onClick={() => removeValue(v)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}
      <Box position="relative">
        <InputGroup size="sm">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder || `Type and press Enter`}
            borderColor={borderColor}
            bg={bgColor}
          />
          {inputValue && (
            <InputRightElement>
              <IconButton
                aria-label="Add"
                icon={<MdAdd />}
                size="xs"
                variant="ghost"
                onClick={() => addValue(inputValue)}
              />
            </InputRightElement>
          )}
        </InputGroup>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Box
            position="absolute"
            zIndex={10}
            w="100%"
            mt={1}
            maxH="180px"
            overflowY="auto"
            bg={suggBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="md"
          >
            {filteredSuggestions.slice(0, 15).map((s) => (
              <Box
                key={s}
                px={3}
                py={1.5}
                fontSize="sm"
                cursor="pointer"
                _hover={{ bg: suggHover }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addValue(s);
                }}
              >
                {s}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {helperText && <FormHelperText fontSize="xs">{helperText}</FormHelperText>}
    </FormControl>
  );
};

// ── Main Component ───────────────────────────────────────────

const ApolloSearch = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const pageBg = useColorModeValue("#F4F7FE", "black");
  const cardBg = useColorModeValue("#FFFFFF", "navy.800");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const sectionBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const accentColor = useColorModeValue("brand.500", "brand.400");

  // Person filters
  const [personTitles, setPersonTitles] = useState([]);
  const [includeSimilarTitles, setIncludeSimilarTitles] = useState(true);
  const [personSeniorities, setPersonSeniorities] = useState([]);
  const [personLocations, setPersonLocations] = useState([]);
  const [qKeywords, setQKeywords] = useState("");

  // Email filters
  const [contactEmailStatus, setContactEmailStatus] = useState([]);
  const [includeCatchAllEmails, setIncludeCatchAllEmails] = useState(false);

  // Organization filters
  const [orgEmployeeRanges, setOrgEmployeeRanges] = useState([]);
  const [orgLocations, setOrgLocations] = useState([]);
  const [revenueMin, setRevenueMin] = useState("");
  const [revenueMax, setRevenueMax] = useState("");
  const [orgDomains, setOrgDomains] = useState([]);
  const [orgIds, setOrgIds] = useState([]);

  // Technology filters
  const [techUsingAny, setTechUsingAny] = useState([]);
  const [techUsingAll, setTechUsingAll] = useState([]);
  const [techNotUsing, setTechNotUsing] = useState([]);

  // Job posting filters
  const [jobTitles, setJobTitles] = useState([]);
  const [jobLocations, setJobLocations] = useState([]);
  const [jobCountMin, setJobCountMin] = useState("");
  const [jobCountMax, setJobCountMax] = useState("");
  const [jobPostedMin, setJobPostedMin] = useState("");
  const [jobPostedMax, setJobPostedMax] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Results state
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const buildPayload = useCallback(() => {
    const body = {};

    if (personTitles.length) body.person_titles = personTitles;
    if (!includeSimilarTitles) body.include_similar_titles = false;
    if (personSeniorities.length) body.person_seniorities = personSeniorities;
    if (personLocations.length) body.person_locations = personLocations;
    if (qKeywords.trim()) body.q_keywords = qKeywords.trim();

    if (contactEmailStatus.length) body.contact_email_status = contactEmailStatus;
    if (includeCatchAllEmails) body.include_catch_all_emails = true;

    if (orgEmployeeRanges.length) body.organization_num_employees_ranges = orgEmployeeRanges;
    if (orgLocations.length) body.organization_locations = orgLocations;
    if (revenueMin || revenueMax) {
      body.revenue_range = {};
      if (revenueMin) body.revenue_range.min = parseInt(revenueMin, 10);
      if (revenueMax) body.revenue_range.max = parseInt(revenueMax, 10);
    }
    if (orgDomains.length) body.q_organization_domains_list = orgDomains;
    if (orgIds.length) body.organization_ids = orgIds;

    if (techUsingAny.length) body.currently_using_any_of_technology_uids = techUsingAny;
    if (techUsingAll.length) body.currently_using_all_of_technology_uids = techUsingAll;
    if (techNotUsing.length) body.currently_not_using_any_of_technology_uids = techNotUsing;

    if (jobTitles.length) body.q_organization_job_titles = jobTitles;
    if (jobLocations.length) body.organization_job_locations = jobLocations;
    if (jobCountMin || jobCountMax) {
      body.organization_num_jobs_range = {};
      if (jobCountMin) body.organization_num_jobs_range.min = parseInt(jobCountMin, 10);
      if (jobCountMax) body.organization_num_jobs_range.max = parseInt(jobCountMax, 10);
    }
    if (jobPostedMin || jobPostedMax) {
      body.organization_job_posted_at_range = {};
      if (jobPostedMin) body.organization_job_posted_at_range.min = jobPostedMin;
      if (jobPostedMax) body.organization_job_posted_at_range.max = jobPostedMax;
    }

    body.page = page;
    body.per_page = perPage;

    return body;
  }, [
    personTitles, includeSimilarTitles, personSeniorities, personLocations, qKeywords,
    contactEmailStatus, includeCatchAllEmails,
    orgEmployeeRanges, orgLocations, revenueMin, revenueMax, orgDomains, orgIds,
    techUsingAny, techUsingAll, techNotUsing,
    jobTitles, jobLocations, jobCountMin, jobCountMax, jobPostedMin, jobPostedMax,
    page, perPage,
  ]);

  const handleSearch = useCallback(async (searchPage) => {
    const webhookUrl = process.env.REACT_APP_MAKE_WEBHOOK_URL;
    const apiKey = process.env.REACT_APP_MAKE_API_KEY;

    if (!webhookUrl) {
      showError("Make.com webhook URL is not configured (REACT_APP_MAKE_WEBHOOK_URL)");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const body = buildPayload();
      if (searchPage) body.page = searchPage;

      const payload = {
        flow: "apollo",
        body: JSON.stringify(body),
      };

      const { data } = await axios.post(webhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-make-apikey": apiKey } : {}),
        },
      });

      const people = Array.isArray(data?.people) ? data.people : [];
      setResults(people);
      const pagination = data?.pagination || {};
      const total = pagination.total_entries || data?.total_entries || people.length;
      setTotalCount(total);
      setTotalPages(Math.min(500, Math.ceil(total / perPage)));
      if (people.length > 0) {
        showSuccess(`Found ${total.toLocaleString()} results`);
      }
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Search failed");
      setResults([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [buildPayload, perPage]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    handleSearch(newPage);
  };

  const clearAllFilters = () => {
    setPersonTitles([]);
    setIncludeSimilarTitles(true);
    setPersonSeniorities([]);
    setPersonLocations([]);
    setQKeywords("");
    setContactEmailStatus([]);
    setIncludeCatchAllEmails(false);
    setOrgEmployeeRanges([]);
    setOrgLocations([]);
    setRevenueMin("");
    setRevenueMax("");
    setOrgDomains([]);
    setOrgIds([]);
    setTechUsingAny([]);
    setTechUsingAll([]);
    setTechNotUsing([]);
    setJobTitles([]);
    setJobLocations([]);
    setJobCountMin("");
    setJobCountMax("");
    setJobPostedMin("");
    setJobPostedMax("");
    setPage(1);
    setPerPage(25);
    setResults([]);
    setTotalCount(0);
    setTotalPages(0);
    setHasSearched(false);
  };

  const activeFilterCount = [
    personTitles.length > 0,
    personSeniorities.length > 0,
    personLocations.length > 0,
    qKeywords.trim().length > 0,
    contactEmailStatus.length > 0,
    includeCatchAllEmails,
    orgEmployeeRanges.length > 0,
    orgLocations.length > 0,
    revenueMin || revenueMax,
    orgDomains.length > 0,
    orgIds.length > 0,
    techUsingAny.length > 0,
    techUsingAll.length > 0,
    techNotUsing.length > 0,
    jobTitles.length > 0,
    jobLocations.length > 0,
    jobCountMin || jobCountMax,
    jobPostedMin || jobPostedMax,
  ].filter(Boolean).length;

  return (
    <Box bg={pageBg} minH="100%">
      <Card
        bg={cardBg}
        borderRadius="12px"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Box p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={4}>
          {/* Header */}
          <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={4}
            flexWrap="wrap"
          >
            <Box>
              <Heading as="h1" size="md" color={textColor} fontWeight="700">
                Apollo People Search
              </Heading>
              <Text fontSize="sm" color={subtleText} mt={1}>
                Search Apollo's database of 275M+ contacts using advanced filters.
                This endpoint does not consume credits.
              </Text>
            </Box>
            <HStack spacing={2}>
              {activeFilterCount > 0 && (
                <Badge colorScheme="brand" fontSize="xs" px={2} py={1} borderRadius="full">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                </Badge>
              )}
              <Button
                leftIcon={<MdClear />}
                size="sm"
                variant="outline"
                onClick={clearAllFilters}
                borderColor={borderColor}
                isDisabled={activeFilterCount === 0 && !hasSearched}
              >
                Clear All
              </Button>
              <Button
                leftIcon={<MdSearch />}
                size="sm"
                colorScheme="brand"
                onClick={() => {
                  setPage(1);
                  handleSearch(1);
                }}
                isLoading={isLoading}
                loadingText="Searching..."
              >
                Search
              </Button>
            </HStack>
          </Flex>

          {/* Filter Sections */}
          <Accordion allowMultiple defaultIndex={[0]}>
            {/* ── 1. Person Filters ── */}
            <AccordionItem border="none" mb={2}>
              <AccordionButton
                bg={sectionBg}
                borderRadius="8px"
                _hover={{ bg: hoverBg }}
                px={4}
                py={3}
              >
                <HStack flex="1" spacing={2}>
                  <MdPerson size={18} color="var(--chakra-colors-brand-500)" />
                  <Text fontWeight="600" fontSize="sm" color={textColor}>
                    Person Filters
                  </Text>
                  {(personTitles.length > 0 || personSeniorities.length > 0 || personLocations.length > 0 || qKeywords.trim()) && (
                    <Badge colorScheme="brand" size="sm" borderRadius="full" fontSize="10px">
                      Active
                    </Badge>
                  )}
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={4}>
                <VStack spacing={5} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <TagInput
                      label="Job Titles"
                      values={personTitles}
                      onChange={setPersonTitles}
                      suggestions={TITLE_SUGGESTIONS}
                      placeholder="e.g. marketing manager, ceo, founder"
                      helperText="Any custom title accepted. Similar matches included by default."
                    />
                    <TagInput
                      label="Person Locations"
                      values={personLocations}
                      onChange={setPersonLocations}
                      suggestions={LOCATION_SUGGESTIONS}
                      placeholder="e.g. United States, London, UK"
                      helperText="Where the person lives. Cities, states, countries, regions."
                    />
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Seniority Levels</FormLabel>
                    <CheckboxGroup value={personSeniorities} onChange={setPersonSeniorities}>
                      <Wrap spacing={3}>
                        {SENIORITY_OPTIONS.map((opt) => (
                          <WrapItem key={opt.value}>
                            <Checkbox value={opt.value} size="sm" colorScheme="brand">
                              {opt.label}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                    <FormHelperText fontSize="xs">
                      Fixed values only — only these 11 options are valid.
                    </FormHelperText>
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600">Keywords</FormLabel>
                      <Input
                        size="sm"
                        value={qKeywords}
                        onChange={(e) => setQKeywords(e.target.value)}
                        placeholder="e.g. digital marketing saas b2b"
                        borderColor={borderColor}
                        bg={bgColor}
                      />
                      <FormHelperText fontSize="xs">
                        Single string, not an array. Separate keywords with spaces.
                      </FormHelperText>
                    </FormControl>

                    <FormControl display="flex" alignItems="center" pt={7}>
                      <Switch
                        id="similar-titles"
                        isChecked={includeSimilarTitles}
                        onChange={(e) => setIncludeSimilarTitles(e.target.checked)}
                        colorScheme="brand"
                        size="sm"
                      />
                      <FormLabel htmlFor="similar-titles" mb={0} ml={3} fontSize="sm" fontWeight="600">
                        Include Similar Titles
                      </FormLabel>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* ── 2. Email & Contact Filters ── */}
            <AccordionItem border="none" mb={2}>
              <AccordionButton
                bg={sectionBg}
                borderRadius="8px"
                _hover={{ bg: hoverBg }}
                px={4}
                py={3}
              >
                <HStack flex="1" spacing={2}>
                  <MdEmail size={18} color="var(--chakra-colors-brand-500)" />
                  <Text fontWeight="600" fontSize="sm" color={textColor}>
                    Email & Contact Filters
                  </Text>
                  {(contactEmailStatus.length > 0 || includeCatchAllEmails) && (
                    <Badge colorScheme="brand" size="sm" borderRadius="full" fontSize="10px">
                      Active
                    </Badge>
                  )}
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={4}>
                <VStack spacing={5} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Email Status</FormLabel>
                    <CheckboxGroup value={contactEmailStatus} onChange={setContactEmailStatus}>
                      <Wrap spacing={3}>
                        {EMAIL_STATUS_OPTIONS.map((opt) => (
                          <WrapItem key={opt.value}>
                            <Checkbox value={opt.value} size="sm" colorScheme={opt.color}>
                              <HStack spacing={1}>
                                <Text>{opt.label}</Text>
                                <Badge
                                  colorScheme={opt.color}
                                  fontSize="9px"
                                  variant="subtle"
                                  borderRadius="full"
                                >
                                  {opt.color === "green"
                                    ? "Safe"
                                    : opt.color === "yellow"
                                    ? "Caution"
                                    : "Avoid"}
                                </Badge>
                              </HStack>
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                    <FormHelperText fontSize="xs">
                      Fixed values only. "Verified" and "Likely to Engage" are safe to send.
                    </FormHelperText>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="catch-all"
                      isChecked={includeCatchAllEmails}
                      onChange={(e) => setIncludeCatchAllEmails(e.target.checked)}
                      colorScheme="brand"
                      size="sm"
                    />
                    <FormLabel htmlFor="catch-all" mb={0} ml={3} fontSize="sm" fontWeight="600">
                      Include Catch-All Emails
                    </FormLabel>
                  </FormControl>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* ── 3. Company / Organization Filters ── */}
            <AccordionItem border="none" mb={2}>
              <AccordionButton
                bg={sectionBg}
                borderRadius="8px"
                _hover={{ bg: hoverBg }}
                px={4}
                py={3}
              >
                <HStack flex="1" spacing={2}>
                  <MdBusiness size={18} color="var(--chakra-colors-brand-500)" />
                  <Text fontWeight="600" fontSize="sm" color={textColor}>
                    Company / Organization Filters
                  </Text>
                  {(orgEmployeeRanges.length > 0 || orgLocations.length > 0 || revenueMin || revenueMax || orgDomains.length > 0 || orgIds.length > 0) && (
                    <Badge colorScheme="brand" size="sm" borderRadius="full" fontSize="10px">
                      Active
                    </Badge>
                  )}
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={4}>
                <VStack spacing={5} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600">Employee Count Ranges</FormLabel>
                    <CheckboxGroup value={orgEmployeeRanges} onChange={setOrgEmployeeRanges}>
                      <Wrap spacing={3}>
                        {EMPLOYEE_RANGE_OPTIONS.map((opt) => (
                          <WrapItem key={opt.value}>
                            <Checkbox value={opt.value} size="sm" colorScheme="brand">
                              {opt.label}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                    <FormHelperText fontSize="xs">
                      Multiple ranges expand results. Custom ranges also accepted (e.g. "250,750").
                    </FormHelperText>
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <TagInput
                      label="Company HQ Locations"
                      values={orgLocations}
                      onChange={setOrgLocations}
                      suggestions={LOCATION_SUGGESTIONS}
                      placeholder="e.g. United States, California, US"
                      helperText="Company HQ location — different from person location."
                    />
                    <TagInput
                      label="Company Domains"
                      values={orgDomains}
                      onChange={setOrgDomains}
                      suggestions={[]}
                      placeholder="e.g. apollo.io, hubspot.com"
                      helperText="No www. or @. Max 1,000 domains per request."
                    />
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600">Revenue Range (USD)</FormLabel>
                      <HStack spacing={3}>
                        <NumberInput
                          size="sm"
                          min={0}
                          value={revenueMin}
                          onChange={(v) => setRevenueMin(v)}
                        >
                          <NumberInputField
                            placeholder="Min (e.g. 1000000)"
                            borderColor={borderColor}
                            bg={bgColor}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="sm" color={subtleText}>to</Text>
                        <NumberInput
                          size="sm"
                          min={0}
                          value={revenueMax}
                          onChange={(v) => setRevenueMax(v)}
                        >
                          <NumberInputField
                            placeholder="Max (e.g. 50000000)"
                            borderColor={borderColor}
                            bg={bgColor}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>
                      <FormHelperText fontSize="xs">
                        Enter values in USD without symbols or commas.
                      </FormHelperText>
                    </FormControl>

                    <TagInput
                      label="Organization IDs"
                      values={orgIds}
                      onChange={setOrgIds}
                      suggestions={[]}
                      placeholder="Apollo internal org ID"
                      helperText="Apollo internal IDs. Get from Organization Search endpoint."
                    />
                  </SimpleGrid>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* ── 4. Technology Filters ── */}
            <AccordionItem border="none" mb={2}>
              <AccordionButton
                bg={sectionBg}
                borderRadius="8px"
                _hover={{ bg: hoverBg }}
                px={4}
                py={3}
              >
                <HStack flex="1" spacing={2}>
                  <MdMemory size={18} color="var(--chakra-colors-brand-500)" />
                  <Text fontWeight="600" fontSize="sm" color={textColor}>
                    Technology Filters
                  </Text>
                  {(techUsingAny.length > 0 || techUsingAll.length > 0 || techNotUsing.length > 0) && (
                    <Badge colorScheme="brand" size="sm" borderRadius="full" fontSize="10px">
                      Active
                    </Badge>
                  )}
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={4}>
                <VStack spacing={5} align="stretch">
                  <TagInput
                    label="Using ANY of these technologies"
                    values={techUsingAny}
                    onChange={setTechUsingAny}
                    suggestions={TECHNOLOGY_SUGGESTIONS}
                    placeholder="e.g. salesforce, hubspot"
                    helperText="More values = broader results. Use underscores for spaces."
                  />
                  <TagInput
                    label="Using ALL of these technologies"
                    values={techUsingAll}
                    onChange={setTechUsingAll}
                    suggestions={TECHNOLOGY_SUGGESTIONS}
                    placeholder="e.g. salesforce, marketo"
                    helperText="More values = narrower results (company must use all listed)."
                  />
                  <TagInput
                    label="NOT using any of these technologies"
                    values={techNotUsing}
                    onChange={setTechNotUsing}
                    suggestions={TECHNOLOGY_SUGGESTIONS}
                    placeholder="e.g. salesforce"
                    helperText="Excludes companies using any of these technologies."
                  />
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* ── 5. Job Posting Filters ── */}
            <AccordionItem border="none" mb={2}>
              <AccordionButton
                bg={sectionBg}
                borderRadius="8px"
                _hover={{ bg: hoverBg }}
                px={4}
                py={3}
              >
                <HStack flex="1" spacing={2}>
                  <MdWork size={18} color="var(--chakra-colors-brand-500)" />
                  <Text fontWeight="600" fontSize="sm" color={textColor}>
                    Job Posting Filters
                  </Text>
                  {(jobTitles.length > 0 || jobLocations.length > 0 || jobCountMin || jobCountMax || jobPostedMin || jobPostedMax) && (
                    <Badge colorScheme="brand" size="sm" borderRadius="full" fontSize="10px">
                      Active
                    </Badge>
                  )}
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={4}>
                <VStack spacing={5} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <TagInput
                      label="Job Titles in Active Postings"
                      values={jobTitles}
                      onChange={setJobTitles}
                      suggestions={[]}
                      placeholder="e.g. sales manager, software engineer"
                      helperText="Titles actively being hired for at the company."
                    />
                    <TagInput
                      label="Job Posting Locations"
                      values={jobLocations}
                      onChange={setJobLocations}
                      suggestions={[]}
                      placeholder="e.g. atlanta, remote, new york"
                      helperText="Locations being actively hired for."
                    />
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600">Active Job Postings Count</FormLabel>
                      <HStack spacing={3}>
                        <NumberInput
                          size="sm"
                          min={0}
                          value={jobCountMin}
                          onChange={(v) => setJobCountMin(v)}
                        >
                          <NumberInputField
                            placeholder="Min"
                            borderColor={borderColor}
                            bg={bgColor}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="sm" color={subtleText}>to</Text>
                        <NumberInput
                          size="sm"
                          min={0}
                          value={jobCountMax}
                          onChange={(v) => setJobCountMax(v)}
                        >
                          <NumberInputField
                            placeholder="Max"
                            borderColor={borderColor}
                            bg={bgColor}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600">Job Posted Date Range</FormLabel>
                      <HStack spacing={3}>
                        <Input
                          size="sm"
                          type="date"
                          value={jobPostedMin}
                          onChange={(e) => setJobPostedMin(e.target.value)}
                          borderColor={borderColor}
                          bg={bgColor}
                          placeholder="Start date"
                        />
                        <Text fontSize="sm" color={subtleText}>to</Text>
                        <Input
                          size="sm"
                          type="date"
                          value={jobPostedMax}
                          onChange={(e) => setJobPostedMax(e.target.value)}
                          borderColor={borderColor}
                          bg={bgColor}
                          placeholder="End date"
                        />
                      </HStack>
                      <FormHelperText fontSize="xs">Format: YYYY-MM-DD</FormHelperText>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          {/* ── Pagination Controls ── */}
          <Flex
            justify="space-between"
            align="center"
            bg={sectionBg}
            borderRadius="8px"
            p={4}
            flexWrap="wrap"
            gap={3}
          >
            <HStack spacing={4}>
              <HStack spacing={2}>
                <MdFilterList size={16} />
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  Pagination
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="sm" color={subtleText}>Page:</Text>
                <NumberInput
                  size="sm"
                  min={1}
                  max={500}
                  w="80px"
                  value={page}
                  onChange={(_, v) => setPage(v || 1)}
                >
                  <NumberInputField borderColor={borderColor} bg={bgColor} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="sm" color={subtleText}>Per Page:</Text>
                <Select
                  size="sm"
                  w="90px"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </HStack>
            </HStack>
            <Button
              leftIcon={<MdSearch />}
              size="sm"
              colorScheme="brand"
              onClick={() => {
                setPage(1);
                handleSearch(1);
              }}
              isLoading={isLoading}
              loadingText="Searching..."
            >
              Search People
            </Button>
          </Flex>

          {/* ── Results Section ── */}
          {isLoading && results.length === 0 ? (
            <Flex justify="center" py={12}>
              <VStack spacing={3}>
                <Spinner size="xl" color="brand.500" />
                <Text fontSize="sm" color={subtleText}>
                  Searching Apollo database...
                </Text>
              </VStack>
            </Flex>
          ) : hasSearched ? (
            <>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Text fontSize="sm" color={textColor}>
                  {totalCount > 0 ? (
                    <>
                      Found{" "}
                      <Text as="span" fontWeight="700" color={accentColor}>
                        {totalCount.toLocaleString()}
                      </Text>{" "}
                      results (Page {page} of {totalPages})
                    </>
                  ) : (
                    "No results found. Try adjusting your filters."
                  )}
                </Text>
              </Flex>

              {results.length > 0 && (
                <>
                  <Box
                    overflowX="auto"
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="8px"
                    bg={bgColor}
                  >
                    <Table variant="simple" color="gray.500" minW="1100px">
                      <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                        <Tr>
                          {["Name", "Title", "Company", "Location", "Seniority", "Email Status"].map(
                            (h) => (
                              <Th
                                key={h}
                                borderColor={borderColor}
                                color="black"
                                fontSize="xs"
                                fontWeight="700"
                                textTransform="capitalize"
                                bg={bgColor}
                                whiteSpace="nowrap"
                              >
                                {h}
                              </Th>
                            )
                          )}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {results.map((person, idx) => (
                          <Tr
                            key={person.id || `person-${idx}`}
                            bg={idx % 2 === 0 ? "#F8FAFD" : "transparent"}
                            _hover={{ bg: hoverBg }}
                          >
                            <Td borderColor={borderColor} maxW="200px">
                              <Text color={textColor} fontSize="sm" noOfLines={1}>
                                {person.first_name || ""} {person.last_name || ""}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} maxW="250px">
                              <Tooltip label={person.title} hasArrow>
                                <Text color={textColor} fontSize="sm" noOfLines={2}>
                                  {person.title || "—"}
                                </Text>
                              </Tooltip>
                            </Td>
                            <Td borderColor={borderColor} maxW="200px">
                              <Text color={textColor} fontSize="sm" noOfLines={1}>
                                {person.organization?.name || person.organization_name || "—"}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" noOfLines={1}>
                                {person.city || ""}{person.city && person.state ? ", " : ""}{person.state || ""}{(person.city || person.state) && person.country ? ", " : ""}{person.country || "—"}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Badge
                                colorScheme="purple"
                                variant="subtle"
                                fontSize="0.7em"
                                textTransform="capitalize"
                              >
                                {person.seniority || "—"}
                              </Badge>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Badge
                                colorScheme={
                                  person.email_status === "verified"
                                    ? "green"
                                    : person.email_status === "likely to engage"
                                    ? "green"
                                    : person.email_status === "unavailable"
                                    ? "red"
                                    : "yellow"
                                }
                                variant="subtle"
                                fontSize="0.7em"
                                textTransform="capitalize"
                              >
                                {person.email_status || "—"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  {/* Pagination */}
                  <Flex
                    justify="space-between"
                    align="center"
                    pt="8px"
                    flexWrap="wrap"
                    gap="8px"
                  >
                    <Text color="black" fontSize="sm">
                      Showing{" "}
                      <Text as="span" fontWeight="700" color="brand.500">
                        {results.length}
                      </Text>{" "}
                      of {totalCount.toLocaleString()} (Page {page})
                    </Text>
                    <HStack spacing="8px">
                      <IconButton
                        aria-label="Previous page"
                        icon={<MdChevronLeft />}
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        isDisabled={page === 1 || isLoading}
                        variant="outline"
                      />
                      {(() => {
                        const pages = [];
                        const start = Math.max(1, page - 4);
                        const end = Math.min(totalPages, start + 9);
                        for (let p = start; p <= end; p++) pages.push(p);
                        return pages.map((p) => (
                          <Button
                            key={p}
                            size="sm"
                            variant={page === p ? "solid" : "outline"}
                            colorScheme={page === p ? "brand" : "gray"}
                            onClick={() => handlePageChange(p)}
                            isDisabled={isLoading}
                          >
                            {p}
                          </Button>
                        ));
                      })()}
                      {totalPages > 10 && (
                        <Text fontSize="sm" color="gray.400">
                          ...{totalPages}
                        </Text>
                      )}
                      <IconButton
                        aria-label="Next page"
                        icon={<MdChevronRight />}
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        isDisabled={page >= totalPages || isLoading}
                        variant="outline"
                      />
                    </HStack>
                  </Flex>
                </>
              )}
            </>
          ) : (
            <Flex
              justify="center"
              align="center"
              py={16}
              direction="column"
              gap={3}
              opacity={0.6}
            >
              <MdSearch size={48} />
              <Text fontSize="md" color={subtleText} fontWeight="500">
                Configure filters above and click Search to find people
              </Text>
              <Text fontSize="xs" color={subtleText}>
                Max 50,000 records (100 per page x 500 pages). Search does not consume credits.
              </Text>
            </Flex>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ApolloSearch;

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  Box,
  Card,
  Text,
  Flex,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Radio,
  RadioGroup,
  Stack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  IconButton,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdExpandMore } from 'react-icons/md';
import { getApi, postApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';

export default function CreateClientProject() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get client data from navigation state
  const clientInfo = location.state || {};
  const projectPrefill = clientInfo?.projectPrefill || null;
  const clientIdFromQuery = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const raw = params.get('client_id');
      const n = raw ? Number(raw) : null;
      return n && !Number.isNaN(n) ? n : null;
    } catch {
      return null;
    }
  }, [location.search]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('#F4F7FE', 'black');
  const cardBg = useColorModeValue('white', 'navy.800');
  const sectionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Form state
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectCategory: '',
    projectSubCategories: [],
    technologyPreference: [],
    customerIndustry: '',
    pricingModel: 'hourly',
    rateMin: '',
    rateMax: '',
    durationMin: '',
    durationMax: '',
    projectSummary: '',
    typeOfProject: 'maintenance',
    currency: 'INR-₹',
    locationPreferancer: ''
  });

  useEffect(() => {
    if (!projectPrefill) return;

    const mappedCurrency = projectPrefill.currency_type && projectPrefill.currency_symbol
      ? `${projectPrefill.currency_type}-${projectPrefill.currency_symbol}`
      : (projectPrefill.currency || '');

    const subCats = projectPrefill.project_sub_category
      ? String(projectPrefill.project_sub_category)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
      : [];

    setFormData((prev) => ({
      ...prev,
      projectTitle: projectPrefill.project_title || prev.projectTitle,
      projectCategory: projectPrefill.project_category ? String(projectPrefill.project_category) : prev.projectCategory,
      projectSubCategories: subCats.length ? subCats : prev.projectSubCategories,
      customerIndustry: projectPrefill.customer_industry ? String(projectPrefill.customer_industry) : prev.customerIndustry,
      pricingModel: projectPrefill.model_engagement || prev.pricingModel,
      rateMin: projectPrefill.project_amount_min || projectPrefill.project_amount || prev.rateMin,
      rateMax: projectPrefill.project_amount_max || prev.rateMax,
      durationMin: projectPrefill.project_duration_min || prev.durationMin,
      durationMax: projectPrefill.project_duration_max || prev.durationMax,
      projectSummary: projectPrefill.project_summary || prev.projectSummary,
      typeOfProject: projectPrefill.type_of_project || prev.typeOfProject,
      currency: mappedCurrency || prev.currency,
      locationPreferancer: projectPrefill.location_preferancer || prev.locationPreferancer,
    }));
  }, [projectPrefill]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validated, setValidated] = useState(false);

  // Options state
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState('');
  const [technologySearchTerm, setTechnologySearchTerm] = useState('');
  const [subCategoryRenderLimit, setSubCategoryRenderLimit] = useState(80);
  const [technologyRenderLimit, setTechnologyRenderLimit] = useState(80);

  // Location state
  const [userCity, setUserCity] = useState('');
  const [userCountry, setUserCountry] = useState('');

  const deferredCategorySearchTerm = useDeferredValue(categorySearchTerm);
  const deferredSubCategorySearchTerm = useDeferredValue(subCategorySearchTerm);
  const deferredTechnologySearchTerm = useDeferredValue(technologySearchTerm);

  const filteredCategories = useMemo(() => {
    const query = deferredCategorySearchTerm.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => (cat?.name || cat?.title || '').toLowerCase().includes(query));
  }, [categories, deferredCategorySearchTerm]);

  const filteredSubCategories = useMemo(() => {
    const query = deferredSubCategorySearchTerm.trim().toLowerCase();
    if (!query) return subCategories;
    return subCategories.filter((sub) => (sub?.name || sub?.title || '').toLowerCase().includes(query));
  }, [subCategories, deferredSubCategorySearchTerm]);

  const filteredTechnologies = useMemo(() => {
    const query = deferredTechnologySearchTerm.trim().toLowerCase();
    if (!query) return technologies;
    return technologies.filter((tech) => (tech?.name || tech?.title || '').toLowerCase().includes(query));
  }, [technologies, deferredTechnologySearchTerm]);

  const orderedFilteredSubCategories = useMemo(() => {
    const selectedSet = new Set((formData.projectSubCategories || []).map((id) => String(id)));
    const selected = [];
    const unselected = [];

    filteredSubCategories.forEach((sub) => {
      const subId = String(sub.id || sub._id);
      if (selectedSet.has(subId)) {
        selected.push(sub);
      } else {
        unselected.push(sub);
      }
    });

    return [...selected, ...unselected];
  }, [filteredSubCategories, formData.projectSubCategories]);

  const orderedFilteredTechnologies = useMemo(() => {
    const selectedSet = new Set((formData.technologyPreference || []).map((id) => String(id)));
    const selected = [];
    const unselected = [];

    filteredTechnologies.forEach((tech) => {
      const techId = String(tech.id || tech._id);
      if (selectedSet.has(techId)) {
        selected.push(tech);
      } else {
        unselected.push(tech);
      }
    });

    return [...selected, ...unselected];
  }, [filteredTechnologies, formData.technologyPreference]);

  const visibleSubCategories = useMemo(
    () => orderedFilteredSubCategories.slice(0, subCategoryRenderLimit),
    [orderedFilteredSubCategories, subCategoryRenderLimit],
  );

  const visibleTechnologies = useMemo(
    () => orderedFilteredTechnologies.slice(0, technologyRenderLimit),
    [orderedFilteredTechnologies, technologyRenderLimit],
  );

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getApi(apiEndPoints.GET_CATEGORIES);

      // Match the structure used in dropdownDataSlice
      if (Array.isArray(response?.data?.data)) {
        setCategories(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sub-categories
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await getApi(`${apiEndPoints.GET_SUBCATEGORIES}/${categoryId}`);

      // Match the structure used in dropdownDataSlice
      if (Array.isArray(response?.data?.data)) {
        setSubCategories(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setSubCategories(response.data);
      } else if (Array.isArray(response)) {
        setSubCategories(response);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setSubCategories([]);
    }
  };

  // Fetch technologies
  const fetchTechnologies = async () => {
    try {
      const response = await getApi(apiEndPoints.GET_TECHNOLOGIES);

      // Match the structure used in dropdownDataSlice
      if (Array.isArray(response?.data?.data)) {
        setTechnologies(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setTechnologies(response.data);
      } else if (Array.isArray(response)) {
        setTechnologies(response);
      } else {
        setTechnologies([]);
      }
    } catch (error) {
      console.error('Error fetching technologies:', error);
      setTechnologies([]);
    }
  };

  // Fetch industries
  const fetchIndustries = async () => {
    try {
      const response = await getApi(apiEndPoints.GET_INDUSTRIES);

      // Match the structure used in dropdownDataSlice
      if (Array.isArray(response?.data?.data)) {
        setIndustries(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setIndustries(response.data);
      } else if (Array.isArray(response)) {
        setIndustries(response);
      } else {
        setIndustries([]);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      setIndustries([]);
    }
  };

  // Fetch client city and country
  const getClientCountyCityState = async () => {
    if (!clientInfo.clientId) {
      // Set defaults if no client ID
      setUserCity('City');
      setUserCountry('Country');
      return;
    }

    try {
      const response = await getApi(`${apiEndPoints.GET_CLIENT_DETAILS}/${clientInfo.clientId}/details`);
      const clientData = response?.data?.data || response?.data || response;

      if (clientData) {
        // Handle city
        const city = clientData.city || '';
        setUserCity(city);

        // Handle country - could be string or object with name property
        let country = '';
        if (typeof clientData.country === 'string') {
          country = clientData.country;
        } else if (clientData.country && typeof clientData.country === 'object') {
          country = clientData.country.name || clientData.country.country || '';
        }
        setUserCountry(country || 'Country');
      } else {
        // Set defaults if no data
        setUserCity('City');
        setUserCountry('Country');
      }
    } catch (error) {
      console.error('Error fetching client city/country:', error);
      // Set defaults if API fails
      setUserCity('City');
      setUserCountry('Country');
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      projectCategory: categoryId,
      projectSubCategories: []
    }));
    setSubCategorySearchTerm('');
    setSubCategoryRenderLimit(80);
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };

  // When category is prefilled (or restored), ensure sub-categories are loaded
  useEffect(() => {
    if (!formData.projectCategory) return;
    // If sub-categories are already loaded, do nothing
    if (Array.isArray(subCategories) && subCategories.length > 0) return;
    fetchSubCategories(formData.projectCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projectCategory]);

  // Handle pricing model change
  const handlePricingModelChange = (value) => {
    setFormData(prev => ({ ...prev, pricingModel: value }));
  };

  const hourlyVisible = formData.pricingModel === 'hourly';
  const retainershipVisible = formData.pricingModel === 'retainer';
  const fixedPriceVisible = formData.pricingModel === 'fixed';
  const halogigVisible = formData.pricingModel === 'halogig';

  const selectedCategoryLabel = useMemo(() => {
    if (!formData.projectCategory) return 'Select a Project Category';
    const selectedCategory = categories.find(
      (cat) => String(cat.id || cat._id) === String(formData.projectCategory),
    );
    return selectedCategory?.name || selectedCategory?.title || 'Select a Project Category';
  }, [categories, formData.projectCategory]);

  useEffect(() => {
    setSubCategoryRenderLimit(80);
  }, [deferredSubCategorySearchTerm]);

  useEffect(() => {
    setTechnologyRenderLimit(80);
  }, [deferredTechnologySearchTerm]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.projectTitle || formData.projectTitle.length < 20) {
        throw new Error('Project title must be at least 20 characters long');
      }

      if (!formData.projectCategory) {
        throw new Error('Please select a project category');
      }

      // Validate sub-categories - ensure it's an array with at least one item
      if (!Array.isArray(formData.projectSubCategories) || formData.projectSubCategories.length === 0) {
        throw new Error('Please select at least one sub-category');
      }

      // Validate technology preference - ensure it's an array with at least one item
      if (!Array.isArray(formData.technologyPreference) || formData.technologyPreference.length === 0) {
        throw new Error('Please select at least one technology preference');
      }

      if (!formData.customerIndustry) {
        throw new Error('Please select a customer industry');
      }

      if (!formData.rateMin || !formData.rateMax) {
        throw new Error('Please enter rate range');
      }

      if (parseFloat(formData.rateMin) > parseFloat(formData.rateMax)) {
        throw new Error('Maximum rate must be greater than minimum rate');
      }

      if (!formData.durationMin || !formData.durationMax) {
        throw new Error('Please enter duration range');
      }

      if (parseFloat(formData.durationMin) > parseFloat(formData.durationMax)) {
        throw new Error('Maximum duration must be greater than minimum duration');
      }

      if (!formData.projectSummary || formData.projectSummary.length < 160) {
        throw new Error('Project summary must be at least 160 characters long');
      }

      if (!formData.locationPreferancer || formData.locationPreferancer === '') {
        throw new Error('Please select a location preference');
      }

      // Get selected technology names - ensure we have valid IDs
      const selectedTechnologies = technologies.filter(tech => {
        const techId = String(tech.id || tech._id);
        return formData.technologyPreference.includes(techId);
      });

      // Ensure we have technologies selected
      if (selectedTechnologies.length === 0) {
        throw new Error('Please select at least one valid technology preference');
      }

      // Prepare sub-category IDs - ensure they're strings
      const subCategoryIds = formData.projectSubCategories
        .map(id => String(id))
        .filter(id => id && id !== 'undefined' && id !== 'null');

      if (subCategoryIds.length === 0) {
        throw new Error('Please select at least one valid sub-category');
      }

      // Prepare data for API - matching old admin structure
      const postprojectData = {
        posted_by_user_id: clientIdFromQuery || clientInfo.clientId || projectPrefill?.User?.id || null,
        project_title: formData.projectTitle,
        project_category: String(formData.projectCategory),
        project_sub_category: subCategoryIds.join(','),
        project_summary: formData.projectSummary,
        type_of_project: formData.typeOfProject,
        project_duration_min: formData.durationMin,
        project_duration_max: formData.durationMax,
        customer_industry: String(formData.customerIndustry),
        technologty_pre: selectedTechnologies.map(tech => tech.name || tech.title).join(','),
        notice_period: "0",
        project_amount: formData.rateMin,
        project_amount_max: formData.rateMax,
        model_engagement: formData.pricingModel,
        currency_type: formData.currency.split('-')[0],
        currency_symbol: formData.currency.split('-')[1],
        currency: formData.currency,
        location_preferancer: formData.locationPreferancer,
        created_by_admin: true,
        is_published: false
      };

      // Submit to API
      const response = await postApi(apiEndPoints.CREATE_CLIENT_PROJECT, { postprojectData });

      if (!response.data) {
        throw new Error(response.message || 'Failed to create project');
      }

      setSuccess('Project created successfully!');
      showSuccess('Project created successfully!');
      setTimeout(() => {
        navigate('/admin/offline-clients');
      }, 2000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create project';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchTechnologies(),
          fetchIndustries(),
          getClientCountyCityState()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientInfo.clientId]);

  if (isLoading && categories.length === 0) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} minH="100%">
      <Card bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={sectionBorderColor} boxShadow="sm">
        <Box p={{ base: 4, md: 6 }}>
          {/* Header */}
          <HStack mb="24px" spacing="16px">
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/offline-clients')}
              variant="ghost"
              aria-label="Back to Clients"
            />
            <Text color={textColor} fontSize="2xl" fontWeight="700">
              Create Project for Client
            </Text>
          </HStack>

          {/* Client Info */}
          {clientInfo.clientName && (
            <Alert status="info" mb="24px" borderRadius="8px">
              <AlertIcon />
              Creating project for client: <strong>{clientInfo.clientName}</strong>
              {clientInfo.clientEmail && ` (${clientInfo.clientEmail})`}
            </Alert>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert status="error" mb="24px" borderRadius="8px">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {success && (
            <Alert status="success" mb="24px" borderRadius="8px">
              <AlertIcon />
              {success}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Project Category */}
              <FormControl isRequired>
                <FormLabel>Project Category *</FormLabel>
                <Menu closeOnSelect isLazy lazyBehavior="unmount">
                  <MenuButton
                    as={Button}
                    rightIcon={<MdExpandMore />}
                    variant="outline"
                    width="100%"
                    textAlign="left"
                    justifyContent="space-between"
                    fontWeight="normal"
                  >
                    {selectedCategoryLabel}
                  </MenuButton>
                  <MenuList maxH="280px" overflowY="auto" minW="320px">
                    <Box p={2}>
                      <Input
                        placeholder="Search category..."
                        size="sm"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </Box>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => {
                        const categoryId = String(cat.id || cat._id);
                        return (
                          <MenuItem
                            key={categoryId}
                            onClick={() => handleCategoryChange(categoryId)}
                          >
                            {cat.name || cat.title}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem isDisabled>No categories found</MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </FormControl>

              {/* Project Sub Categories */}
              <FormControl isInvalid={validated && (!formData.projectSubCategories || formData.projectSubCategories.length === 0)}>
                <FormLabel>Project Sub Categories *</FormLabel>
                <Menu
                  closeOnSelect={false}
                  isLazy
                  lazyBehavior="unmount"
                  onClose={() => setSubCategoryRenderLimit(80)}
                >
                  <MenuButton
                    as={Button}
                    rightIcon={<MdExpandMore />}
                    variant="outline"
                    width="100%"
                    textAlign="left"
                    justifyContent="space-between"
                    fontWeight="normal"
                    isDisabled={!formData.projectCategory}
                  >
                    {formData.projectSubCategories?.length > 0
                      ? `${formData.projectSubCategories.length} sub-categor${formData.projectSubCategories.length === 1 ? 'y' : 'ies'} selected`
                      : (formData.projectCategory ? 'Select sub categories' : 'Select a category first')}
                  </MenuButton>
                  <MenuList maxH="280px" overflowY="auto" minW="320px">
                    <Box p={2}>
                      <Input
                        placeholder="Search sub category..."
                        size="sm"
                        value={subCategorySearchTerm}
                        onChange={(e) => setSubCategorySearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        isDisabled={!formData.projectCategory}
                      />
                    </Box>
                    {visibleSubCategories.length > 0 ? (
                      visibleSubCategories.map((sub) => {
                        const subId = String(sub.id || sub._id);
                        const isChecked = formData.projectSubCategories?.includes(subId);
                        return (
                          <MenuItem
                            key={subId}
                            onClick={() => {
                              setFormData((prev) => {
                                const current = prev.projectSubCategories || [];
                                const next = current.includes(subId)
                                  ? current.filter((id) => id !== subId)
                                  : [...current, subId];
                                return { ...prev, projectSubCategories: next };
                              });
                            }}
                          >
                            <Checkbox isChecked={isChecked} pointerEvents="none" mr={2}>
                              {sub.name || sub.title}
                            </Checkbox>
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem isDisabled>
                        {formData.projectCategory ? 'No sub-categories found' : 'Please select a category first'}
                      </MenuItem>
                    )}
                    {orderedFilteredSubCategories.length > subCategoryRenderLimit && (
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubCategoryRenderLimit((prev) => prev + 80);
                        }}
                        fontWeight="600"
                        color="brand.500"
                      >
                        Load more ({orderedFilteredSubCategories.length - subCategoryRenderLimit} remaining)
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
                {validated && (!formData.projectSubCategories || formData.projectSubCategories.length === 0) && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select at least one sub-category
                  </Text>
                )}
                {formData.projectSubCategories && formData.projectSubCategories.length > 0 && (
                  <Text fontSize="xs" color="green.500" mt={1}>
                    {formData.projectSubCategories.length} sub-categor{formData.projectSubCategories.length === 1 ? 'y' : 'ies'} selected
                  </Text>
                )}
              </FormControl>

              {/* Project Title */}
              <FormControl isRequired>
                <FormLabel>Project Title *</FormLabel>
                <Input
                  value={formData.projectTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value.slice(0, 50) }))}
                  placeholder="Enter project title (minimum 20 characters)"
                  maxLength={50}
                />
                <Text fontSize="xs" color={formData.projectTitle.length > 0 && formData.projectTitle.length < 20 ? 'red.500' : formData.projectTitle.length >= 20 ? 'green.500' : 'gray.500'} mt={1}>
                  {formData.projectTitle.length}/50 characters (minimum 20)
                </Text>
              </FormControl>

              {/* Technology Preference */}
              <FormControl isInvalid={validated && (!formData.technologyPreference || formData.technologyPreference.length === 0)}>
                <FormLabel>Technology Preference *</FormLabel>
                <Menu
                  closeOnSelect={false}
                  isLazy
                  lazyBehavior="unmount"
                  onClose={() => setTechnologyRenderLimit(80)}
                >
                  <MenuButton
                    as={Button}
                    rightIcon={<MdExpandMore />}
                    variant="outline"
                    width="100%"
                    textAlign="left"
                    justifyContent="space-between"
                    fontWeight="normal"
                  >
                    {formData.technologyPreference?.length > 0
                      ? `${formData.technologyPreference.length} technolog${formData.technologyPreference.length === 1 ? 'y' : 'ies'} selected`
                      : 'Select technologies'}
                  </MenuButton>
                  <MenuList maxH="280px" overflowY="auto" minW="320px">
                    <Box p={2}>
                      <Input
                        placeholder="Search technology..."
                        size="sm"
                        value={technologySearchTerm}
                        onChange={(e) => setTechnologySearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </Box>
                    {visibleTechnologies.length > 0 ? (
                      visibleTechnologies.map((tech) => {
                        const techId = String(tech.id || tech._id);
                        const isChecked = formData.technologyPreference?.includes(techId);
                        return (
                          <MenuItem
                            key={techId}
                            onClick={() => {
                              setFormData((prev) => {
                                const current = prev.technologyPreference || [];
                                const next = current.includes(techId)
                                  ? current.filter((id) => id !== techId)
                                  : [...current, techId];
                                return { ...prev, technologyPreference: next };
                              });
                            }}
                          >
                            <Checkbox isChecked={isChecked} pointerEvents="none" mr={2}>
                              {tech.name || tech.title}
                            </Checkbox>
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem isDisabled>No technologies found</MenuItem>
                    )}
                    {orderedFilteredTechnologies.length > technologyRenderLimit && (
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setTechnologyRenderLimit((prev) => prev + 80);
                        }}
                        fontWeight="600"
                        color="brand.500"
                      >
                        Load more ({orderedFilteredTechnologies.length - technologyRenderLimit} remaining)
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
                {validated && (!formData.technologyPreference || formData.technologyPreference.length === 0) && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select at least one technology preference
                  </Text>
                )}
                {formData.technologyPreference && formData.technologyPreference.length > 0 && (
                  <Text fontSize="xs" color="green.500" mt={1}>
                    {formData.technologyPreference.length} technolog{formData.technologyPreference.length === 1 ? 'y' : 'ies'} selected
                  </Text>
                )}
              </FormControl>

              {/* Pricing Model */}
              <FormControl gridColumn={{ base: '1', md: '1 / -1' }} isRequired>
                <FormLabel>Pricing Model *</FormLabel>
                <RadioGroup
                  value={formData.pricingModel}
                  onChange={handlePricingModelChange}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="hourly">Hourly</Radio>
                    <Radio value="retainer">Retainership</Radio>
                    <Radio value="fixed">Fixed Price</Radio>
                    <Radio value="halogig">Halogig</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Rate Range */}
              {(hourlyVisible || retainershipVisible || fixedPriceVisible || halogigVisible) && (
                <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                  <FormLabel>
                    {hourlyVisible ? 'Rate Per Hour' : retainershipVisible ? 'Rate Per Month' : fixedPriceVisible ? 'Total Project Amount' : 'Halogig Project Amount'} *
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.rateMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, rateMin: e.target.value.slice(0, 10) }))}
                        placeholder={hourlyVisible ? 'e.g. 500 (min ₹/hr)' : retainershipVisible ? 'e.g. 50000 (min ₹/month)' : 'e.g. 10000 (min budget)'}
                        min={0}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.rateMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, rateMax: e.target.value.slice(0, 10) }))}
                        placeholder={hourlyVisible ? 'e.g. 2000 (max ₹/hr)' : retainershipVisible ? 'e.g. 200000 (max ₹/month)' : 'e.g. 100000 (max budget)'}
                        min={formData.rateMin || 0}
                        maxLength={10}
                      />
                      {parseFloat(formData.rateMin) > parseFloat(formData.rateMax) && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          Max must be greater than Min
                        </Text>
                      )}
                    </FormControl>
                    <FormControl>
                      <Select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="USD-$">USD-$</option>
                        <option value="INR-₹">INR-₹</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              {/* Duration Range */}
              {(hourlyVisible || retainershipVisible || fixedPriceVisible || halogigVisible) && (
                <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                  <FormLabel>
                    Project Duration ({hourlyVisible ? 'Hours' : retainershipVisible ? 'Months' : fixedPriceVisible ? 'Days' : 'Days'}) *
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.durationMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value.slice(0, 4) }))}
                        placeholder={hourlyVisible ? 'e.g. 40 (min hours)' : retainershipVisible ? 'e.g. 1 (min months)' : 'e.g. 7 (min days)'}
                        min={0}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.durationMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMax: e.target.value.slice(0, 4) }))}
                        placeholder={hourlyVisible ? 'e.g. 200 (max hours)' : retainershipVisible ? 'e.g. 12 (max months)' : 'e.g. 90 (max days)'}
                        min={formData.durationMin || 0}
                        maxLength={4}
                      />
                      {parseFloat(formData.durationMin) > parseFloat(formData.durationMax) && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          Max must be greater than Min
                        </Text>
                      )}
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              {/* Project Summary */}
              <FormControl gridColumn={{ base: '1', md: '1 / -1' }} isRequired>
                <FormLabel>Project Summary *</FormLabel>
                <Textarea
                  value={formData.projectSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value.slice(0, 300) }))}
                  rows={6}
                  placeholder="Describe the project (minimum 160 characters, maximum 300 characters)"
                  maxLength={300}
                />
                <Text fontSize="xs" color={formData.projectSummary.length > 0 && formData.projectSummary.length < 160 ? 'red.500' : formData.projectSummary.length >= 160 ? 'green.500' : 'gray.500'} mt={1}>
                  {formData.projectSummary.length}/300 characters (minimum 160)
                </Text>
              </FormControl>

              {/* Type of Project */}
              <FormControl gridColumn={{ base: '1', md: '1 / -1' }} isRequired>
                <FormLabel>Type of Project *</FormLabel>
                <RadioGroup
                  value={formData.typeOfProject}
                  onChange={(value) => setFormData(prev => ({ ...prev, typeOfProject: value }))}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="maintenance">Maintenance</Radio>
                    <Radio value="new-development">New Development</Radio>
                    <Radio value="maintenance-cum-new-development">Maintenance Cum New Development</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Customer Industry */}
              <FormControl gridColumn={{ base: '1', md: '1 / -1' }} isRequired>
                <FormLabel>Customer Industry *</FormLabel>
                <Select
                  value={formData.customerIndustry}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerIndustry: e.target.value }))}
                  placeholder="Select Customer Industry"
                >
                  {industries.map((ind) => (
                    <option key={ind.id || ind._id} value={ind.id || ind._id}>
                      {ind.industry || ind.name || ind.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Location Preference */}
              <FormControl gridColumn={{ base: '1', md: '1 / -1' }} isRequired>
                <FormLabel>
                  Location Preference <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <RadioGroup
                  value={formData.locationPreferancer}
                  onChange={(value) => setFormData(prev => ({ ...prev, locationPreferancer: value }))}
                >
                  <Stack direction="row" spacing={4} wrap="wrap">
                    <Radio value="city">
                      Anywhere in the {userCity || 'City'}
                    </Radio>
                    <Radio value="country">
                      Anywhere in the {userCountry || 'Country'}
                    </Radio>
                    <Radio value="globaly">
                      Anywhere in Globally
                    </Radio>
                  </Stack>
                </RadioGroup>
                {error && error.includes('location preference') && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select a location preference
                  </Text>
                )}
              </FormControl>

              {/* Submit Button */}
              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <Flex justify="flex-end" gap={3} mt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/offline-clients')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText="Creating Project..."
                  >
                    Create Project
                  </Button>
                </Flex>
              </Box>
            </SimpleGrid>
          </form>
        </Box>
      </Card>
    </Box>
  );
}


import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
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
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdExpandMore } from 'react-icons/md';
import { getApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import { updateProject } from '../../../features/admin/projectManagementSlice';

export default function UpdateClientProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { projectId } = useParams();

  const returnPath = location.state?.returnPath || '/admin/offline-projects';
  const [projectPrefill, setProjectPrefill] = useState(null);
  const techPrefillMappedRef = useRef(false);

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
    locationPreferancer: '',
    noticePeriodMin: '',
    noticePeriodMax: '',
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
      noticePeriodMin:
        projectPrefill.notice_period_min !== undefined && projectPrefill.notice_period_min !== null
          ? String(projectPrefill.notice_period_min)
          : prev.noticePeriodMin,
      noticePeriodMax:
        projectPrefill.notice_period_max !== undefined && projectPrefill.notice_period_max !== null
          ? String(projectPrefill.notice_period_max)
          : prev.noticePeriodMax,
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

  useEffect(() => {
    techPrefillMappedRef.current = false;
  }, [projectId]);

  // Map saved technology names (comma-separated) to checkbox IDs once options are loaded
  useEffect(() => {
    if (!projectPrefill || !technologies.length) return;
    if (techPrefillMappedRef.current) return;
    const raw = projectPrefill.technologty_pre;
    if (!raw) {
      techPrefillMappedRef.current = true;
      return;
    }
    const names = String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ids = [];
    names.forEach((name) => {
      const tech = technologies.find((t) => (t.name || t.title) === name);
      if (tech) ids.push(String(tech.id || tech._id));
    });
    if (ids.length) {
      setFormData((prev) => ({ ...prev, technologyPreference: ids }));
    }
    techPrefillMappedRef.current = true;
  }, [projectPrefill, technologies]);

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

  // Fetch client city and country (posted_by user)
  const getClientCountyCityState = async (clientUserId) => {
    if (!clientUserId) {
      setUserCity('City');
      setUserCountry('Country');
      return;
    }

    try {
      const response = await getApi(`${apiEndPoints.GET_CLIENT_DETAILS}/${clientUserId}/details`);
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

      if (retainershipVisible) {
        if (!formData.noticePeriodMin || !formData.noticePeriodMax) {
          throw new Error('Please enter notice period range');
        }
        if (parseFloat(formData.noticePeriodMin) > parseFloat(formData.noticePeriodMax)) {
          throw new Error('Maximum notice period must be greater than minimum notice period');
        }
      }

      if (!projectPrefill) {
        throw new Error('Project data is not loaded');
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

      const projectData = {
        posted_by_user_id: projectPrefill.posted_by_user_id,
        project_title: formData.projectTitle,
        project_category: String(formData.projectCategory),
        project_sub_category: subCategoryIds.join(','),
        project_summary: formData.projectSummary,
        type_of_project: formData.typeOfProject,
        project_duration_min: formData.durationMin,
        project_duration_max: formData.durationMax,
        customer_industry: String(formData.customerIndustry),
        technologty_pre: selectedTechnologies.map((tech) => tech.name || tech.title).join(','),
        notice_period: projectPrefill.notice_period || '0',
        notice_period_min: formData.noticePeriodMin,
        notice_period_max: formData.noticePeriodMax,
        sales_amount: projectPrefill.sales_amount || '0',
        sales_amount_to: projectPrefill.sales_amount_to || '0',
        project_amount: formData.rateMin,
        project_amount_min: formData.rateMin,
        project_amount_max: formData.rateMax,
        project_amount_to: formData.rateMax,
        model_engagement: formData.pricingModel,
        currency_type: formData.currency.split('-')[0],
        currency_symbol: formData.currency.split('-')[1],
        location_preferancer: formData.locationPreferancer,
        status: projectPrefill.status,
      };

      await dispatch(
        updateProject({
          projectId: Number(projectId),
          projectData,
        }),
      ).unwrap();

      setSuccess('Project updated successfully!');
      showSuccess('Project updated successfully!');
      setTimeout(() => {
        navigate(returnPath);
      }, 1200);

    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to update project';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load project + dropdowns
  useEffect(() => {
    if (!projectId) return undefined;

    let cancelled = false;

    const parseList = (response) => {
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response)) return response;
      return [];
    };

    const load = async () => {
      setIsLoading(true);
      setProjectPrefill(null);
      try {
        const [catRes, techRes, indRes, projRes] = await Promise.all([
          getApi(apiEndPoints.GET_CATEGORIES),
          getApi(apiEndPoints.GET_TECHNOLOGIES),
          getApi(apiEndPoints.GET_INDUSTRIES),
          getApi(`${apiEndPoints.GET_PROJECT_PREFILL}/${projectId}/prefill`),
        ]);
        if (cancelled) return;

        setCategories(parseList(catRes));
        setTechnologies(parseList(techRes));
        setIndustries(parseList(indRes));

        const project = projRes?.data?.data;
        if (!project) {
          showError('Project not found');
          return;
        }
        setProjectPrefill(project);

        const clientUserId = project?.User?.id || project?.posted_by_user_id;
        await getClientCountyCityState(clientUserId);
      } catch (err) {
        console.error('Error loading update project page:', err);
        showError(err?.response?.data?.message || 'Failed to load project');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (!projectPrefill) {
    return (
      <Box bg={bgColor} minH="100%" p={6}>
        <Card bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={sectionBorderColor} p={6}>
          <Text color={textColor} mb={4}>
            Unable to load this project. It may have been removed or you may not have access.
          </Text>
          <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate(returnPath)}>
            Back to projects
          </Button>
        </Card>
      </Box>
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
              onClick={() => navigate(returnPath)}
              variant="ghost"
              aria-label="Back to projects"
            />
            <Text color={textColor} fontSize="2xl" fontWeight="700">
              Update Project
            </Text>
          </HStack>

          {/* Client Info */}
          {(projectPrefill?.User?.first_name || projectPrefill?.User?.email) && (
            <Alert status="info" mb="24px" borderRadius="8px">
              <AlertIcon />
              Client:{' '}
              <strong>
                {[projectPrefill?.User?.first_name, projectPrefill?.User?.last_name].filter(Boolean).join(' ') || '—'}
              </strong>
              {projectPrefill?.User?.email && ` (${projectPrefill.User.email})`}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="Enter project title (minimum 20 characters)"
                />
                <Text fontSize="xs" color={formData.projectTitle.length > 0 && formData.projectTitle.length < 20 ? 'red.500' : 'gray.500'} mt={1}>
                  {formData.projectTitle.length}/20 characters minimum
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
                    {hourlyVisible ? 'Rate Per Hour' : retainershipVisible ? 'Rate Per Month' : fixedPriceVisible ? 'Total Project Amount' : 'Halogig Rate'} *
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.rateMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, rateMin: e.target.value }))}
                        placeholder="Min"
                        min={0}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.rateMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, rateMax: e.target.value }))}
                        placeholder="Max"
                        min={formData.rateMin || 0}
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
                        <option value="EUR-€">EUR-€</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}

              {/* Duration Range */}
              {(hourlyVisible || retainershipVisible || fixedPriceVisible || halogigVisible) && (
                <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                  <FormLabel>
                    Project Duration ({hourlyVisible ? 'Hours' : retainershipVisible ? 'Months' : fixedPriceVisible ? 'Days' : 'Months'}) *
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.durationMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value }))}
                        placeholder="Min"
                        min={0}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.durationMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMax: e.target.value }))}
                        placeholder="Max"
                        min={formData.durationMin || 0}
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

              {/* Notice period — retainership (matches admin project edit modal) */}
              {retainershipVisible && (
                <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                  <FormLabel>Notice Period (In Days) *</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.noticePeriodMin}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, noticePeriodMin: e.target.value }))
                        }
                        placeholder="Min"
                        min={0}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <Input
                        type="number"
                        value={formData.noticePeriodMax}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, noticePeriodMax: e.target.value }))
                        }
                        placeholder="Max"
                        min={formData.noticePeriodMin || 0}
                      />
                      {parseFloat(formData.noticePeriodMin) > parseFloat(formData.noticePeriodMax) && (
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
                  onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
                  rows={6}
                  placeholder="Describe the project (minimum 160 characters)"
                />
                <Text fontSize="xs" color={formData.projectSummary.length > 0 && formData.projectSummary.length < 160 ? 'red.500' : 'gray.500'} mt={1}>
                  {formData.projectSummary.length}/160 characters minimum
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
                    onClick={() => navigate(returnPath)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText="Updating project..."
                  >
                    Update Project
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


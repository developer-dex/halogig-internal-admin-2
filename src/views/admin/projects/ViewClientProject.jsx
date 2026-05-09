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
  Badge,
} from '@chakra-ui/react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdExpandMore } from 'react-icons/md';
import { getApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError } from '../../../helpers/messageHelper';

export default function ViewClientProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const returnPath = location.state?.returnPath || '/admin/offline-projects';
  const [projectPrefill, setProjectPrefill] = useState(null);
  const techPrefillMappedRef = useRef(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('#F4F7FE', 'black');
  const cardBg = useColorModeValue('white', 'navy.800');
  const sectionBorderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

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
      ? String(projectPrefill.project_sub_category).split(',').map((x) => x.trim()).filter(Boolean)
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
        projectPrefill.notice_period_min != null ? String(projectPrefill.notice_period_min) : prev.noticePeriodMin,
      noticePeriodMax:
        projectPrefill.notice_period_max != null ? String(projectPrefill.notice_period_max) : prev.noticePeriodMax,
    }));
  }, [projectPrefill]);

  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    techPrefillMappedRef.current = false;
  }, [projectId]);

  // Map saved technology names to IDs once options are loaded
  useEffect(() => {
    if (!projectPrefill || !technologies.length) return;
    if (techPrefillMappedRef.current) return;
    const raw = projectPrefill.technologty_pre;
    if (!raw) { techPrefillMappedRef.current = true; return; }
    const names = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    const ids = names
      .map((name) => { const t = technologies.find((x) => (x.name || x.title) === name); return t ? String(t.id || t._id) : null; })
      .filter(Boolean);
    if (ids.length) setFormData((prev) => ({ ...prev, technologyPreference: ids }));
    techPrefillMappedRef.current = true;
  }, [projectPrefill, technologies]);

  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState('');
  const [technologySearchTerm, setTechnologySearchTerm] = useState('');
  const [subCategoryRenderLimit, setSubCategoryRenderLimit] = useState(80);
  const [technologyRenderLimit, setTechnologyRenderLimit] = useState(80);
  const [userCity, setUserCity] = useState('');
  const [userCountry, setUserCountry] = useState('');

  const deferredCategorySearchTerm = useDeferredValue(categorySearchTerm);
  const deferredSubCategorySearchTerm = useDeferredValue(subCategorySearchTerm);
  const deferredTechnologySearchTerm = useDeferredValue(technologySearchTerm);

  const filteredCategories = useMemo(() => {
    const q = deferredCategorySearchTerm.trim().toLowerCase();
    return q ? categories.filter((c) => (c?.name || c?.title || '').toLowerCase().includes(q)) : categories;
  }, [categories, deferredCategorySearchTerm]);

  const filteredSubCategories = useMemo(() => {
    const q = deferredSubCategorySearchTerm.trim().toLowerCase();
    return q ? subCategories.filter((s) => (s?.name || s?.title || '').toLowerCase().includes(q)) : subCategories;
  }, [subCategories, deferredSubCategorySearchTerm]);

  const filteredTechnologies = useMemo(() => {
    const q = deferredTechnologySearchTerm.trim().toLowerCase();
    return q ? technologies.filter((t) => (t?.name || t?.title || '').toLowerCase().includes(q)) : technologies;
  }, [technologies, deferredTechnologySearchTerm]);

  const orderedFilteredSubCategories = useMemo(() => {
    const sel = new Set((formData.projectSubCategories || []).map(String));
    const selected = [], unselected = [];
    filteredSubCategories.forEach((s) => (sel.has(String(s.id || s._id)) ? selected : unselected).push(s));
    return [...selected, ...unselected];
  }, [filteredSubCategories, formData.projectSubCategories]);

  const orderedFilteredTechnologies = useMemo(() => {
    const sel = new Set((formData.technologyPreference || []).map(String));
    const selected = [], unselected = [];
    filteredTechnologies.forEach((t) => (sel.has(String(t.id || t._id)) ? selected : unselected).push(t));
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

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) { setSubCategories([]); return; }
    try {
      const parseList = (r) => Array.isArray(r?.data?.data) ? r.data.data : Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];
      const response = await getApi(`${apiEndPoints.GET_SUBCATEGORIES}/${categoryId}`);
      setSubCategories(parseList(response));
    } catch { setSubCategories([]); }
  };

  const getClientCountyCityState = async (clientUserId) => {
    if (!clientUserId) { setUserCity('City'); setUserCountry('Country'); return; }
    try {
      const response = await getApi(`${apiEndPoints.GET_CLIENT_DETAILS}/${clientUserId}/details`);
      const d = response?.data?.data || response?.data || response;
      setUserCity(d?.city || '');
      const country = typeof d?.country === 'string' ? d.country : d?.country?.name || d?.country?.country || '';
      setUserCountry(country || 'Country');
    } catch { setUserCity('City'); setUserCountry('Country'); }
  };

  useEffect(() => {
    if (!formData.projectCategory) return;
    if (Array.isArray(subCategories) && subCategories.length > 0) return;
    fetchSubCategories(formData.projectCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projectCategory]);

  const selectedCategoryLabel = useMemo(() => {
    if (!formData.projectCategory) return 'No category selected';
    const cat = categories.find((c) => String(c.id || c._id) === String(formData.projectCategory));
    return cat?.name || cat?.title || 'No category selected';
  }, [categories, formData.projectCategory]);

  useEffect(() => { setSubCategoryRenderLimit(80); }, [deferredSubCategorySearchTerm]);
  useEffect(() => { setTechnologyRenderLimit(80); }, [deferredTechnologySearchTerm]);

  const hourlyVisible = formData.pricingModel === 'hourly';
  const retainershipVisible = formData.pricingModel === 'retainer';
  const fixedPriceVisible = formData.pricingModel === 'fixed';
  const halogigVisible = formData.pricingModel === 'halogig';

  // Load project + dropdowns
  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    const parseList = (r) => Array.isArray(r?.data?.data) ? r.data.data : Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : [];

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
        if (!project) { showError('Project not found'); navigate(returnPath); return; }
        setProjectPrefill(project);
        await getClientCountyCityState(project?.User?.id || project?.posted_by_user_id);
      } catch (err) {
        showError(err?.response?.data?.message || 'Failed to load project');
        navigate(returnPath);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
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
          <Text color={textColor} mb={4}>Unable to load this project.</Text>
          <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate(returnPath)}>
            Back to projects
          </Button>
        </Card>
      </Box>
    );
  }

  // Shared read-only input style
  const roInputProps = {
    isReadOnly: true,
    bg: 'gray.50',
    _focus: { boxShadow: 'none', borderColor: 'gray.200' },
    cursor: 'default',
  };

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
              View Project
            </Text>
            <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
              Read Only
            </Badge>
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

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Project Category */}
            <FormControl>
              <FormLabel>Project Category</FormLabel>
              <Menu isLazy lazyBehavior="unmount">
                <MenuButton
                  as={Button}
                  rightIcon={<MdExpandMore />}
                  variant="outline"
                  width="100%"
                  textAlign="left"
                  justifyContent="space-between"
                  fontWeight="normal"
                  bg="gray.50"
                  pointerEvents="none"
                  _hover={{}}
                  _active={{}}
                >
                  {selectedCategoryLabel}
                </MenuButton>
              </Menu>
            </FormControl>

            {/* Project Sub Categories */}
            <FormControl>
              <FormLabel>Project Sub Categories</FormLabel>
              <Menu isLazy lazyBehavior="unmount">
                <MenuButton
                  as={Button}
                  rightIcon={<MdExpandMore />}
                  variant="outline"
                  width="100%"
                  textAlign="left"
                  justifyContent="space-between"
                  fontWeight="normal"
                  bg="gray.50"
                  pointerEvents="none"
                  _hover={{}}
                  _active={{}}
                >
                  {formData.projectSubCategories?.length > 0
                    ? `${formData.projectSubCategories.length} sub-categor${formData.projectSubCategories.length === 1 ? 'y' : 'ies'} selected`
                    : 'No sub-categories'}
                </MenuButton>
              </Menu>
              {formData.projectSubCategories?.length > 0 && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {(() => {
                    const names = formData.projectSubCategories.map((id) => {
                      const s = subCategories.find((x) => String(x.id || x._id) === String(id));
                      return s?.name || s?.title || id;
                    });
                    return names.join(', ');
                  })()}
                </Text>
              )}
            </FormControl>

            {/* Project Title */}
            <FormControl>
              <FormLabel>Project Title</FormLabel>
              <Input value={formData.projectTitle || '--'} {...roInputProps} />
            </FormControl>

            {/* Technology Preference */}
            <FormControl>
              <FormLabel>Technology Preference</FormLabel>
              <Menu isLazy lazyBehavior="unmount">
                <MenuButton
                  as={Button}
                  rightIcon={<MdExpandMore />}
                  variant="outline"
                  width="100%"
                  textAlign="left"
                  justifyContent="space-between"
                  fontWeight="normal"
                  bg="gray.50"
                  pointerEvents="none"
                  _hover={{}}
                  _active={{}}
                >
                  {formData.technologyPreference?.length > 0
                    ? `${formData.technologyPreference.length} technolog${formData.technologyPreference.length === 1 ? 'y' : 'ies'} selected`
                    : 'No technologies'}
                </MenuButton>
              </Menu>
              {formData.technologyPreference?.length > 0 && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {(() => {
                    const names = formData.technologyPreference.map((id) => {
                      const t = technologies.find((x) => String(x.id || x._id) === String(id));
                      return t?.name || t?.title || id;
                    });
                    return names.join(', ');
                  })()}
                </Text>
              )}
            </FormControl>

            {/* Pricing Model */}
            <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
              <FormLabel>Pricing Model</FormLabel>
              {/* pointerEvents="none" keeps the selected radio visually highlighted */}
              <RadioGroup value={formData.pricingModel}>
                <Stack direction="row" spacing={4} pointerEvents="none">
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
                  {hourlyVisible ? 'Rate Per Hour' : retainershipVisible ? 'Rate Per Month' : fixedPriceVisible ? 'Total Project Amount' : 'Halogig Rate'}
                </FormLabel>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <Input value={formData.rateMin || '--'} {...roInputProps} placeholder="Min" />
                  </FormControl>
                  <FormControl>
                    <Input value={formData.rateMax || '--'} {...roInputProps} placeholder="Max" />
                  </FormControl>
                  <FormControl>
                    <Input value={formData.currency || '--'} {...roInputProps} />
                  </FormControl>
                </SimpleGrid>
              </Box>
            )}

            {/* Duration Range */}
            {(hourlyVisible || retainershipVisible || fixedPriceVisible || halogigVisible) && (
              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <FormLabel>
                  Project Duration ({hourlyVisible ? 'Hours' : retainershipVisible ? 'Months' : fixedPriceVisible ? 'Days' : 'Months'})
                </FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <Input value={formData.durationMin || '--'} {...roInputProps} placeholder="Min" />
                  </FormControl>
                  <FormControl>
                    <Input value={formData.durationMax || '--'} {...roInputProps} placeholder="Max" />
                  </FormControl>
                </SimpleGrid>
              </Box>
            )}

            {/* Notice Period (retainership only) */}
            {retainershipVisible && (
              <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                <FormLabel>Notice Period (In Days)</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <Input value={formData.noticePeriodMin || '--'} {...roInputProps} placeholder="Min" />
                  </FormControl>
                  <FormControl>
                    <Input value={formData.noticePeriodMax || '--'} {...roInputProps} placeholder="Max" />
                  </FormControl>
                </SimpleGrid>
              </Box>
            )}

            {/* Project Summary */}
            <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
              <FormLabel>Project Summary</FormLabel>
              <Textarea
                value={formData.projectSummary || '--'}
                rows={6}
                resize="none"
                {...roInputProps}
              />
            </FormControl>

            {/* Type of Project */}
            <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
              <FormLabel>Type of Project</FormLabel>
              {/* pointerEvents="none" keeps the selected radio visually highlighted */}
              <RadioGroup value={formData.typeOfProject}>
                <Stack direction="row" spacing={4} pointerEvents="none">
                  <Radio value="maintenance">Maintenance</Radio>
                  <Radio value="new-development">New Development</Radio>
                  <Radio value="maintenance-cum-new-development">Maintenance Cum New Development</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Customer Industry */}
            <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
              <FormLabel>Customer Industry</FormLabel>
              <Input
                value={(() => {
                  const ind = industries.find((i) => String(i.id || i._id) === String(formData.customerIndustry));
                  return ind?.industry || ind?.name || ind?.title || formData.customerIndustry || '--';
                })()}
                {...roInputProps}
              />
            </FormControl>

            {/* Location Preference */}
            <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
              <FormLabel>Location Preference</FormLabel>
              {/* pointerEvents="none" keeps the selected radio visually highlighted */}
              <RadioGroup value={formData.locationPreferancer}>
                <Stack direction="row" spacing={4} wrap="wrap" pointerEvents="none">
                  <Radio value="city">Anywhere in the {userCity || 'City'}</Radio>
                  <Radio value="country">Anywhere in the {userCountry || 'Country'}</Radio>
                  <Radio value="globaly">Anywhere Globally</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Back button only — no submit */}
            <Box gridColumn={{ base: '1', md: '1 / -1' }}>
              <Flex justify="flex-end" mt={4}>
                <Button leftIcon={<ArrowBackIcon />} variant="outline" onClick={() => navigate(returnPath)}>
                  Back
                </Button>
              </Flex>
            </Box>
          </SimpleGrid>
        </Box>
      </Card>
    </Box>
  );
}

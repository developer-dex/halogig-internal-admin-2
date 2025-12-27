import React, { useState, useEffect } from 'react';
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
  VStack,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getApi, postApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';

export default function CreateClientProject() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get client data from navigation state
  const clientInfo = location.state || {};

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#F4F7FE', 'black');

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
    typeOfProject: 'maintainance',
    currency: 'INR-₹',
    locationPreferancer: ''
  });

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
  
  // Location state
  const [userCity, setUserCity] = useState('');
  const [userCountry, setUserCountry] = useState('');

  // Pricing model visibility
  const [hourlyVisible, setHourlyVisible] = useState(true);
  const [retainershipVisible, setRetainershipVisible] = useState(false);
  const [fixedPriceVisible, setFixedPriceVisible] = useState(false);
  const [halogigVisible, setHalogigVisible] = useState(false);

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
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData(prev => ({
      ...prev,
      projectCategory: categoryId,
      projectSubCategories: []
    }));
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };

  // Handle pricing model change
  const handlePricingModelChange = (value) => {
    setFormData(prev => ({ ...prev, pricingModel: value }));
    
    // Update visibility
    setHourlyVisible(value === 'hourly');
    setRetainershipVisible(value === 'retainer');
    setFixedPriceVisible(value === 'fixed');
    setHalogigVisible(value === 'halogig');
  };

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
        posted_by_user_id: clientInfo.clientId || null,
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
    <Box>
      <Card bg={bgColor}>
        <Box p="24px">
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
                <Select
                  value={formData.projectCategory}
                  onChange={handleCategoryChange}
                  placeholder="Select a Project Category"
                >
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.name || cat.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Project Sub Categories */}
              <FormControl isInvalid={validated && (!formData.projectSubCategories || formData.projectSubCategories.length === 0)}>
                <FormLabel>Project Sub Categories *</FormLabel>
                <CheckboxGroup
                  value={formData.projectSubCategories || []}
                  onChange={(values) => {
                    setFormData(prev => ({ ...prev, projectSubCategories: values || [] }));
                  }}
                >
                  <VStack align="start" spacing={2} maxH="200px" overflowY="auto" p={2} border="1px solid" borderColor={borderColor} borderRadius="8px">
                    {subCategories.map((sub) => {
                      const subId = String(sub.id || sub._id);
                      return (
                        <Checkbox key={subId} value={subId}>
                          {sub.name || sub.title}
                        </Checkbox>
                      );
                    })}
                    {subCategories.length === 0 && (
                      <Text fontSize="sm" color="gray.500">
                        {formData.projectCategory ? 'No sub-categories available' : 'Please select a category first'}
                      </Text>
                    )}
                  </VStack>
                </CheckboxGroup>
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
                <CheckboxGroup
                  value={formData.technologyPreference || []}
                  onChange={(values) => {
                    setFormData(prev => ({ ...prev, technologyPreference: values || [] }));
                  }}
                >
                  <VStack align="start" spacing={2} maxH="200px" overflowY="auto" p={2} border="1px solid" borderColor={borderColor} borderRadius="8px">
                    {technologies.map((tech) => {
                      const techId = String(tech.id || tech._id);
                      return (
                        <Checkbox key={techId} value={techId}>
                          {tech.name || tech.title}
                        </Checkbox>
                      );
                    })}
                  </VStack>
                </CheckboxGroup>
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
                    <Radio value="maintainance">Maintenance</Radio>
                    <Radio value="new-development">New Development</Radio>
                    <Radio value="maintainance-cum-new-development">Maintenance Cum New Development</Radio>
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


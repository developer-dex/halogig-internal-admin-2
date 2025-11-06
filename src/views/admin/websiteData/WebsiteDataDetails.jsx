import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Spinner,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
} from '@chakra-ui/react';
import {
  MdArrowBack,
  MdEdit,
  MdSave,
  MdAdd,
  MdRemove,
  MdSync,
} from 'react-icons/md';
import {
  getWebsiteDataById,
  updateWebsiteData,
} from '../../../features/admin/websiteDataSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import { patchApi } from '../../../services/api';

export default function WebsiteDataDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { isLoading, responseData } = useSelector((state) => state.websiteData);

  const [formData, setFormData] = useState({
    categoryName: '',
    serviceName: '',
    slugLink: '',
    primaryKeyword: '',
    secondaryKeyword: '',
    bannerTitle: '',
    bannerDescription: '',
    serviceTitle: '',
    serviceDescription: '',
    serviceLists: [{ title: '', description: '' }],
    industryTitle: '',
    industryLists: [''],
    mainApplicationTitle: '',
    mainApplicationDescription: '',
    mainApplicationLists: [{ title: '', description: '' }],
    interlinkPages: [{ interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] }],
    usercaseListes: [''],
    metaTitle: '',
    metaDescription: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const syncModal = useDisclosure();
  const saveConfirmModal = useDisclosure();
  const [syncField, setSyncField] = useState('');
  const [syncValue, setSyncValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.800');
  const groupBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  // Fetch website data by ID
  const fetchWebsiteData = async () => {
    try {
      const response = await dispatch(getWebsiteDataById(id));
      if (response.payload?.data?.success) {
        const data = response.payload.data.data;
        setOriginalData(data);

        setFormData({
          categoryName: data.category_name || '',
          serviceName: data.service_name || '',
          slugLink: data.slug_link || '',
          primaryKeyword: data.primary_keyword || '',
          secondaryKeyword: data.secondary_keyword || '',
          bannerTitle: data.banner_title || '',
          bannerDescription: data.banner_description || '',
          serviceTitle: data.service_title || '',
          serviceDescription: data.service_description || '',
          serviceLists:
            data.service_lists && data.service_lists.length > 0
              ? data.service_lists
              : [{ title: '', description: '' }],
          industryTitle: data.industry_title || '',
          industryLists: data.industry_lists
            ? data.industry_lists.split(',').map((item) => item.trim())
            : [''],
          mainApplicationTitle: data.main_application_title || '',
          mainApplicationDescription: data.main_application_description || '',
          mainApplicationLists:
            data.main_application_lists && data.main_application_lists.length > 0
              ? data.main_application_lists
              : [{ title: '', description: '' }],
          interlinkPages:
            data.interlink_pages && data.interlink_pages.length > 0
              ? data.interlink_pages
              : [{ interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] }],
          usercaseListes: data.usercase_listes
            ? data.usercase_listes.split(',').map((item) => item.trim())
            : [''],
          metaTitle: data.meta_title || '',
          metaDescription: data.meta_description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWebsiteData();
    }
  }, [id]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle service lists changes
  const handleServiceListChange = (index, field, value) => {
    const newServiceLists = formData.serviceLists.map((service, i) =>
      i === index ? { ...service, [field]: value } : service
    );
    setFormData((prev) => ({
      ...prev,
      serviceLists: newServiceLists,
    }));
  };

  const addServiceList = () => {
    if (formData.serviceLists.length < 5) {
      setFormData((prev) => ({
        ...prev,
        serviceLists: [...prev.serviceLists, { title: '', description: '' }],
      }));
    }
  };

  const removeServiceList = (index) => {
    if (formData.serviceLists.length > 1) {
      const newServiceLists = formData.serviceLists.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        serviceLists: newServiceLists,
      }));
    }
  };

  // Handle main application lists changes
  const handleMainApplicationChange = (index, field, value) => {
    const newMainApplicationLists = formData.mainApplicationLists.map((app, i) =>
      i === index ? { ...app, [field]: value } : app
    );
    setFormData((prev) => ({
      ...prev,
      mainApplicationLists: newMainApplicationLists,
    }));
  };

  const addMainApplication = () => {
    if (formData.mainApplicationLists.length < 5) {
      setFormData((prev) => ({
        ...prev,
        mainApplicationLists: [...prev.mainApplicationLists, { title: '', description: '' }],
      }));
    }
  };

  const removeMainApplication = (index) => {
    if (formData.mainApplicationLists.length > 1) {
      const newMainApplicationLists = formData.mainApplicationLists.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        mainApplicationLists: newMainApplicationLists,
      }));
    }
  };

  // Handle interlink pages changes - Groups
  const handleInterlinkGroupHeadingChange = (groupIndex, value) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) =>
      i === groupIndex ? { ...group, interlink_heading: value } : group
    );
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  // Handle interlink page within a group
  const handleInterlinkPageChange = (groupIndex, pageIndex, field, value) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) => {
      if (i === groupIndex) {
        const newPages = group.interlink_pages.map((page, j) =>
          j === pageIndex ? { ...page, [field]: value } : page
        );
        return { ...group, interlink_pages: newPages };
      }
      return group;
    });
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  // Add a new interlink page within a group
  const addInterlinkPageToGroup = (groupIndex) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) => {
      if (i === groupIndex) {
        return {
          ...group,
          interlink_pages: [...group.interlink_pages, { slug: '', altername_skill_name: '' }],
        };
      }
      return group;
    });
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  // Remove a page from a group
  const removeInterlinkPageFromGroup = (groupIndex, pageIndex) => {
    const newInterlinkPages = formData.interlinkPages.map((group, i) => {
      if (i === groupIndex) {
        const newPages = group.interlink_pages.filter((_, j) => j !== pageIndex);
        return { ...group, interlink_pages: newPages };
      }
      return group;
    });
    setFormData((prev) => ({
      ...prev,
      interlinkPages: newInterlinkPages,
    }));
  };

  // Add a new interlink group
  const addInterlinkGroup = () => {
    setFormData((prev) => ({
      ...prev,
      interlinkPages: [
        ...prev.interlinkPages,
        { interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] },
      ],
    }));
  };

  // Remove an interlink group
  const removeInterlinkGroup = (groupIndex) => {
    if (formData.interlinkPages.length > 1) {
      const newInterlinkPages = formData.interlinkPages.filter((_, i) => i !== groupIndex);
      setFormData((prev) => ({
        ...prev,
        interlinkPages: newInterlinkPages,
      }));
    }
  };

  // Handle industry lists changes
  const handleIndustryListChange = (index, value) => {
    const newIndustryLists = [...formData.industryLists];
    newIndustryLists[index] = value;
    setFormData((prev) => ({
      ...prev,
      industryLists: newIndustryLists,
    }));
  };

  const addIndustryList = () => {
    setFormData((prev) => ({
      ...prev,
      industryLists: [...prev.industryLists, ''],
    }));
  };

  const removeIndustryList = (index) => {
    if (formData.industryLists.length > 1) {
      const newIndustryLists = formData.industryLists.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        industryLists: newIndustryLists,
      }));
    }
  };

  // Handle usecase lists changes
  const handleUsecaseListChange = (index, value) => {
    const newUsercaseListes = [...formData.usercaseListes];
    newUsercaseListes[index] = value;
    setFormData((prev) => ({
      ...prev,
      usercaseListes: newUsercaseListes,
    }));
  };

  const addUsecaseList = () => {
    setFormData((prev) => ({
      ...prev,
      usercaseListes: [...prev.usercaseListes, ''],
    }));
  };

  const removeUsecaseList = (index) => {
    if (formData.usercaseListes.length > 1) {
      const newUsercaseListes = formData.usercaseListes.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        usercaseListes: newUsercaseListes,
      }));
    }
  };

  // Handle save
  const handleSave = () => {
    if (!formData.serviceName.trim()) {
      showError('Service name is required');
      return;
    }
    saveConfirmModal.onOpen();
  };

  // Handle save confirmation
  const handleSaveConfirm = async () => {
    try {
      setIsSaving(true);
      saveConfirmModal.onClose();

      const filteredServiceLists = formData.serviceLists.filter(
        (service) => service.title.trim() || service.description.trim()
      );

      const filteredMainApplicationLists = formData.mainApplicationLists.filter(
        (app) => app.title.trim() || app.description.trim()
      );

      // Filter interlink pages - keep groups that have heading or at least one page with data
      const filteredInterlinkPages = formData.interlinkPages
        .map((group) => {
          const filteredPages = group.interlink_pages.filter(
            (page) => page.slug.trim() || page.altername_skill_name.trim()
          );
          // Only include group if it has heading or has pages
          if (group.interlink_heading.trim() || filteredPages.length > 0) {
            return {
              ...group,
              interlink_pages: filteredPages.length > 0 ? filteredPages : [],
            };
          }
          return null;
        })
        .filter((group) => group !== null);

      const filteredIndustryLists = formData.industryLists.filter((industry) => industry.trim());
      const filteredUsercaseListes = formData.usercaseListes.filter((usecase) => usecase.trim());

      const submitData = {
        ...formData,
        serviceLists: filteredServiceLists,
        mainApplicationLists: filteredMainApplicationLists,
        interlinkPages: filteredInterlinkPages,
        industryLists: filteredIndustryLists.join(', '),
        usercaseListes: filteredUsercaseListes.join(', '),
      };

      await dispatch(updateWebsiteData({ id: id, data: submitData }));

      setIsEditing(false);
      fetchWebsiteData();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (originalData) {
      setFormData({
        categoryName: originalData.category_name || '',
        serviceName: originalData.service_name || '',
        slugLink: originalData.slug_link || '',
        primaryKeyword: originalData.primary_keyword || '',
        secondaryKeyword: originalData.secondary_keyword || '',
        bannerTitle: originalData.banner_title || '',
        bannerDescription: originalData.banner_description || '',
        serviceTitle: originalData.service_title || '',
        serviceDescription: originalData.service_description || '',
        serviceLists:
          originalData.service_lists && originalData.service_lists.length > 0
            ? originalData.service_lists
            : [{ title: '', description: '' }],
        industryTitle: originalData.industry_title || '',
        industryLists: originalData.industry_lists
          ? originalData.industry_lists.split(',').map((item) => item.trim())
          : [''],
        mainApplicationTitle: originalData.main_application_title || '',
        mainApplicationDescription: originalData.main_application_description || '',
        mainApplicationLists:
          originalData.main_application_lists && originalData.main_application_lists.length > 0
            ? originalData.main_application_lists
            : [{ title: '', description: '' }],
        interlinkPages:
          originalData.interlink_pages && originalData.interlink_pages.length > 0
            ? originalData.interlink_pages
            : [{ interlink_heading: '', interlink_pages: [{ slug: '', altername_skill_name: '' }] }],
        usercaseListes: originalData.usercase_listes
          ? originalData.usercase_listes.split(',').map((item) => item.trim())
          : [''],
        metaTitle: originalData.meta_title || '',
        metaDescription: originalData.meta_description || '',
      });
    }
    setIsEditing(false);
  };

  // Handle sync all
  const handleSyncAll = (fieldName, fieldValue) => {
    setSyncField(fieldName);
    setSyncValue(fieldValue);
    syncModal.onOpen();
  };

  // Handle sync confirmation
  const handleSyncConfirm = async () => {
    try {
      setIsSyncing(true);

      const payload = {
        fields: {
          [syncField]: syncValue,
        },
      };

      const response = await patchApi('admin/website-data/bulk-update', payload);

      if (response.data.success) {
        showSuccess(`Successfully synced ${response.data.data.updatedRecords} records`);
        fetchWebsiteData();
      } else {
        showError('Failed to sync data: ' + response.data.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      showError('Error syncing data: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSyncing(false);
      syncModal.onClose();
    }
  };

  if (isLoading && !originalData) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Box>
    );
  }

  if (!originalData) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Website data not found or failed to load.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Card mb="20px" bg={cardBg}>
        <Box p="24px">
          <Flex justify="space-between" align="center">
            <Box>
              <Text color={textColor} fontSize="2xl" fontWeight="700" mb="8px">
                Website Data Details
              </Text>
              <Text color="gray.400" fontSize="sm">
                ID: {id} | Service: {originalData.service_name || 'N/A'}
              </Text>
            </Box>
            <HStack spacing={2}>
              <Button
                leftIcon={<MdArrowBack />}
                variant="outline"
                onClick={() => navigate('/admin/website-data')}
              >
                Back to List
              </Button>
              {!isEditing ? (
                <Button
                  leftIcon={<MdEdit />}
                  colorScheme="brand"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <HStack spacing={2}>
                  <Button variant="outline" onClick={handleCancelEdit} isDisabled={isSaving}>
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<MdSave />}
                    colorScheme="brand"
                    onClick={handleSave}
                    isLoading={isSaving}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                </HStack>
              )}
            </HStack>
          </Flex>
        </Box>
      </Card>

      {/* Form Content - This is a very long form, so I'll create it in sections */}
      <Card bg={cardBg}>
        <Box p="24px">
          <VStack align="stretch" spacing={6}>
            {/* Basic Information */}
            <Box>
              <Text color={textColor} fontSize="lg" fontWeight="700" mb={4}>
                Basic Information
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Category Name</FormLabel>
                  <Input
                    value={formData.categoryName}
                    onChange={(e) => handleInputChange('categoryName', e.target.value)}
                    isDisabled={!isEditing}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Service Name</FormLabel>
                  <Input
                    value={formData.serviceName}
                    onChange={(e) => handleInputChange('serviceName', e.target.value)}
                    isDisabled={!isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Slug Link</FormLabel>
                  <Input
                    value={formData.slugLink}
                    onChange={(e) => handleInputChange('slugLink', e.target.value)}
                    isDisabled={!isEditing}
                    fontFamily="monospace"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Meta Title</FormLabel>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    isDisabled={!isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Primary Keyword</FormLabel>
                  <Input
                    value={formData.primaryKeyword}
                    onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
                    isDisabled={!isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Secondary Keywords</FormLabel>
                  <Input
                    value={formData.secondaryKeyword}
                    onChange={(e) => handleInputChange('secondaryKeyword', e.target.value)}
                    isDisabled={!isEditing}
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl mt={4}>
                <FormLabel fontSize="sm">Meta Description</FormLabel>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  isDisabled={!isEditing}
                  rows={3}
                />
              </FormControl>
            </Box>

            {/* Banner Section */}
            <Box>
              <Text color={textColor} fontSize="lg" fontWeight="700" mb={4}>
                Banner Information
              </Text>
              <FormControl>
                <FormLabel fontSize="sm">Banner Title</FormLabel>
                <Input
                  value={formData.bannerTitle}
                  onChange={(e) => handleInputChange('bannerTitle', e.target.value)}
                  isDisabled={!isEditing}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel fontSize="sm">Banner Description</FormLabel>
                <Textarea
                  value={formData.bannerDescription}
                  onChange={(e) => handleInputChange('bannerDescription', e.target.value)}
                  isDisabled={!isEditing}
                  rows={3}
                />
              </FormControl>
            </Box>

            {/* Service Section */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text color={textColor} fontSize="lg" fontWeight="700">
                  Service Information
                </Text>
                {isEditing && formData.serviceTitle && (
                  <Button
                    size="sm"
                    leftIcon={<MdSync />}
                    variant="outline"
                    onClick={() => handleSyncAll('service_title', formData.serviceTitle)}
                  >
                    Sync All
                  </Button>
                )}
              </Flex>
              <FormControl>
                <FormLabel fontSize="sm">Service Title</FormLabel>
                <Input
                  value={formData.serviceTitle}
                  onChange={(e) => handleInputChange('serviceTitle', e.target.value)}
                  isDisabled={!isEditing}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel fontSize="sm">Service Description</FormLabel>
                <Textarea
                  value={formData.serviceDescription}
                  onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                  isDisabled={!isEditing}
                  rows={3}
                />
              </FormControl>

              {/* Service Lists */}
              <Box mt={4}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="600">
                    Service Lists (Max 5)
                  </Text>
                  {isEditing && (
                    <Button
                      size="sm"
                      leftIcon={<MdAdd />}
                      onClick={addServiceList}
                      isDisabled={formData.serviceLists.length >= 5}
                    >
                      Add Service
                    </Button>
                  )}
                </Flex>
                <VStack align="stretch" spacing={3}>
                  {formData.serviceLists.map((service, index) => (
                    <Box
                      key={index}
                      p={4}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" fontWeight="500">
                          Service {index + 1}
                        </Text>
                        {isEditing && formData.serviceLists.length > 1 && (
                          <IconButton
                            aria-label="Remove service"
                            icon={<MdRemove />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeServiceList(index)}
                          />
                        )}
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Title</FormLabel>
                          <Input
                            value={service.title}
                            onChange={(e) => handleServiceListChange(index, 'title', e.target.value)}
                            isDisabled={!isEditing}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Description</FormLabel>
                          <Textarea
                            value={service.description}
                            onChange={(e) =>
                              handleServiceListChange(index, 'description', e.target.value)
                            }
                            isDisabled={!isEditing}
                            size="sm"
                            rows={2}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>

            {/* Industry Section */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text color={textColor} fontSize="lg" fontWeight="700">
                  Industry Information
                </Text>
                {isEditing && formData.industryTitle && (
                  <Button
                    size="sm"
                    leftIcon={<MdSync />}
                    variant="outline"
                    onClick={() => handleSyncAll('industry_title', formData.industryTitle)}
                  >
                    Sync All
                  </Button>
                )}
              </Flex>
              <FormControl>
                <FormLabel fontSize="sm">Industry Title</FormLabel>
                <Input
                  value={formData.industryTitle}
                  onChange={(e) => handleInputChange('industryTitle', e.target.value)}
                  isDisabled={!isEditing}
                />
              </FormControl>
              <Box mt={4}>
                <Text fontSize="sm" fontWeight="600" mb={2}>
                  Industry Lists
                </Text>
                <VStack align="stretch" spacing={2}>
                  {formData.industryLists.map((industry, index) => (
                    <HStack key={index}>
                      <Input
                        value={industry}
                        onChange={(e) => handleIndustryListChange(index, e.target.value)}
                        isDisabled={!isEditing}
                        size="sm"
                        placeholder={`Industry ${index + 1}`}
                      />
                      {isEditing && formData.industryLists.length > 1 && (
                        <IconButton
                          aria-label="Remove industry"
                          icon={<MdRemove />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeIndustryList(index)}
                        />
                      )}
                    </HStack>
                  ))}
                  {isEditing && (
                    <Button size="sm" leftIcon={<MdAdd />} onClick={addIndustryList} variant="outline">
                      Add Industry
                    </Button>
                  )}
                </VStack>
              </Box>
            </Box>

            {/* Main Application Section */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text color={textColor} fontSize="lg" fontWeight="700">
                  Main Application
                </Text>
                {isEditing && formData.mainApplicationTitle && (
                  <Button
                    size="sm"
                    leftIcon={<MdSync />}
                    variant="outline"
                    onClick={() =>
                      handleSyncAll('main_application_title', formData.mainApplicationTitle)
                    }
                  >
                    Sync All
                  </Button>
                )}
              </Flex>
              <FormControl>
                <FormLabel fontSize="sm">Main Application Title</FormLabel>
                <Input
                  value={formData.mainApplicationTitle}
                  onChange={(e) => handleInputChange('mainApplicationTitle', e.target.value)}
                  isDisabled={!isEditing}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel fontSize="sm">Main Application Description</FormLabel>
                <Textarea
                  value={formData.mainApplicationDescription}
                  onChange={(e) => handleInputChange('mainApplicationDescription', e.target.value)}
                  isDisabled={!isEditing}
                  rows={3}
                />
              </FormControl>

              {/* Main Application Lists */}
              <Box mt={4}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="600">
                    Main Application Lists (Max 5)
                  </Text>
                  {isEditing && (
                    <Button
                      size="sm"
                      leftIcon={<MdAdd />}
                      onClick={addMainApplication}
                      isDisabled={formData.mainApplicationLists.length >= 5}
                    >
                      Add Application
                    </Button>
                  )}
                </Flex>
                <VStack align="stretch" spacing={3}>
                  {formData.mainApplicationLists.map((app, index) => (
                    <Box
                      key={index}
                      p={4}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" fontWeight="500">
                          Application {index + 1}
                        </Text>
                        {isEditing && formData.mainApplicationLists.length > 1 && (
                          <IconButton
                            aria-label="Remove application"
                            icon={<MdRemove />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeMainApplication(index)}
                          />
                        )}
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Title</FormLabel>
                          <Input
                            value={app.title}
                            onChange={(e) => handleMainApplicationChange(index, 'title', e.target.value)}
                            isDisabled={!isEditing}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Description</FormLabel>
                          <Textarea
                            value={app.description}
                            onChange={(e) =>
                              handleMainApplicationChange(index, 'description', e.target.value)
                            }
                            isDisabled={!isEditing}
                            size="sm"
                            rows={2}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>

            {/* Use Case Lists */}
            <Box>
              <Text color={textColor} fontSize="lg" fontWeight="700" mb={4}>
                Use Case Lists
              </Text>
              <VStack align="stretch" spacing={2}>
                {formData.usercaseListes.map((usecase, index) => (
                  <HStack key={index}>
                    <Input
                      value={usecase}
                      onChange={(e) => handleUsecaseListChange(index, e.target.value)}
                      isDisabled={!isEditing}
                      size="sm"
                      placeholder={`Use Case ${index + 1}`}
                    />
                    {isEditing && formData.usercaseListes.length > 1 && (
                      <IconButton
                        aria-label="Remove use case"
                        icon={<MdRemove />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeUsecaseList(index)}
                      />
                    )}
                  </HStack>
                ))}
                {isEditing && (
                  <Button size="sm" leftIcon={<MdAdd />} onClick={addUsecaseList} variant="outline">
                    Add Use Case
                  </Button>
                )}
              </VStack>
            </Box>

            {/* Interlink Pages */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text color={textColor} fontSize="lg" fontWeight="700">
                  Interlink Pages
                </Text>
                {isEditing && (
                  <Button size="sm" leftIcon={<MdAdd />} onClick={addInterlinkGroup}>
                    Add Group
                  </Button>
                )}
              </Flex>
              <VStack align="stretch" spacing={4}>
                {formData.interlinkPages.map((group, groupIndex) => (
                  <Box
                    key={groupIndex}
                    p={4}
                    border="2px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={groupBg}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <FormControl flex="1" mr={2}>
                        <FormLabel fontSize="sm" fontWeight="600">
                          Group {groupIndex + 1} - Heading
                        </FormLabel>
                        <Input
                          value={group.interlink_heading}
                          onChange={(e) =>
                            handleInterlinkGroupHeadingChange(groupIndex, e.target.value)
                          }
                          isDisabled={!isEditing}
                          placeholder="Enter interlink heading (e.g., Industrial Automation & Manufacturing Industry Skills)"
                          size="sm"
                        />
                      </FormControl>
                      {isEditing && formData.interlinkPages.length > 1 && (
                        <IconButton
                          aria-label="Remove interlink group"
                          icon={<MdRemove />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeInterlinkGroup(groupIndex)}
                          mt={6}
                        />
                      )}
                    </Flex>
                    <VStack align="stretch" spacing={2} mt={3}>
                      {group.interlink_pages.map((page, pageIndex) => (
                        <Box
                          key={pageIndex}
                          p={3}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          bg={cardBg}
                        >
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontSize="xs" fontWeight="500" color="gray.500">
                              Page {pageIndex + 1}
                            </Text>
                            {isEditing && group.interlink_pages.length > 1 && (
                              <IconButton
                                aria-label="Remove page"
                                icon={<MdRemove />}
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeInterlinkPageFromGroup(groupIndex, pageIndex)}
                              />
                            )}
                          </Flex>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                            <FormControl>
                              <FormLabel fontSize="xs">Slug</FormLabel>
                              <Input
                                value={page.slug}
                                onChange={(e) =>
                                  handleInterlinkPageChange(groupIndex, pageIndex, 'slug', e.target.value)
                                }
                                isDisabled={!isEditing}
                                size="sm"
                                fontFamily="monospace"
                                placeholder="/engineering/plc-programmer"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs">Alternate Skill Name</FormLabel>
                              <Input
                                value={page.altername_skill_name}
                                onChange={(e) =>
                                  handleInterlinkPageChange(
                                    groupIndex,
                                    pageIndex,
                                    'altername_skill_name',
                                    e.target.value
                                  )
                                }
                                isDisabled={!isEditing}
                                size="sm"
                                placeholder="PLC Programmer"
                              />
                            </FormControl>
                          </SimpleGrid>
                        </Box>
                      ))}
                      {isEditing && (
                        <Button
                          size="xs"
                          leftIcon={<MdAdd />}
                          onClick={() => addInterlinkPageToGroup(groupIndex)}
                          variant="outline"
                          colorScheme="brand"
                        >
                          Add Page to Group
                        </Button>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Card>

      {/* Save Confirmation Modal */}
      <Modal isOpen={saveConfirmModal.isOpen} onClose={saveConfirmModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Save Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>WARNING: This action will update the record!</AlertTitle>
                <AlertDescription>
                  <Text fontSize="sm" mt={2}>
                    <strong>Service:</strong> {formData.serviceName || 'N/A'}
                  </Text>
                  <Text fontSize="sm" mt={1}>
                    This will update the website data record with all your changes and cannot be undone.
                  </Text>
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={saveConfirmModal.onClose} isDisabled={isSaving}>
              No, Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSaveConfirm}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Yes, Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sync Confirmation Modal */}
      <Modal isOpen={syncModal.isOpen} onClose={syncModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Sync All</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>WARNING: This action will update ALL records!</AlertTitle>
                <AlertDescription>
                  <Text fontSize="sm" mt={2}>
                    <strong>Field:</strong> {syncField}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Value:</strong> {syncValue}
                  </Text>
                  <Text fontSize="sm" mt={1}>
                    This action cannot be undone and will affect all website data records.
                  </Text>
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={syncModal.onClose} isDisabled={isSyncing}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSyncConfirm}
              isLoading={isSyncing}
              loadingText="Syncing..."
            >
              Sync All Records
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


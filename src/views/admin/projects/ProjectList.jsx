import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  useColorModeValue,
  Spinner,
  HStack,
  Tooltip,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Radio,
  RadioGroup,
  Stack,
  SimpleGrid,
  FormHelperText,
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight, MdEdit, MdVisibility, MdContentCopy } from 'react-icons/md';
import { projectData, updateProjectStatus, updateProject } from '../../../features/admin/projectManagementSlice';
import { 
  fetchCategories, 
  fetchSubcategories, 
  fetchTechnologies, 
  fetchIndustries,
  clearSubcategories 
} from '../../../features/admin/dropdownDataSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import { copyToClipboard } from '../../../utils/utils';

export default function ProjectList() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const statusModal = useDisclosure();
  const editModal = useDisclosure();
  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const [pageLimit, setPageLimit] = useState(50);

  // Get dropdown data from Redux store
  const dropdownData = useSelector((state) => state.dropdownDataReducer);
  const categories = dropdownData?.categories || [];
  const subcategories = dropdownData?.subcategories || [];
  const technologies = dropdownData?.technologies || [];
  const industries = dropdownData?.industries || [];

  // Form data state
  const [formData, setFormData] = useState({
    project_category: '',
    project_sub_category: '',
    project_title: '',
    technologty_pre: '',
    model_engagement: 'hourly',
    project_amount_min: '',
    project_amount_max: '',
    project_duration_min: '',
    project_duration_max: '',
    notice_period_min: '',
    notice_period_max: '',
    project_summary: '',
    type_of_project: 'maintainance',
    customer_industry: '',
    currency_type: 'USD',
    currency_symbol: '$',
    location_preferancer: ''
  });

  const { isLoading: reduxLoading, responseData } = useSelector((s) => s.projectDataReducer || {});

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const modalBg = useColorModeValue('white', 'navy.800');
  const inputBg = useColorModeValue('white', 'navy.700');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(projectData({
        page: currentPage,
        limit: pageLimit
      }));
      
      if (response.payload?.data?.data?.projects) {
        setProjects(response.payload.data.data.projects);
        setTotalCount(response.payload.data.data.total_count || 0);
      } else if (response.payload?.data?.projects) {
        setProjects(response.payload.data.projects);
        setTotalCount(response.payload.data.total_count || 0);
      } else if (response.payload?.projects) {
        setProjects(response.payload.projects);
        setTotalCount(response.payload.total_count || 0);
      } else {
        setProjects([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showError('Failed to fetch projects');
      setProjects([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  // Fetch dropdown data when edit modal opens
  useEffect(() => {
    if (editModal.isOpen) {
      dispatch(fetchCategories());
      dispatch(fetchTechnologies());
      dispatch(fetchIndustries());
    }
  }, [dispatch, editModal.isOpen]);

  // Handle form pre-filling when dropdown data is loaded
  useEffect(() => {
    if (editModal.isOpen && selectedProject && categories.length > 0 && technologies.length > 0 && industries.length > 0) {
      // Map model_engagement string values
      let pricingModel = selectedProject.model_engagement || 'hourly';
      
      // Map type_of_project string values
      let projectType = selectedProject.type_of_project || 'maintainance';
      
      const updatedFormData = {
        project_category: selectedProject.project_category || '',
        project_sub_category: selectedProject.project_sub_category || '',
        project_title: selectedProject.project_title || '',
        technologty_pre: selectedProject.technologty_pre || '',
        model_engagement: pricingModel,
        project_amount_min: selectedProject.project_amount_min || selectedProject.project_amount || '',
        project_amount_max: selectedProject.project_amount_max || selectedProject.project_amount || '',
        project_duration_min: selectedProject.project_duration_min || '',
        project_duration_max: selectedProject.project_duration_max || '',
        notice_period_min: selectedProject.notice_period_min || '',
        notice_period_max: selectedProject.notice_period_max || '',
        project_summary: selectedProject.project_summary || '',
        type_of_project: projectType,
        customer_industry: selectedProject.customer_industry || '',
        currency_type: selectedProject.currency_type || 'USD',
        currency_symbol: selectedProject.currency_symbol || '$',
        location_preferancer: selectedProject.location_preferancer || ''
      };
      
      setFormData(updatedFormData);
    }
  }, [editModal.isOpen, selectedProject, categories, technologies, industries]);

  // Handle subcategories when they're loaded
  useEffect(() => {
    if (editModal.isOpen && selectedProject && subcategories.length > 0) {
      setFormData(prev => ({
        ...prev,
        project_sub_category: selectedProject.project_sub_category || ''
      }));
    }
  }, [editModal.isOpen, selectedProject, subcategories]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenStatusModal = (project) => {
    setSelectedProject(project);
    // Map status number to status text
    const statusMap = { 1: 'Pending', 2: 'Approved', 3: 'Rejected' };
    const currentStatus = project?.status ? statusMap[Number(project.status)] || 'Pending' : 'Pending';
    setSelectedStatus(currentStatus);
    statusModal.onOpen();
  };

  const handleCloseStatusModal = () => {
    statusModal.onClose();
    setSelectedProject(null);
    setSelectedStatus('');
  };

  const handleStatusChange = async () => {
    if (!selectedProject) return;
    
    try {
      // Map status text to status number
      const statusMap = { 'Pending': 1, 'Approved': 2, 'Rejected': 3 };
      const newStatus = statusMap[selectedStatus] || 1;
      
      await dispatch(updateProjectStatus({
        projectId: selectedProject.id,
        status: newStatus
      }));
      
      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === selectedProject.id
            ? { ...project, status: newStatus }
            : project
        )
      );
      
      showSuccess('Project status updated successfully');
      handleCloseStatusModal();
      fetchProjects(); // Refresh the list
    } catch (error) {
      showError('Failed to update project status');
    }
  };

  // Edit Modal handlers
  const handleEditClick = (project) => {
    setSelectedProject(project);
    
    // Map model_engagement string values
    let pricingModel = project.model_engagement || 'hourly';
    
    // Map type_of_project string values
    let projectType = project.type_of_project || 'maintainance';
    
    setFormData({
      project_category: project.project_category || '',
      project_sub_category: project.project_sub_category || '',
      project_title: project.project_title || '',
      technologty_pre: project.technologty_pre || '',
      model_engagement: pricingModel,
      project_amount_min: project.project_amount_min || project.project_amount || '',
      project_amount_max: project.project_amount_max || project.project_amount || '',
      project_duration_min: project.project_duration_min || '',
      project_duration_max: project.project_duration_max || '',
      notice_period_min: project.notice_period_min || '',
      notice_period_max: project.notice_period_max || '',
      project_summary: project.project_summary || '',
      type_of_project: projectType,
      customer_industry: project.customer_industry || '',
      currency_type: project.currency_type || 'USD',
      currency_symbol: project.currency_symbol || '$',
      location_preferancer: project.location_preferancer || ''
    });
    
    editModal.onOpen();
    
    // Fetch subcategories if category is selected
    if (project.project_category) {
      dispatch(fetchSubcategories(project.project_category));
    }
  };

  const handleCloseEditModal = () => {
    editModal.onClose();
    setSelectedProject(null);
    setFormData({
      project_category: '',
      project_sub_category: '',
      project_title: '',
      technologty_pre: '',
      model_engagement: 'hourly',
      project_amount_min: '',
      project_amount_max: '',
      project_duration_min: '',
      project_duration_max: '',
      notice_period_min: '',
      notice_period_max: '',
      project_summary: '',
      type_of_project: 'maintainance',
      customer_industry: '',
      currency_type: 'USD',
      currency_symbol: '$',
      location_preferancer: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePricingModelChange = (value) => {
    setFormData(prev => ({
      ...prev,
      model_engagement: value,
      // Reset related fields when pricing model changes
      project_amount_min: '',
      project_amount_max: '',
      project_duration_min: '',
      project_duration_max: '',
      notice_period_min: '',
      notice_period_max: ''
    }));
  };

  const handleCategoryChange = (categoryId) => {
    handleInputChange('project_category', categoryId);
    handleInputChange('project_sub_category', ''); // Reset subcategory
    dispatch(clearSubcategories()); // Clear existing subcategories
    if (categoryId) {
      dispatch(fetchSubcategories(categoryId));
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedProject) return;

    setIsSaving(true);

    try {
      // Map form data to API format
      const updateData = {
        posted_by_user_id: selectedProject.posted_by_user_id,
        project_title: formData.project_title,
        project_category: formData.project_category,
        project_sub_category: formData.project_sub_category,
        project_summary: formData.project_summary,
        type_of_project: formData.type_of_project,
        project_duration_min: formData.project_duration_min,
        project_duration_max: formData.project_duration_max,
        customer_industry: formData.customer_industry,
        technologty_pre: formData.technologty_pre,
        notice_period: selectedProject.notice_period || "0",
        notice_period_min: formData.notice_period_min,
        notice_period_max: formData.notice_period_max,
        sales_amount: selectedProject.sales_amount || "0",
        sales_amount_to: selectedProject.sales_amount_to || "0",
        project_amount: formData.project_amount_min,
        project_amount_min: formData.project_amount_min,
        project_amount_max: formData.project_amount_max,
        project_amount_to: formData.project_amount_max,
        model_engagement: formData.model_engagement,
        currency_type: formData.currency_type,
        currency_symbol: formData.currency_symbol,
        location_preferancer: formData.location_preferancer,
        status: selectedProject.status
      };

      await dispatch(updateProject({
        projectId: selectedProject.id,
        projectData: updateData
      }));

      showSuccess('Project updated successfully');
      handleCloseEditModal();
      fetchProjects();
      
    } catch (error) {
      console.error('Error updating project:', error);
      showError('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const getPricingModelName = (model) => {
    if (model === null || model === undefined) return '--';
    const text = String(model).trim().toLowerCase();
    if (!text) return '--';
    if (text === 'hourly') return 'Hourly';
    if (text === 'retainer') return 'Retainership';
    if (text === 'fixed') return 'Fixed Price';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const getProjectStatusText = (project) => {
    const raw = project?.status;
    const code = Number(raw);
    if (!Number.isNaN(code)) {
      switch (code) {
        case 1:
          return 'Pending';
        case 2:
          return 'Approved';
        case 3:
          return 'Rejected';
        default:
          return 'Pending';
      }
    }
    return 'Pending';
  };

  const getStatusColorScheme = (statusText) => {
    const statusLower = (statusText || '').toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'approved':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'rejected':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  // Get dynamic labels based on pricing model
  const getRateLabel = () => {
    switch (formData.model_engagement) {
      case 'hourly':
        return 'Rate Per Hour';
      case 'retainer':
        return 'Rate Per Month';
      case 'fixed':
        return 'Total Project Amount';
      default:
        return 'Rate';
    }
  };

  const getDurationLabel = () => {
    switch (formData.model_engagement) {
      case 'hourly':
        return 'Contract Duration (In Hours)';
      case 'fixed':
        return 'Contract Duration (In Days)';
      default:
        return 'Contract Duration';
    }
  };

  const handleCopyLink = async (link) => {
    if (!link) {
      showError('No link available to copy');
      return;
    }
    try {
      await copyToClipboard(link);
      showSuccess('Project link copied to clipboard');
    } catch (error) {
      showError('Failed to copy link');
    }
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text
            color={textColor}
            fontSize="l"
            fontWeight="700"
            mb="8px"
          >
            Projects
          </Text>

          {isLoading && projects.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                h={{ base: 'calc(100vh - 160px)', md: 'calc(100vh - 130px)', xl: 'calc(100vh - 130px)' }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="1000px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Project Title
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        First Name
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Last Name
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        bg={bgColor}
                      >
                        Email
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Pricing Model
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Status
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Action
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="capitalize"
                        textAlign="center"
                        bg={bgColor}
                      >
                        Copy Link
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {projects.length === 0 ? (
                      <Tr>
                        <Td colSpan={8} textAlign="center" py="40px">
                          <Text color="black">No projects found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      projects.map((project, index) => {
                        const statusText = getProjectStatusText(project);
                        const statusColors = getStatusColorScheme(statusText);
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;
                        return (
                          <Tr
                            key={project.id}
                            bg={isOddRow ? '#F4F7FE' : 'transparent'}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.project_title || '--'} 
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.User?.first_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.User?.last_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.User?.email || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm">
                                {getPricingModelName(project.model_engagement ?? project.pricing_model)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Button
                                size="sm"
                                bg={statusColors.bg}
                                color={statusColors.color}
                                borderColor={statusColors.border}
                                borderWidth="2px"
                                borderRadius="full"
                                fontWeight="normal"
                                fontSize="xs"
                                textTransform="capitalize"
                                _hover={{
                                  opacity: 0.8,
                                  transform: 'translateY(-2px)',
                                }}
                                onClick={() => handleOpenStatusModal(project)}
                              >
                                {statusText}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Tooltip label="Edit Project">
                                <IconButton
                                  aria-label="Edit project"
                                  icon={<MdEdit />}
                                  size="sm"
                                  variant="ghost"
                                  style={{color: 'rgb(32, 33, 36)'}}
                                  onClick={() => handleEditClick(project)}
                                />
                              </Tooltip>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              {project.created_by_admin && project.client_project_link ? (
                                <Tooltip label="Copy project link">
                                  <Button
                                    size="sm"
                                    leftIcon={<MdContentCopy />}
                                    variant="outline"
                                    colorScheme="brand"
                                    onClick={() => handleCopyLink(project.client_project_link)}
                                  >
                                    Copy link
                                  </Button>
                                </Tooltip>
                              ) : (
                                <Text color="gray.400" fontSize="sm">--</Text>
                              )}
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex
                justify="space-between"
                align="center"
                pt="8px"
                borderTop="1px solid"
                borderColor={borderColor}
                flexWrap="wrap"
                gap="8px"
              >
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">
                      {projects.length}
                    </Text> of {totalCount}
                  </Text>
                  <HStack spacing="8px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                    <Select
                      size="sm"
                      w="80px"
                      value={pageLimit}
                      onChange={(e) => {
                        setPageLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'brand.500' }}
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={300}>300</option>
                    </Select>
                  </HStack>
                </HStack>
                
                <HStack spacing="8px">
                  <IconButton
                    aria-label="Previous page"
                    icon={<MdChevronLeft />}
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    variant="outline"
                  />
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((page) => (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? 'solid' : 'outline'}
                        colorScheme={currentPage === page ? 'brand' : 'gray'}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  
                  <IconButton
                    aria-label="Next page"
                    icon={<MdChevronRight />}
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    variant="outline"
                  />
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Card>

      {/* Status Change Modal */}
      <Modal isOpen={statusModal.isOpen} onClose={handleCloseStatusModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader>Select Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {statusOptions.map((status) => (
              <Box key={status} mb="12px">
                <Checkbox
                  isChecked={selectedStatus === status}
                  onChange={() => setSelectedStatus(status)}
                  colorScheme="brand"
                >
                  <Text ml="8px" fontSize="sm" fontWeight="500">
                    {status}
                  </Text>
                </Checkbox>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseStatusModal}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleStatusChange}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Project Modal */}
      <Modal 
        isOpen={editModal.isOpen} 
        onClose={handleCloseEditModal} 
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent bg={modalBg} maxW="800px">
          <ModalHeader borderBottomWidth="1px">Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Stack spacing={5}>
              {/* Project Category */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Project Category</FormLabel>
                <Select
                  placeholder="Select Category"
                  value={formData.project_category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  bg={inputBg}
                >
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading categories...</option>
                  )}
                </Select>
              </FormControl>

              {/* Project Sub Category */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Project Sub Category</FormLabel>
                <Select
                  placeholder={formData.project_category ? "Select Sub Category" : "Select a category first"}
                  value={formData.project_sub_category}
                  onChange={(e) => handleInputChange('project_sub_category', e.target.value)}
                  isDisabled={!formData.project_category}
                  bg={inputBg}
                >
                  {Array.isArray(subcategories) && subcategories.length > 0 ? (
                    subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      {formData.project_category ? 'Loading subcategories...' : 'Select a category first'}
                    </option>
                  )}
                </Select>
              </FormControl>

              {/* Project Title & Technology in a row */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm">Project Title</FormLabel>
                  <Input
                    placeholder="Enter project title"
                    value={formData.project_title}
                    onChange={(e) => handleInputChange('project_title', e.target.value)}
                    bg={inputBg}
                  />
                  {formData.project_title && formData.project_title.length < 20 && (
                    <FormHelperText color="red.500" fontSize="xs">
                      Please enter more than 20 characters
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm">Technology Preference</FormLabel>
                  <Select
                    placeholder="Select Technology"
                    value={formData.technologty_pre}
                    onChange={(e) => handleInputChange('technologty_pre', e.target.value)}
                    bg={inputBg}
                  >
                    {Array.isArray(technologies) && technologies.length > 0 ? (
                      technologies.map((tech, index) => (
                        <option key={index} value={typeof tech === 'string' ? tech : tech.name}>
                          {typeof tech === 'string' ? tech : tech.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading technologies...</option>
                    )}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Pricing Model */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Pricing Model</FormLabel>
                <RadioGroup
                  value={formData.model_engagement}
                  onChange={handlePricingModelChange}
                >
                  <Stack direction="row" spacing={6}>
                    <Radio value="hourly" colorScheme="brand">Hourly</Radio>
                    <Radio value="retainer" colorScheme="brand">Retainership</Radio>
                    <Radio value="fixed" colorScheme="brand">Fixed Price</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Dynamic Rate Fields based on Pricing Model */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">{getRateLabel()}</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.project_amount_min}
                    onChange={(e) => handleInputChange('project_amount_min', e.target.value)}
                    bg={inputBg}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.project_amount_max}
                    onChange={(e) => handleInputChange('project_amount_max', e.target.value)}
                    bg={inputBg}
                  />
                  <Select
                    value={formData.currency_type}
                    onChange={(e) => {
                      const currency = e.target.value;
                      const symbol = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '€';
                      handleInputChange('currency_type', currency);
                      handleInputChange('currency_symbol', symbol);
                    }}
                    bg={inputBg}
                  >
                    <option value="USD">USD - $</option>
                    <option value="INR">INR - ₹</option>
                    <option value="EUR">EUR - €</option>
                  </Select>
                </SimpleGrid>
                {parseFloat(formData.project_amount_min) > parseFloat(formData.project_amount_max) && 
                 formData.project_amount_min && formData.project_amount_max && (
                  <FormHelperText color="red.500" fontSize="xs">
                    Max amount must be greater than {formData.project_amount_min}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Contract Duration - Show for Hourly and Fixed Price */}
              {(formData.model_engagement === 'hourly' || formData.model_engagement === 'fixed') && (
                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm">{getDurationLabel()}</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.project_duration_min}
                      onChange={(e) => handleInputChange('project_duration_min', e.target.value)}
                      bg={inputBg}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.project_duration_max}
                      onChange={(e) => handleInputChange('project_duration_max', e.target.value)}
                      bg={inputBg}
                    />
                  </SimpleGrid>
                  {parseFloat(formData.project_duration_min) > parseFloat(formData.project_duration_max) && 
                   formData.project_duration_min && formData.project_duration_max && (
                    <FormHelperText color="red.500" fontSize="xs">
                      Max duration must be greater than {formData.project_duration_min}
                    </FormHelperText>
                  )}
                </FormControl>
              )}

              {/* Notice Period - Show only for Retainership */}
              {formData.model_engagement === 'retainer' && (
                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm">Notice Period (In Days)</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.notice_period_min}
                      onChange={(e) => handleInputChange('notice_period_min', e.target.value)}
                      bg={inputBg}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.notice_period_max}
                      onChange={(e) => handleInputChange('notice_period_max', e.target.value)}
                      bg={inputBg}
                    />
                  </SimpleGrid>
                  {parseFloat(formData.notice_period_min) > parseFloat(formData.notice_period_max) && 
                   formData.notice_period_min && formData.notice_period_max && (
                    <FormHelperText color="red.500" fontSize="xs">
                      Max notice period must be greater than {formData.notice_period_min}
                    </FormHelperText>
                  )}
                </FormControl>
              )}

              {/* Project Summary */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">
                  Project Summary 
                  {formData.model_engagement === 'retainer' && (
                    <Text as="span" color="gray.500" fontWeight="normal" fontSize="xs" ml={2}>
                      (Optional for Retainership)
                    </Text>
                  )}
                </FormLabel>
                <Textarea
                  placeholder="Enter project summary"
                  value={formData.project_summary}
                  onChange={(e) => handleInputChange('project_summary', e.target.value)}
                  rows={4}
                  maxLength={300}
                  bg={inputBg}
                />
                <Flex justify="space-between" mt={1}>
                  <Box>
                    {formData.model_engagement !== 'retainer' && 
                     formData.project_summary && 
                     formData.project_summary.length < 100 && (
                      <FormHelperText color="red.500" fontSize="xs" mt={0}>
                        Minimum 100 characters required
                      </FormHelperText>
                    )}
                  </Box>
                  <Text fontSize="xs" color="gray.500">
                    {formData.project_summary?.length || 0}/300 characters
                  </Text>
                </Flex>
              </FormControl>

              {/* Type of Project */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Type of Project</FormLabel>
                <RadioGroup
                  value={formData.type_of_project}
                  onChange={(value) => handleInputChange('type_of_project', value)}
                >
                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Radio value="maintainance" colorScheme="brand">Maintenance</Radio>
                    <Radio value="new-development" colorScheme="brand">New Development</Radio>
                    <Radio value="maintainance-cum-new-development" colorScheme="brand">Maintenance Cum New Development</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Customer Industry */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Customer Industry</FormLabel>
                <Select
                  placeholder="Select Industry"
                  value={formData.customer_industry}
                  onChange={(e) => handleInputChange('customer_industry', e.target.value)}
                  bg={inputBg}
                >
                  {Array.isArray(industries) && industries.length > 0 ? (
                    industries.map((industry) => (
                      <option key={industry.id} value={industry.id}>
                        {industry.industry}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading industries...</option>
                  )}
                </Select>
              </FormControl>

              {/* Location Preference */}
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm">Location Preference</FormLabel>
                <RadioGroup
                  value={formData.location_preferancer}
                  onChange={(value) => handleInputChange('location_preferancer', value)}
                >
                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Radio value="city" colorScheme="brand">Anywhere in the City</Radio>
                    <Radio value="country" colorScheme="brand">Anywhere in the Country</Radio>
                    <Radio value="globaly" colorScheme="brand">Anywhere Globally</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px">
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={handleCloseEditModal}
              isDisabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleSaveChanges}
              isLoading={isSaving}
              loadingText="Updating..."
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

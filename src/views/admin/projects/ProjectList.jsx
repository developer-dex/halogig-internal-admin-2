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
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight, MdEdit, MdVisibility } from 'react-icons/md';
import { projectData, updateProjectStatus } from '../../../features/admin/projectManagementSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';

export default function ProjectList() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusModal = useDisclosure();
  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const pageLimit = 50;

  const { isLoading: reduxLoading, responseData } = useSelector((s) => s.projectDataReducer || {});

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    const bgColor = useColorModeValue('#F4F7FE', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenStatusModal = (project) => {
    setSelectedProject(project);
    setSelectedStatus(project.approved_by_admin ? 'Approved' : 'Pending');
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
      const newApprovedStatus = selectedStatus === 'Approved';
      
      await dispatch(updateProjectStatus({
        projectId: selectedProject.id,
        currentApprovedStatus: selectedProject.approved_by_admin || false
      }));
      
      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === selectedProject.id
            ? { ...project, approved_by_admin: newApprovedStatus }
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

  const getPricingModelName = (model) => {
    if (model === null || model === undefined) return '--';
    const numeric = Number(model);
    if (!Number.isNaN(numeric)) {
      switch (numeric) {
        case 1:
          return 'Fixed Price';
        case 2:
          return 'Hourly';
        case 3:
          return 'Milestone';
        default:
          return String(model);
      }
    }
    const text = String(model).trim();
    if (!text) return '--';
    const l = text.toLowerCase();
    if (l.includes('fixed')) return 'Fixed Price';
    if (l.includes('hour')) return 'Hourly';
    if (l.includes('mile')) return 'Milestone';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const getProjectStatusText = (project) => {
    if (project?.approved_by_admin) return 'Approved';
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
          return String(raw);
      }
    }
    const s = typeof raw === 'string' ? raw : '';
    if (!s) return 'Pending';
    return s.charAt(0).toUpperCase() + s.slice(1);
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

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Text
            color={textColor}
            fontSize="2xl"
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
                maxH={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 130px)', xl: 'calc(100vh - 130px)' }}
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
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        PROJECT TITLE
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        FIRST NAME
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        LAST NAME
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        EMAIL
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        textAlign="center"
                        bg={bgColor}
                      >
                        PRICING MODEL
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        textAlign="center"
                        bg={bgColor}
                      >
                        STATUS
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        textAlign="center"
                        bg={bgColor}
                      >
                        PROJECT LINK
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        textAlign="center"
                        bg={bgColor}
                      >
                        ACTION
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
                      projects.map((project) => {
                        const statusText = getProjectStatusText(project);
                        const statusColors = getStatusColorScheme(statusText);
                        return (
                          <Tr
                            key={project.id}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.project_title || '--'} 
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.User?.first_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.User?.last_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {project.User?.email || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Text color={textColor} fontSize="sm">
                                {getPricingModelName(project.model_engagement ?? project.pricing_model)}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
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
                            <Td borderColor={borderColor} textAlign="center">
                              {project.project_link ? (
                                <Tooltip label={project.project_link}>
                                  <Text
                                    fontSize="xs"
                                    color="black"
                                    cursor="pointer"
                                    textDecoration="underline"
                                    onClick={() => window.open(project.project_link, '_blank')}
                                  >
                                    View Link
                                  </Text>
                                </Tooltip>
                              ) : (
                                <Text color="black">--</Text>
                              )}
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Tooltip label="Edit Project">
                                <IconButton
                                  aria-label="Edit project"
                                  icon={<MdEdit />}
                                  size="sm"
                                  variant="ghost"
                                  style={{color: 'rgb(32, 33, 36)'}}
                                  onClick={() => {
                                    // TODO: Open edit modal
                                    console.log('Edit project:', project.id);
                                  }}
                                />
                              </Tooltip>
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
                // mt="8px"
                pt="8px"
                borderTop="1px solid"
                borderColor={borderColor}
              >
                <Text color="black" fontSize="sm">
                  Showing <Text as="span" fontWeight="700" color="brand.500">
                    {projects.length}
                  </Text> of {totalCount}
                </Text>
                
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
        <ModalContent>
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
    </Box>
  );
}


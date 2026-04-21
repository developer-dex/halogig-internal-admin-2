import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { MdChevronLeft, MdChevronRight, MdEdit, MdContentCopy } from 'react-icons/md';
import { projectData, updateProjectStatus } from '../../../features/admin/projectManagementSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import { copyToClipboard } from '../../../utils/utils';

export default function ProjectList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusModal = useDisclosure();
  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const [pageLimit, setPageLimit] = useState(50);
  const isOfflineProjectView = location.pathname.includes('/offline-projects');

  const { isLoading: reduxLoading, responseData } = useSelector((s) => s.projectDataReducer || {});

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const modalBg = useColorModeValue('white', 'navy.800');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(projectData({
        page: currentPage,
        limit: pageLimit,
        byAdmin: isOfflineProjectView,
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
  }, [currentPage, pageLimit, isOfflineProjectView]);

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

  const handleEditClick = (project) => {
    navigate(`/admin/update-client-project/${project.id}`, {
      state: { returnPath: location.pathname },
    });
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
                                  style={{ color: 'rgb(32, 33, 36)' }}
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
    </Box>
  );
}

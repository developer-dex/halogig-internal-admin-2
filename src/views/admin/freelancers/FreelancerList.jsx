import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Badge,
  useColorModeValue,
  Tooltip,
  HStack,
  Card,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Avatar,
  Grid,
  GridItem,
  Divider,
  Link,
  Tag,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  MdVisibility, 
  MdChevronLeft, 
  MdChevronRight,
  MdPerson,
  MdWork,
  MdFolder,
  MdSchool,
  MdCardMembership,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdLanguage,
  MdAttachMoney,
  MdCalendarToday,
  MdLink,
  MdGetApp,
  MdPublic,
  MdDescription,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { MdRefresh } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { statusChange } from '../../../features/admin/clientManagementSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import {
  freelancerData,
  freelancerCompleteData,
} from '../../../features/admin/freelancerManagementSlice';

function FreelancerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [detailTabIndex, setDetailTabIndex] = useState(0);
  const detailsModal = useDisclosure();
  const statusModal = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review', 'Suspended'];

  // Determine if this is the Management -> Freelancers page (approved only)
  // Registration -> Freelancers is at /freelancers, Management -> Freelancers is at /freelancers-management
  const isManagementPage = location.pathname === '/admin/freelancers-management';

  // Set filters: Management page shows only approved, Registration shows all others (exclude approved)
  const statusFilter = isManagementPage ? 'approved' : null;
  const excludeStatusFilter = !isManagementPage ? 'approved' : null;

  const {
    isLoading,
    responseData,
    completeData,
    completeDataLoading,
    completeDataError,
  } = useSelector((s) => s.freelancerDataReducer || {});

  const rows = useMemo(() => {
    const list = responseData?.freelancers;
    const arr = Array.isArray(list) ? list : [];
    const total = typeof responseData?.total_count === 'number' ? responseData.total_count : arr.length;
    setTotalCount(total);
    return arr;
  }, [responseData]);

  useEffect(() => {
    dispatch(freelancerData({ page, pageLimit, status: statusFilter, excludeStatus: excludeStatusFilter }));
  }, [dispatch, page, pageLimit, statusFilter, excludeStatusFilter]);

  const openDetails = (userId) => {
    setSelectedFreelancer(userId);
    setDetailTabIndex(0);
    detailsModal.onOpen();
    dispatch(freelancerCompleteData({ userId }));
  };

  const closeDetails = () => {
    detailsModal.onClose();
    setSelectedFreelancer(null);
    setDetailTabIndex(0);
  };

  const openStatus = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setSelectedStatus(freelancer?.status || 'Pending');
    statusModal.onOpen();
  };

  const closeStatus = () => {
    statusModal.onClose();
    setSelectedFreelancer(null);
    setSelectedStatus('');
  };

  const applyStatusChange = async () => {
    if (!selectedFreelancer) return;
    try {
      await dispatch(statusChange({ id: selectedFreelancer.id, apiData: { status: selectedStatus } }));
      showSuccess('Status updated successfully');
      // refetch with current filters
      dispatch(freelancerData({ page, pageLimit, status: statusFilter, excludeStatus: excludeStatusFilter }));
    } catch (e) {
      showError('Failed to update status');
    } finally {
      closeStatus();
    }
  };

  // Chakra color mode values (match ClientList look)
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const getStatusColorScheme = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'approved':
      case 'otpverified':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'rejected':
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      case 'under review':
      case 'incomplete':
      case 'approval':
      case 'completed':
      case 'complete':
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
          <Text color={textColor} fontSize="l" fontWeight="700" mb="10px">
            Freelancers
          </Text>

          {isLoading && rows.length === 0 ? (
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
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        First Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Last Name
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Sub Categories
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Location
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Last Login
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        Status
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        View
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py="40px">
                          <Text color="black">No freelancers found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((fr, index) => {
                        // Format sub categories
                        const subCategories = Array.isArray(fr.sub_category_names) && fr.sub_category_names.length > 0
                          ? fr.sub_category_names.join(', ')
                          : '--';

                        // Format location
                        const location = [fr.city, fr.country].filter(Boolean).join(' - ') || '--';

                        // Format last login
                        const lastLoginDate = fr.freelancer_last_login || fr.last_login;
                        let lastLogin = '--';
                        if (lastLoginDate) {
                          try {
                            const date = new Date(lastLoginDate);
                            lastLogin = date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          } catch (e) {
                            lastLogin = '--';
                          }
                        }

                        const statusColors = getStatusColorScheme(fr.status);
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;

                        return (
                          <Tr key={fr.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.first_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{fr.last_name || '--'}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{subCategories}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{location}</Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">{lastLogin}</Text>
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
                                _hover={{ opacity: 0.8, transform: 'translateY(-2px)' }}
                                onClick={() => openStatus(fr)}
                              >
                                {fr.status || 'Pending'}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <Tooltip label="View Freelancer Details">
                                <IconButton
                                  aria-label="View freelancer"
                                  icon={<MdVisibility />}
                                  size="sm"
                                  variant="ghost"
                                  style={{ color: 'rgb(32, 33, 36)' }}
                                  onClick={() => openDetails(fr.id)}
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
              <Flex justify="space-between" align="center" pt="8px" flexWrap="wrap" gap="8px">
                <HStack spacing="12px">
                  <Text color="black" fontSize="sm">
                    Showing <Text as="span" fontWeight="700" color="brand.500">{rows.length}</Text> of {totalCount}
                  </Text>
                  <HStack spacing="8px">
                    <Text color="black" fontSize="sm" whiteSpace="nowrap">Per page:</Text>
                    <Select
                      size="sm"
                      w="80px"
                      value={pageLimit}
                      onChange={(e) => {
                        setPageLimit(Number(e.target.value));
                        setPage(1);
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
                  <IconButton aria-label="Previous page" icon={<MdChevronLeft />} size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1} variant="outline" />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((p) => (
                      <Button key={p} size="sm" variant={page === p ? 'solid' : 'outline'} colorScheme={page === p ? 'brand' : 'gray'} onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    ))}
                  <IconButton aria-label="Next page" icon={<MdChevronRight />} size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={page === totalPages} variant="outline" />
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Card>

      {/* Status Change Modal */}
      <Modal isOpen={statusModal.isOpen} onClose={closeStatus} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {statusOptions.map((status) => (
              <Box key={status} mb="12px">
                <HStack>
                  <input
                    type="checkbox"
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text fontSize="sm" fontWeight="500">{status}</Text>
                </HStack>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeStatus}>Cancel</Button>
            <Button colorScheme="brand" onClick={applyStatusChange}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Freelancer Detail Modal */}
      <Modal 
        isOpen={detailsModal.isOpen} 
        onClose={closeDetails} 
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <Text fontSize="xl" fontWeight="bold">Freelancer Details</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {completeDataLoading ? (
              <Flex py={10} align="center" justify="center" gap={3}>
                <Spinner size="xl" color="brand.500" />
                <Text>Loading details...</Text>
              </Flex>
            ) : completeDataError ? (
              <Flex py={10} align="center" justify="center" direction="column" gap={3}>
                <Text color="red.500" fontWeight="bold">Failed to load freelancer details</Text>
                <Text color="gray.500">Please try again later</Text>
              </Flex>
            ) : !completeData || Object.keys(completeData).length === 0 ? (
              <Flex py={10} align="center" justify="center">
                <Text color="gray.500">No details available</Text>
              </Flex>
            ) : (
              <FreelancerDetailContent 
                completeData={completeData}
                tabIndex={detailTabIndex}
                onTabChange={setDetailTabIndex}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Freelancer Detail Content Component
const FreelancerDetailContent = ({ completeData, tabIndex, onTabChange }) => {
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  if (!completeData) {
    return (
      <Flex py={10} align="center" justify="center">
        <Text color="gray.500">No data available</Text>
      </Flex>
    );
  }

  const { primaryIntroduction, professionalExperience, projects, certifications, education, summary } = completeData;

  const formatCurrency = (amount, currency) => {
    if (!amount) return '--';
    return `${currency || '$'} ${amount}`;
  };

  const renderInfoItem = (icon, label, value, fullWidth = false) => {
    if (!value && value !== 0 && value !== false) return null;
    
    return (
      <GridItem colSpan={{ base: 12, md: fullWidth ? 12 : 6, lg: fullWidth ? 12 : 4 }}>
        <VStack align="start" spacing={1} mb={4}>
          <HStack spacing={2}>
            {icon}
            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
              {label}
            </Text>
          </HStack>
          <Text fontSize="sm" fontWeight="500" color={textColor}>
            {value}
          </Text>
        </VStack>
      </GridItem>
    );
  };

  const renderPrimaryIntroduction = () => {
    if (!primaryIntroduction) {
      return <Text color="gray.500">No primary introduction data available.</Text>;
    }
    
    const { user, designation } = primaryIntroduction;
    if (!user) {
      return <Text color="gray.500">No user data available.</Text>;
    }

    return (
      <VStack align="stretch" spacing={6}>
        <Card bg={cardBg} p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={4} align="start">
              <Avatar
                size="xl"
                src={user.profile_image}
                name={`${user.first_name || ''} ${user.last_name || ''}`}
                bg="brand.500"
              />
              <VStack align="start" spacing={2} flex={1}>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {`${user.first_name || ''} ${user.last_name || ''}`}
                </Text>
                <Badge 
                  colorScheme={user.status === 'approval' ? 'green' : 'yellow'}
                  variant="solid"
                  fontSize="xs"
                >
                  {user.status || 'Unknown'}
                </Badge>
              </VStack>
            </HStack>

            <Divider />

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              {renderInfoItem(<MdEmail />, 'Email', user.email)}
              {renderInfoItem(<MdPhone />, 'Mobile', user.mobile)}
              {renderInfoItem(<MdPerson />, 'Gender', user.gender)}
              {renderInfoItem(<MdBusiness />, 'Designation', designation?.name)}
              {renderInfoItem(<MdBusiness />, 'Company', user.company_name)}
              {renderInfoItem(<MdLocationOn />, 'Location', 
                [user.city, user.state, user.country].filter(Boolean).join(', ')
              )}
              {user.address && renderInfoItem(<MdLocationOn />, 'Address', user.address, true)}
              {user.aboutme && renderInfoItem(<MdPerson />, 'About', user.aboutme, true)}
            </Grid>
          </VStack>
        </Card>
      </VStack>
    );
  };

  const renderProfessionalExperience = () => {
    if (!professionalExperience) {
      return <Text color="gray.500">No professional experience data available.</Text>;
    }
    
    const { data, category, subCategory } = professionalExperience;
    if (!data) {
      return <Text color="gray.500">No professional experience data available.</Text>;
    }

    return (
      <VStack align="stretch" spacing={6}>
        <Card bg={cardBg} p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2} mb={4}>
              <MdWork size={24} color="brand.500" />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Professional Overview
              </Text>
            </HStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              {data.profile_headline && renderInfoItem(<MdWork />, 'Profile Headline', data.profile_headline, true)}
              {renderInfoItem(<MdBusiness />, 'Category', category?.name)}
              {renderInfoItem(<MdBusiness />, 'Sub Category', subCategory?.name)}
              {renderInfoItem(<MdAttachMoney />, 'Rate per Hour', formatCurrency(data.rateperhour_2, data.currency?.split('-')[1]))}
              {renderInfoItem(<MdLanguage />, 'Languages', data.languages)}
            </Grid>

            {data.technologty_pre && (
              <Box mt={4}>
                <HStack spacing={2} mb={2}>
                  <MdBusiness size={20} />
                  <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                    Technologies
                  </Text>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  {data.technologty_pre.split(',').map((tech, index) => (
                    <Tag key={index} colorScheme="brand" size="sm" borderRadius="md">
                      {tech.trim()}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </Card>

        <Card bg={cardBg} p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={2} mb={4}>
              <MdPublic size={24} color="brand.500" />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Platform Links
              </Text>
            </HStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              {[
                { name: 'Upwork', active: data.upwork_platform, link: data.upwork_platform_profile_link },
                { name: 'Fiverr', active: data.fiver_platform, link: data.fiver_platform_profile_link },
                { name: 'Freelancer', active: data.freelancer_platform, link: data.freelancer_platform_profile_link },
                { name: 'PeoplePerHour', active: data.pph_platform, link: data.pph_platform_profile_link },
                { name: 'Truelancer', active: data.truelancer_platform, link: data.truelancer_platform_profile_link },
                { name: data.other_platform || 'Other', active: !!data.other_platform, link: data.other_platform_profile_link }
              ].filter(platform => platform.active).map((platform, index) => (
                <GridItem key={index}>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <MdLink size={16} />
                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                        {platform.name}
                      </Text>
                    </HStack>
                    {platform.link ? (
                      <Link href={platform.link} target="_blank" rel="noopener noreferrer" color="brand.500" fontSize="sm" isExternal>
                        {platform.link}
                      </Link>
                    ) : (
                      <Text fontSize="sm" color={textColor}>Active (No link provided)</Text>
                    )}
                  </VStack>
                </GridItem>
              ))}
            </Grid>
          </VStack>
        </Card>
      </VStack>
    );
  };

  const renderProjects = () => {
    if (!projects) {
      return <Text color="gray.500">No projects data available.</Text>;
    }
    
    const { data: projectsData, count } = projects;
    if (!projectsData || projectsData.length === 0) {
      return <Text color="gray.500">No projects data available.</Text>;
    }

    const getProjectTypeLabel = (projectType) => {
      if (projectType === '1') return 'Support';
      if (projectType === '2') return 'New Development';
      if (projectType === '3') return 'New Development Cum Support';
      return '--';
    };

    return (
      <VStack align="stretch" spacing={4}>
        <Card bg={cardBg} p={6}>
          <HStack spacing={2} mb={4}>
            <MdFolder size={24} color="brand.500" />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Projects ({count})
            </Text>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {projectsData.map((project, index) => {
              const platforms = [
                { name: 'Web', active: project.is_web_platform },
                { name: 'Mobile', active: project.is_mobile_platform },
                { name: 'Desktop', active: project.is_desktop_platform },
                { name: 'Embedding', active: project.is_embedding_platform }
              ].filter(platform => platform.active);
              
              const hasPlatforms = platforms.length > 0;

              return (
                <Card key={project.id || index} bg={hoverBg} p={4} border="1px solid" borderColor={borderColor}>
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="md" fontWeight="bold" color={textColor}>
                      {project.project_name || `Project ${index + 1}`}
                    </Text>

                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      {renderInfoItem(<MdCalendarToday />, 'Duration', project.duration ? `${project.duration} months` : null)}
                      {renderInfoItem(<MdLocationOn />, 'Location', project.project_location)}
                      {renderInfoItem(<MdWork />, 'Type', getProjectTypeLabel(project.project_type))}
                    </Grid>

                    {project.technologty_pre && (
                      <Box>
                        <HStack spacing={2} mb={2}>
                          <MdBusiness size={16} />
                          <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Technologies
                          </Text>
                        </HStack>
                        <HStack spacing={2} flexWrap="wrap">
                          {project.technologty_pre.split(',').map((tech, techIndex) => (
                            <Tag key={techIndex} colorScheme="brand" size="sm" borderRadius="md">
                              {tech.trim()}
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
                    )}

                    {hasPlatforms && (
                      <Box>
                        <HStack spacing={2} mb={2}>
                          <MdPublic size={16} />
                          <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Platforms
                          </Text>
                        </HStack>
                        <HStack spacing={2} flexWrap="wrap">
                          {platforms.map((platform, platformIndex) => (
                            <Tag key={platformIndex} variant="outlined" size="sm" borderRadius="md">
                              {platform.name}
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
                    )}

                    {project.project_details && (
                      <Box>
                        <HStack spacing={2} mb={2}>
                          <MdDescription size={16} />
                          <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                            Description
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor} lineHeight="1.6">
                          {project.project_details}
                        </Text>
                      </Box>
                    )}

                    {project.project_link && (
                      <Link 
                        href={project.project_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        color="brand.500"
                        fontSize="sm"
                        isExternal
                      >
                        <HStack spacing={1}>
                          <MdLink />
                          <Text>View Project</Text>
                        </HStack>
                      </Link>
                    )}
                  </VStack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Card>
      </VStack>
    );
  };

  const renderCertifications = () => {
    if (!certifications) {
      return <Text color="gray.500">No certifications data available.</Text>;
    }
    
    const { data: certsData, count } = certifications;
    if (!certsData || certsData.length === 0) {
      return <Text color="gray.500">No certifications data available.</Text>;
    }

    return (
      <Card bg={cardBg} p={6}>
        <HStack spacing={2} mb={4}>
          <MdCardMembership size={24} color="brand.500" />
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Certifications ({count})
          </Text>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color={textColor}>Certificate Name</Th>
                <Th borderColor={borderColor} color={textColor}>Institution</Th>
                <Th borderColor={borderColor} color={textColor}>Certificate No.</Th>
                <Th borderColor={borderColor} color={textColor}>From</Th>
                <Th borderColor={borderColor} color={textColor}>Till</Th>
              </Tr>
            </Thead>
            <Tbody>
              {certsData.map((cert, index) => (
                <Tr key={cert.certificate_id || index} _hover={{ bg: hoverBg }}>
                  <Td borderColor={borderColor} color={textColor}>{cert.name || '--'}</Td>
                  <Td borderColor={borderColor} color={textColor}>{cert.institutename || '--'}</Td>
                  <Td borderColor={borderColor} color={textColor}>{cert.certificate_no || '--'}</Td>
                  <Td borderColor={borderColor} color={textColor}>{cert.from_date || '--'}</Td>
                  <Td borderColor={borderColor} color={textColor}>{cert.till_date === '0' ? 'Present' : cert.till_date || '--'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    );
  };

  const renderEducation = () => {
    if (!education) {
      return <Text color="gray.500">No education data available.</Text>;
    }
    
    const { data: eduData, count, graduation, postGraduation } = education;
    if (!eduData || eduData.length === 0) {
      return <Text color="gray.500">No education data available.</Text>;
    }

    return (
      <VStack align="stretch" spacing={6}>
        {graduation && graduation.length > 0 && (
          <Card bg={cardBg} p={6}>
            <HStack spacing={2} mb={4}>
              <MdSchool size={24} color="brand.500" />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Graduation
              </Text>
            </HStack>

            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor} color={textColor}>Degree</Th>
                    <Th borderColor={borderColor} color={textColor}>University</Th>
                    <Th borderColor={borderColor} color={textColor}>Education Type</Th>
                    <Th borderColor={borderColor} color={textColor}>Year</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {graduation.map((edu, index) => (
                    <Tr key={edu.id || index} _hover={{ bg: hoverBg }}>
                      <Td borderColor={borderColor} color={textColor}>{edu.degree || '--'}</Td>
                      <Td borderColor={borderColor} color={textColor}>{edu.university_name || '--'}</Td>
                      <Td borderColor={borderColor} color={textColor}>{edu.education_type || '--'}</Td>
                      <Td borderColor={borderColor} color={textColor}>{edu.year || '--'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Card>
        )}

        {postGraduation && postGraduation.length > 0 && (
          <Card bg={cardBg} p={6}>
            <HStack spacing={2} mb={4}>
              <MdSchool size={24} color="brand.500" />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Post Graduation
              </Text>
            </HStack>

            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor} color={textColor}>Degree</Th>
                    <Th borderColor={borderColor} color={textColor}>University</Th>
                    <Th borderColor={borderColor} color={textColor}>Education Type</Th>
                    <Th borderColor={borderColor} color={textColor}>Year</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {postGraduation.map((edu, index) => (
                    <Tr key={edu.id || index} _hover={{ bg: hoverBg }}>
                      <Td borderColor={borderColor} color={textColor}>{edu.degree || '--'}</Td>
                      <Td borderColor={borderColor} color={textColor}>{edu.university_name || '--'}</Td>
                      <Td borderColor={borderColor} color={textColor}>{edu.education_type || '--'}</Td>
                      <Td borderColor={borderColor} color={textColor}>{edu.year || '--'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Card>
        )}
      </VStack>
    );
  };

  return (
    <Tabs index={tabIndex} onChange={onTabChange} colorScheme="brand" variant="enclosed">
      <TabList>
        <Tab>
          <HStack spacing={2}>
            <MdPerson />
            <Text>Primary Introduction</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdWork />
            <Text>Professional Experience</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdFolder />
            <Text>Projects</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdCardMembership />
            <Text>Certifications</Text>
          </HStack>
        </Tab>
        <Tab>
          <HStack spacing={2}>
            <MdSchool />
            <Text>Education</Text>
          </HStack>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0} pt={4}>
          {renderPrimaryIntroduction()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderProfessionalExperience()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderProjects()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderCertifications()}
        </TabPanel>
        <TabPanel px={0} pt={4}>
          {renderEducation()}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default FreelancerList;



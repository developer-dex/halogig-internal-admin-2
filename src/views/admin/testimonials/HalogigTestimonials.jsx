import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Spinner,
  Flex,
  Card,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdDelete,
  MdEdit,
} from 'react-icons/md';
import {
  createTestimonial,
  getAllTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from '../../../features/admin/testimonialSlice';
import { showError, showSuccess } from '../../../helpers/messageHelper';

export default function HalogigTestimonials() {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_designation: '',
    client_company_name: '',
    testimonial_comment: '',
  });

  const pageLimit = 50;

  // Chakra color mode values
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(getAllTestimonials({
        page: currentPage,
        limit: pageLimit
      }));
      if (response.payload?.data?.data) {
        setTestimonials(response.payload.data.data.testimonials || []);
        setTotalCount(response.payload.data.data.total_count || 0);
      }
    } catch (error) {
      showError('Failed to fetch testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingTestimonialId(null);
    setFormData({
      client_name: '',
      client_designation: '',
      client_company_name: '',
      testimonial_comment: '',
    });
    onOpen();
  };

  const handleEditClick = (testimonial) => {
    setIsEditMode(true);
    setEditingTestimonialId(testimonial.id);
    setFormData({
      client_name: testimonial.client_name || '',
      client_designation: testimonial.client_designation || '',
      client_company_name: testimonial.client_company_name || '',
      testimonial_comment: testimonial.testimonial_comment || '',
    });
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setIsEditMode(false);
    setEditingTestimonialId(null);
    setFormData({
      client_name: '',
      client_designation: '',
      client_company_name: '',
      testimonial_comment: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTestimonial = async () => {
    // Validate required fields
    if (!formData.client_name || !formData.testimonial_comment) {
      showError('Client name and testimonial comment are required');
      return;
    }

    if (isEditMode) {
      setIsUpdating(true);
      try {
        await dispatch(updateTestimonial({
          testimonialId: editingTestimonialId,
          formData,
        }));
        handleCloseModal();
        fetchTestimonials();
      } catch (error) {
        // Error is already handled in the Redux slice
      } finally {
        setIsUpdating(false);
      }
    } else {
      setIsCreating(true);
      try {
        await dispatch(createTestimonial(formData));
        handleCloseModal();
        fetchTestimonials();
      } catch (error) {
        // Error is already handled in the Redux slice
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleDeleteClick = (testimonial) => {
    setSelectedTestimonial(testimonial);
    deleteModal.onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTestimonial) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteTestimonial(selectedTestimonial.id));
      deleteModal.onClose();
      setSelectedTestimonial(null);
      fetchTestimonials();
    } catch (error) {
      showError('Failed to delete testimonial');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / pageLimit);

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px">
          <Flex justify="space-between" align="center" mb="8px">
            <Text
              color={textColor}
              fontSize="2xl"
              fontWeight="700"
            >
              Halogig Testimonials
            </Text>
            <Button
              leftIcon={<MdAdd />}
              colorScheme="brand"
              onClick={handleOpenModal}
            >
              Create Testimonial
            </Button>
          </Flex>

          {isLoading && testimonials.length === 0 ? (
            <Flex justify="center" align="center" minH="600px">
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
                <Table variant="simple" color="gray.500" minW="800px">
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
                        CLIENT NAME
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        DESIGNATION
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        COMPANY NAME
                      </Th>
                      <Th
                        borderColor={borderColor}
                        color="black"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        bg={bgColor}
                      >
                        TESTIMONIAL COMMENT
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
                        CREATED ON
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
                    {testimonials.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py="40px">
                          <Text color="black">No testimonials found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      testimonials.map((testimonial, index) => {
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;
                        return (
                        <Tr
                          key={testimonial.id}
                          bg={isOddRow ? '#F8FAFD' : 'transparent'}
                          _hover={{ bg: hoverBg }}
                          transition="all 0.2s"
                        >
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {testimonial.client_name || '--'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {testimonial.client_designation || '--'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {testimonial.client_company_name || '--'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor}>
                            <Text 
                              color={textColor} 
                              fontSize="sm" 
                              fontWeight="normal"
                              noOfLines={2}
                            >
                              {testimonial.testimonial_comment || '--'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} textAlign="center">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {formatDate(testimonial.created_at)}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} textAlign="center">
                            <HStack spacing="8px" justify="center">
                              <Tooltip label="Edit Testimonial">
                                <IconButton
                                  aria-label="Edit testimonial"
                                  icon={<MdEdit />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleEditClick(testimonial)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete Testimonial">
                                <IconButton
                                  aria-label="Delete testimonial"
                                  icon={<MdDelete />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteClick(testimonial)}
                                />
                              </Tooltip>
                            </HStack>
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
              >
                <Text color="black" fontSize="sm">
                  Showing <Text as="span" fontWeight="700" color="brand.500">
                    {testimonials.length}
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

      {/* Create/Edit Testimonial Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Update Testimonial' : 'Create Testimonial'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl isRequired>
                <FormLabel>Client Name</FormLabel>
                <Input
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Client Designation</FormLabel>
                <Input
                  name="client_designation"
                  value={formData.client_designation}
                  onChange={handleInputChange}
                  placeholder="Enter designation"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  name="client_company_name"
                  value={formData.client_company_name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Testimonial Comment</FormLabel>
                <Textarea
                  name="testimonial_comment"
                  value={formData.testimonial_comment}
                  onChange={handleInputChange}
                  placeholder="Enter testimonial comment"
                  rows={6}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreateTestimonial}
              isLoading={isCreating || isUpdating}
              loadingText={isEditMode ? "Updating..." : "Creating..."}
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Testimonial</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the testimonial from{' '}
              <Text as="span" fontWeight="bold">
                {selectedTestimonial?.client_name}
              </Text>? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


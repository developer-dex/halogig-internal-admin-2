import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Checkbox,
  HStack,
  Spinner,
  Tooltip,
  Flex,
  Card,
} from '@chakra-ui/react';
import { 
  MdVisibility, 
  MdContentCopy,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import { clientData, statusChange } from '../../../features/admin/clientManagementSlice';
import { showSuccess, showError } from '../../../helpers/messageHelper';
import { copyToClipboard } from '../../../utils/utils';

export default function ClientList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review', 'Suspended'];
  const pageLimit = 50;

  // Chakra color mode values
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(clientData({
        page: currentPage,
        pageLimit
      }));
      if (response.payload?.data?.data) {
        setClients(response.payload.data.data.clients || []);
        setTotalCount(response.payload.data.data.total_count || 0);
      }
    } catch (error) {
      showError('Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (client) => {
    setSelectedClient(client);
    setSelectedStatus(client.status || '');
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedClient(null);
    setSelectedStatus('');
  };

  const handleStatusChange = async () => {
    if (!selectedClient) return;
    
    try {
      await dispatch(statusChange({ 
        id: selectedClient.id, 
        apiData: { status: selectedStatus } 
      }));
      
      setClients((prevClients) =>
        prevClients.map((c) => 
          c.id === selectedClient.id ? { ...c, status: selectedStatus } : c
        )
      );
      
      showSuccess('Status updated successfully');
      handleCloseModal();
      fetchClients();
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const handleViewClient = (client) => {
    navigate(`/admin/clients/${client.id}`);
  };

  const handlePostProject = (client) => {
    navigate(`/admin/create-client-project`, {
      state: {
        clientId: client.id,
        clientName: `${client.first_name} ${client.last_name}`,
        clientEmail: client.email
      }
    });
  };

  const handleCopyLink = async (link) => {
    try {
      await copyToClipboard(link);
      showSuccess('Link copied to clipboard');
    } catch (error) {
      showError('Failed to copy link');
    }
  };

  const truncateLink = (link, maxLength = 30) => {
    if (!link || link.length <= maxLength) return link;
    return link.substring(0, maxLength) + '...';
  };

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
        return { bg: 'transparent', color: 'black', border: 'black.600' };
      default:
        return { bg: 'transparent', color: 'black', border: 'black.600' };
    }
  };

  const totalPages = Math.ceil(totalCount / pageLimit);

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
            Clients
          </Text>

          {isLoading && clients.length === 0 ? (
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
                        ACTION
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
                        POST PROJECT
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
                        SET-UP LINK
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
                        VIEW
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {clients.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py="40px">
                          <Text color="black">No clients found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      clients.map((client, index) => {
                        const statusColors = getStatusColorScheme(client.status);
                        // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                        const isOddRow = index % 2 === 0;
                        return (
                          <Tr
                            key={client.id}
                            bg={isOddRow ? '#F4F7FE' : 'transparent'}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {client.first_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {client.last_name || '--'}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor}>
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {client.email || '--'}
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
                                onClick={() => handleOpenModal(client)}
                              >
                                {client.status || 'Pending'}
                              </Button>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              {client.created_by_admin && (
                                <Button
                                  size="sm"
                                  style={{ background: 'linear-gradient(#c3362a 0, #92150d 74%)', color: 'white' }}
                                  _hover={{
                                    opacity: 0.9,
                                  }}
                                  onClick={() => handlePostProject(client)}
                                >
                                  Post A Project
                                </Button>
                              )}
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              {client.created_by_admin && client.share_link ? (
                                <HStack spacing="8px" justify="center">
                                  <Tooltip label={client.share_link}>
                                    <Text
                                      fontSize="xs"
                                      color="black"
                                      cursor="pointer"
                                      textDecoration="underline"
                                      onClick={() => window.open(client.share_link, '_blank')}
                                    >
                                      {truncateLink(client.share_link, 15)}
                                    </Text>
                                  </Tooltip>
                                  <Tooltip label="Copy link">
                                    <IconButton
                                      aria-label="Copy link"
                                      icon={<MdContentCopy />}
                                      size="xs"
                                      variant="ghost"
                                      onClick={() => handleCopyLink(client.share_link)}
                                    />
                                  </Tooltip>
                                </HStack>
                              ) : (
                                <Text color="black">--</Text>
                              )}
                            </Td>
                            <Td borderColor={borderColor} textAlign="center">
                              <Tooltip label="View Client Details">
                                <IconButton
                                  aria-label="View client"
                                  icon={<MdVisibility />}
                                  size="sm"
                                  variant="ghost"
                                  style={{color: 'rgb(32, 33, 36)'}}
                                  onClick={() => handleViewClient(client)}
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
                    {clients.length}
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
      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
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
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
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

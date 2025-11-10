import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Select,
  Radio,
  RadioGroup,
  Stack,
  FormControl,
  FormLabel,
  Textarea,
  Spinner,
  Flex,
  HStack,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { MdAdd, MdMoreHoriz, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { Country, State, City } from 'country-state-city';
import {
  contactData,
  getEnrollAsData,
  getCountryData,
  getIndustryData,
  createUserByAdmin,
  updateClientStatusInContactUsByAdmin,
} from '../../../features/admin/contactUsManagementSlice';
import { showSuccess, showError } from '../../../helpers/messageHelper';

export default function ContactList() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [enrollAsData, setEnrollAsData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  // Modals
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isReqModalOpen, onOpen: onReqModalOpen, onClose: onReqModalClose } = useDisclosure();
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();

  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedReq, setSelectedReq] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    company_name: '',
    gender: 'male',
    designation: '',
    country: '',
  });

  const [createFormData, setCreateFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    company_name: '',
    designation: '',
    country: 'IN',
    state: '',
    city: '',
    gender: 'male',
    notes: '',
  });

  const pageLimit = 10;

  const isIndividual = useMemo(() => {
    const selected = enrollAsData.find((o) => String(o.id) === String(createFormData.designation));
    const byName = (selected?.name || '').toLowerCase() === 'individual';
    const byId = String(createFormData.designation) === '2';
    return byName || byId;
  }, [enrollAsData, createFormData.designation]);

  // Chakra color mode values
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('white', 'navy.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(contactData({
        page: currentPage,
        pageLimit,
      }));
      if (response.payload?.data?.data) {
        setContacts(response.payload.data.data.contactUs || []);
        setTotalCount(response.payload.data.data.total_count || 0);
      }
    } catch (error) {
      showError('Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const enrollData = async () => {
    try {
      const response = await dispatch(getEnrollAsData());
      if (response.payload?.data?.data) {
        setEnrollAsData(response.payload.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enroll as data:', error);
    }
  };

  const countryGetData = async () => {
    try {
      const response = await dispatch(getCountryData());
      if (response.payload?.data?.data) {
        setCountryData(response.payload.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch country data:', error);
    }
  };

  const industryGetData = async () => {
    try {
      const response = await dispatch(getIndustryData());
      if (response.payload?.data?.data) {
        setIndustryData(response.payload.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch industry data:', error);
    }
  };

  useEffect(() => {
    enrollData();
    countryGetData();
    industryGetData();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  // Initialize country list options for Create modal
  useEffect(() => {
    const options = Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode }));
    setCountryOptions(options);
    if (createFormData.country) {
      const states = State.getStatesOfCountry(createFormData.country).map((s) => ({ label: s.name, value: s.isoCode }));
      setStateOptions(states);
      if (createFormData.state) {
        const cities = City.getCitiesOfState(createFormData.country, createFormData.state).map((ci) => ({ label: ci.name, value: ci.name }));
        setCityOptions(cities);
      }
    }
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (createFormData.country) {
      const states = State.getStatesOfCountry(createFormData.country).map((s) => ({ label: s.name, value: s.isoCode }));
      setStateOptions(states);
      setCreateFormData((prev) => ({ ...prev, state: '', city: '' }));
      setCityOptions([]);
    }
  }, [createFormData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (createFormData.country && createFormData.state) {
      const cities = City.getCitiesOfState(createFormData.country, createFormData.state).map((ci) => ({ label: ci.name, value: ci.name }));
      setCityOptions(cities);
      setCreateFormData((prev) => ({ ...prev, city: '' }));
    }
  }, [createFormData.country, createFormData.state]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = (contact) => {
    setSelectedContact(contact);
    const contactDesignation = String(contact?.designation || '').toLowerCase();
    const matchedRole = enrollAsData.find((o) => (o.name || '').toLowerCase() === contactDesignation);
    const designationId = matchedRole ? String(matchedRole.id) : '';

    let isoCountry = '';
    let isoState = '';
    let cityName = '';

    if (contact?.country) {
      const foundCountry = Country.getAllCountries().find((c) => (c.name || '').toLowerCase() === String(contact.country).toLowerCase());
      if (foundCountry) {
        isoCountry = foundCountry.isoCode;
        const states = State.getStatesOfCountry(isoCountry).map((s) => ({ label: s.name, value: s.isoCode }));
        setStateOptions(states);

        if (contact?.city) {
          let locatedState = '';
          for (const st of states) {
            const cityList = City.getCitiesOfState(isoCountry, st.value);
            if (cityList && cityList.some((ct) => (ct.name || '').toLowerCase() === String(contact.city).toLowerCase())) {
              locatedState = st.value;
              break;
            }
          }
          if (locatedState) {
            isoState = locatedState;
            const cities = City.getCitiesOfState(isoCountry, isoState).map((ci) => ({ label: ci.name, value: ci.name }));
            setCityOptions(cities);
            cityName = contact.city;
          }
        }
      }
    }

    setCreateFormData((prev) => ({
      ...prev,
      first_name: contact?.first_name || '',
      last_name: contact?.last_name || '',
      email: contact?.email || '',
      mobile: contact?.mobile || '',
      company_name: contact?.company_name || '',
      gender: contact?.gender || 'male',
      designation: designationId,
      country: isoCountry || prev.country,
      state: isoState || '',
      city: cityName || '',
      notes: contact?.notes || prev.notes,
    }));

    if (isoCountry) {
      const states = State.getStatesOfCountry(isoCountry).map((s) => ({ label: s.name, value: s.isoCode }));
      setStateOptions(states);
      if (isoState) {
        const cities = City.getCitiesOfState(isoCountry, isoState).map((ci) => ({ label: ci.name, value: ci.name }));
        setCityOptions(cities);
      } else {
        setCityOptions([]);
      }
    }

    onCreateModalOpen();
    onAddModalClose();
  };

  const handleCloseModal = () => {
    onAddModalClose();
    setSelectedContact(null);
  };

  const handleFormSubmit = async () => {
    try {
      const enhancedFormData = {
        id: selectedContact.id,
        is_client_added: true,
      };

      const response = await dispatch(updateClientStatusInContactUsByAdmin(enhancedFormData));
      if (response.payload?.status === 200) {
        showSuccess('Contact added as client successfully');
        handleCloseModal();
        fetchContacts();
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleOpenReqModal = (requirements) => {
    setSelectedReq(requirements);
    onReqModalOpen();
  };

  const handleCloseReqModal = () => {
    onReqModalClose();
    setSelectedReq('');
  };

  const handleOpenCreateModal = () => {
    setSelectedContact(null);
    const initialFormData = {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      company_name: '',
      designation: '',
      country: 'IN',
      state: '',
      city: '',
      gender: 'male',
      notes: '',
    };
    setCreateFormData(initialFormData);
    onCreateModalOpen();
  };

  const handleCloseCreateModal = () => {
    onCreateModalClose();
    setCreateFormData({
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      company_name: '',
      designation: '',
      country: 'IN',
      state: '',
      city: '',
      gender: 'male',
      notes: '',
    });
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (phone) => {
    setCreateFormData((prev) => ({
      ...prev,
      mobile: phone,
    }));
  };

  const handleCreateFormSubmit = async () => {
    try {
      if (!createFormData.first_name || !createFormData.last_name || !createFormData.email ||
          !createFormData.mobile || !createFormData.designation || !createFormData.company_name ||
          !createFormData.country || !createFormData.state || !createFormData.city) {
        showError('Please fill in all required fields');
        return;
      }

      setIsCreatingUser(true);

      const userData = {
        first_name: createFormData.first_name.trim(),
        last_name: createFormData.last_name.trim(),
        email: createFormData.email.trim(),
        mobile: createFormData.mobile,
        company_name: createFormData.company_name.trim(),
        designation: createFormData.designation,
        country: createFormData.country,
        state: createFormData.state,
        city: createFormData.city,
        gender: createFormData.gender,
        notes: createFormData.notes.trim(),
      };

      const response = await dispatch(createUserByAdmin(userData));

      if (response.payload && response.payload.status === 200) {
        showSuccess('User created successfully!');
        handleCloseCreateModal();
        fetchContacts();
      } else {
        const errorMessage = response.payload?.data?.message || 'Failed to create user. Please try again.';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user. Please try again.';
      showError(errorMessage);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card mb={{ base: '0px', '2xl': '20px' }}>
        <Flex align="center" justify="space-between" mb="20px" p="12px">
          <Text color={textColor} fontSize="2xl" fontWeight="700">
            Contact List
          </Text>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={handleOpenCreateModal}
          >
            Create User
          </Button>
        </Flex>

        {isLoading && contacts.length === 0 ? (
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="xl" color="brand.500" />
          </Flex>
        ) : (
          <>
            <Box
              maxH={{ base: 'calc(100vh - 280px)', md: 'calc(100vh - 240px)', xl: 'calc(100vh - 240px)' }}
              overflowY="auto"
              overflowX="auto"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
              mx="12px"
              mb="12px"
            >
              <Table variant="simple" color="gray.500" minW="1000px">
                <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                  <Tr>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>First Name</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Last Name</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Email</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Phone Number</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Company Name</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Requirements</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Notes</Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {contacts.length === 0 ? (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py="40px">
                        <Text color="black">No contacts found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    contacts.map((contact) => (
                      <Tr key={contact.id || contact._id} _hover={{ bg: hoverBg }} transition="all 0.2s">
                        <Td borderColor={borderColor}>
                          <Text color="black" fontSize="sm" fontWeight="500">
                            {contact.first_name || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color="black" fontSize="sm" fontWeight="500">
                            {contact.last_name || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color="black" fontSize="sm" fontWeight="500">
                            {contact.email || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color="black" fontSize="sm" fontWeight="500">
                            {contact.mobile || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color="black" fontSize="sm" fontWeight="500">
                            {contact.company_name || '--'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          {contact.requirements ? (
                            <Flex align="center" gap={2} maxW="200px">
                              <Text
                                color="black"
                                fontSize="sm"
                                fontWeight="500"
                                noOfLines={1}
                                flex={1}
                              >
                                {contact.requirements}
                              </Text>
                              {contact.requirements.length > 20 && (
                                <Tooltip label="View full requirements">
                                  <IconButton
                                    aria-label="View requirements"
                                    icon={<MdMoreHoriz />}
                                    size="xs"
                                    variant="ghost"
                                    color="black"
                                    onClick={() => handleOpenReqModal(contact.requirements)}
                                  />
                                </Tooltip>
                              )}
                            </Flex>
                          ) : (
                            <Text color="black" fontSize="sm" fontWeight="500">--</Text>
                          )}
                        </Td>
                        <Td borderColor={borderColor}>
                          {contact.notes ? (
                            <Flex align="center" gap={2} maxW="200px">
                              <Text
                                color="black"
                                fontSize="sm"
                                fontWeight="500"
                                noOfLines={1}
                                flex={1}
                              >
                                {contact.notes}
                              </Text>
                              {contact.notes.length > 20 && (
                                <Tooltip label="View full notes">
                                  <IconButton
                                    aria-label="View notes"
                                    icon={<MdMoreHoriz />}
                                    size="xs"
                                    variant="ghost"
                                    color="black"
                                    onClick={() => handleOpenReqModal(contact.notes)}
                                  />
                                </Tooltip>
                              )}
                            </Flex>
                          ) : (
                            <Text color="black" fontSize="sm" fontWeight="500">--</Text>
                          )}
                        </Td>
                        <Td borderColor={borderColor} textAlign="center">
                          {contact.is_client_added === true ? (
                            <Badge colorScheme="green" px="12px" py="4px" borderRadius="full">
                              Added
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="brand"
                              onClick={() => handleOpenModal(contact)}
                            >
                              ADD
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>

            <Flex justify="space-between" align="center" mt="10px" pt="10px" borderTop="1px solid" borderColor={borderColor} px="12px" pb="12px">
              <Text color="black" fontSize="sm">
                Showing <Text as="span" fontWeight="700" color="brand.500">{contacts.length}</Text> of {totalCount}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((page) => (
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
      </Card>

      {/* Requirements/Notes Modal */}
      <Modal isOpen={isReqModalOpen} onClose={handleCloseReqModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text
              whiteSpace="pre-wrap"
              wordBreak="break-word"
              fontSize="sm"
              lineHeight={1.6}
              color={textColor}
            >
              {selectedReq}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={handleCloseReqModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Contact Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} isCentered size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Create New Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Flex gap={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    name="first_name"
                    value={createFormData.first_name}
                    onChange={handleCreateFormChange}
                    placeholder="Enter first name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    name="last_name"
                    value={createFormData.last_name}
                    onChange={handleCreateFormChange}
                    placeholder="Enter last name"
                  />
                </FormControl>
              </Flex>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleCreateFormChange}
                  placeholder="Enter email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Company Name</FormLabel>
                <Input
                  name="company_name"
                  value={createFormData.company_name}
                  onChange={handleCreateFormChange}
                  placeholder="Enter company name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Legal Entity Type</FormLabel>
                <Select
                  name="designation"
                  value={createFormData.designation}
                  onChange={handleCreateFormChange}
                  placeholder="Select Legal Entity Type"
                >
                  {enrollAsData.map((option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {isIndividual && (
                <FormControl>
                  <FormLabel>Select Gender</FormLabel>
                  <RadioGroup
                    name="gender"
                    value={createFormData.gender}
                    onChange={(value) => setCreateFormData((prev) => ({ ...prev, gender: value }))}
                  >
                    <Stack direction="row">
                      <Radio value="male">Male</Radio>
                      <Radio value="female">Female</Radio>
                      <Radio value="Other">Other</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Mobile Number</FormLabel>
                <Box>
                  <PhoneInput
                    country={'in'}
                    value={createFormData.mobile}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: 'mobile',
                      required: true,
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      fontSize: '16px',
                    }}
                  />
                </Box>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Country</FormLabel>
                <Select
                  name="country"
                  value={createFormData.country}
                  onChange={(e) => {
                    setCreateFormData((prev) => ({ ...prev, country: e.target.value }));
                  }}
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  value={createFormData.state}
                  onChange={(e) => {
                    setCreateFormData((prev) => ({ ...prev, state: e.target.value }));
                  }}
                  isDisabled={!createFormData.country || stateOptions.length === 0}
                  placeholder="Select state"
                >
                  {stateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Select
                  name="city"
                  value={createFormData.city}
                  onChange={(e) => {
                    setCreateFormData((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  isDisabled={!createFormData.state || cityOptions.length === 0}
                  placeholder="Select city"
                >
                  {cityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={createFormData.notes}
                  onChange={handleCreateFormChange}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseCreateModal} isDisabled={isCreatingUser}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleCreateFormSubmit}
              isLoading={isCreatingUser}
              loadingText="Creating..."
              isDisabled={
                !createFormData.first_name ||
                !createFormData.last_name ||
                !createFormData.email ||
                !createFormData.mobile ||
                !createFormData.designation ||
                !createFormData.company_name ||
                !createFormData.country ||
                !createFormData.state ||
                !createFormData.city ||
                isCreatingUser
              }
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


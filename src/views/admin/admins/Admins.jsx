import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
  Text,
  useColorModeValue,
  useDisclosure,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  SimpleGrid,
  Stack,
  Badge,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdmins, createAdmin, updateAdmin } from '../../../features/admin/adminsSlice';
import routes from '../../../routes';
import Card from '../../../components/card/Card';

const extractModulesFromRoutes = () => {
  const modules = [];

  const visit = (items, category) => {
    items.forEach((route) => {
      if (route.category && Array.isArray(route.items)) {
        visit(route.items, route.category);
      } else if (route.layout === '/admin' && route.path && !route.hidden) {
        modules.push({
          key: `${route.layout}${route.path}`,
          label: route.name,
          category: category || 'Security',
        });
      }
    });
  };

  // Default all top-level admin routes into "Security" as requested (Dashboard included).
  visit(routes, 'Security');
  const seen = new Set();
  return modules.filter((m) => {
    if (seen.has(m.key)) return false;
    seen.add(m.key);
    return true;
  });
};

const isModuleAllowed = (value) => {
  if (value === true) return true;
  if (!value || typeof value !== 'object') return false;
  return !!(value.view || value.create || value.edit || value.delete);
};

const normalizeToModuleAccessMap = (rawPermissions) => {
  const normalized = {};
  if (!rawPermissions || typeof rawPermissions !== 'object') return normalized;
  Object.keys(rawPermissions).forEach((moduleKey) => {
    normalized[moduleKey] = isModuleAllowed(rawPermissions[moduleKey]);
  });
  return normalized;
};

const groupModulesByCategory = (modules) => {
  const grouped = modules.reduce((acc, m) => {
    const cat = m.category || 'Security';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  // Keep stable order: Security first, then rest alphabetical
  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === 'Security') return -1;
    if (b === 'Security') return 1;
    return a.localeCompare(b);
  });

  categories.forEach((c) => {
    grouped[c] = grouped[c].slice().sort((a, b) => a.label.localeCompare(b.label));
  });

  return { grouped, categories };
};

const Admins = () => {
  const dispatch = useDispatch();
  const { admins, isLoading } = useSelector((state) => state.admins || { admins: [], isLoading: false });
  const { admin: currentAdmin } = useSelector((state) => state.rbac || { admin: null });

  const modules = useMemo(() => extractModulesFromRoutes(), []);
  const { grouped: modulesByCategory, categories } = useMemo(
    () => groupModulesByCategory(modules),
    [modules],
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [permissions, setPermissions] = useState({});
  const [permissionsError, setPermissionsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('white', 'navy.800');
  const tableHeaderBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingAdmin(null);
    setEmail('');
    setEmailError('');
    setPermissions({});
    setPermissionsError('');
    onOpen();
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEmail(admin.email || '');
    setEmailError('');
    setPermissions(normalizeToModuleAccessMap(admin.permissions || {}));
    setPermissionsError('');
    onOpen();
  };

  const handleToggleModuleAccess = (moduleKey) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleToggleSelectAll = () => {
    const allEnabled = modules.length > 0 && modules.every((m) => permissions[m.key] === true);
    if (allEnabled) {
      setPermissions({});
      return;
    }
    const next = {};
    modules.forEach((m) => {
      next[m.key] = true;
    });
    setPermissions(next);
  };

  const validate = () => {
    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    const hasAnyPermission = Object.values(permissions).some((v) => v === true);
    if (!hasAnyPermission) {
      setPermissionsError('At least one permission must be selected');
      valid = false;
    } else {
      setPermissionsError('');
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        email,
        permissions,
      };
      if (editingAdmin) {
        await dispatch(updateAdmin({ adminId: editingAdmin.id, data: payload })).unwrap();
      } else {
        await dispatch(createAdmin(payload)).unwrap();
      }
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  const renderPermissionsSummary = (admin) => {
    const perms = admin.permissions || {};
    const moduleLabels = Object.keys(perms).filter((k) => isModuleAllowed(perms[k]));
    if (!moduleLabels.length) return <Text fontSize="sm" color="gray.500">No permissions</Text>;

    const chips = moduleLabels.slice(0, 3).map((key) => {
      const module = modules.find((m) => m.key === key);
      const label = module ? module.label : key;
      return (
        <Tag key={key} size="sm" mr={1} mb={1} borderRadius="full" colorScheme="purple">
          {label}
        </Tag>
      );
    });

    const remaining = moduleLabels.length - 3;

    return (
      <HStack spacing={1} flexWrap="wrap" alignItems="center">
        {chips}
        {remaining > 0 && (
          <Badge colorScheme="gray" fontSize="0.7rem">
            +{remaining} more
          </Badge>
        )}
      </HStack>
    );
  };

  const isSelectAllChecked = modules.length > 0 && modules.every((m) => permissions[m.key] === true);

  if (!currentAdmin) {
    return (
      <Flex align="center" justify="center" minH="200px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <>
      <Box>
        <Card bg={bgColor}>
          <Box p="12px">
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={3} mb="10px" flexWrap="wrap">
            <Text color={textColor} fontSize="l" fontWeight="700" mb="0">
              Admins
            </Text>
            <Button
              size="sm"
              colorScheme="brand"
              onClick={openCreateModal}
              whiteSpace="nowrap"
            >
              Create Admin
            </Button>
          </Flex>

          {isLoading && (!admins || admins.length === 0) ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <Box
              h={{ base: 'calc(100vh - 160px)', md: 'calc(100vh - 130px)', xl: 'calc(100vh - 130px)' }}
              overflowY="auto"
              overflowX="auto"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="8px"
            >
              <Table variant="simple" color="gray.500" minW="900px">
                <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                  <Tr>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                      Email
                    </Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                      Permissions
                    </Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                      Created At
                    </Th>
                    <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(!admins || admins.length === 0) ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py="40px">
                        <Text color="black">No admins found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    admins.map((admin, index) => {
                      const isOddRow = index % 2 === 0;
                      return (
                        <Tr key={admin.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">{admin.email}</Text>
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            {renderPermissionsSummary(admin)}
                          </Td>
                          <Td borderColor={borderColor} pt="8px" pb="8px">
                            <Text color={textColor} fontSize="sm" fontWeight="normal">
                              {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '--'}
                            </Text>
                          </Td>
                          <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                            <Tooltip label="Edit admin">
                              <Button size="sm" variant="ghost" onClick={() => openEditModal(admin)}>
                                <Icon as={EditIcon} />
                              </Button>
                            </Tooltip>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
          </Box>
        </Card>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent maxW={{ base: '95vw', md: '840px' }}>
          <ModalHeader>
            {editingAdmin ? 'Edit Admin' : 'Create Admin'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!emailError}>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
              </FormControl>

              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <FormLabel mb={0}>Assign Permissions</FormLabel>
                  <Checkbox isChecked={isSelectAllChecked} onChange={handleToggleSelectAll}>
                    Select All
                  </Checkbox>
                </Flex>
                {permissionsError && (
                  <Text fontSize="xs" color="red.500" mb={2}>
                    {permissionsError}
                  </Text>
                )}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                  maxH={{ base: '55vh', md: '520px' }}
                  overflowY="auto"
                >
                  <Box bg={tableHeaderBg} px={3} py={2}>
                    <SimpleGrid columns={2} spacing={2} fontSize="sm" fontWeight="semibold">
                      <Box>Module</Box>
                      <Box textAlign="right">Access</Box>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    {categories.map((category) => (
                      <Box key={category} borderTopWidth="1px" _first={{ borderTopWidth: 0 }}>
                        <Box px={3} py={2} bg={tableHeaderBg}>
                          <Text fontSize="sm" fontWeight="bold">
                            {category}
                          </Text>
                        </Box>
                        {modulesByCategory[category].map((module) => {
                          const checked = permissions[module.key] === true;
                          return (
                            <Box
                              key={module.key}
                              px={3}
                              py={2.5}
                              _notLast={{ borderBottomWidth: '1px' }}
                            >
                              <SimpleGrid columns={2} spacing={2} alignItems="center" fontSize="sm">
                                <Text noOfLines={1}>{module.label}</Text>
                                <Checkbox
                                  justifySelf="end"
                                  isChecked={checked}
                                  onChange={() => handleToggleModuleAccess(module.key)}
                                />
                              </SimpleGrid>
                            </Box>
                          );
                        })}
                      </Box>
                    ))}

                    {modules.length === 0 && (
                      <Box px={3} py={3}>
                        <Text fontSize="xs" color="gray.500">
                          No modules found from routes configuration.
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={editingAdmin ? 'Saving...' : 'Creating...'}
            >
              {editingAdmin ? 'Save Changes' : 'Create Admin'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Admins;


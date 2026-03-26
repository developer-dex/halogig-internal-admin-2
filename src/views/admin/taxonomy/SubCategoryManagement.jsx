import React, { useEffect, useDeferredValue, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Spinner,
  useColorModeValue,
  useDisclosure,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { MdAdd, MdChevronLeft, MdChevronRight, MdDelete, MdEdit } from "react-icons/md";
import { deleteApi, getApi, postApi, putApi } from "../../../services/api";
import { apiEndPoints } from "../../../config/path";
import { showError, showSuccess } from "../../../helpers/messageHelper";

export default function SubCategoryManagement() {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("#FFFFFF", "black");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(50);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", categoryId: "" });

  const createModal = useDisclosure();

  const deleteConfirm = useDisclosure();
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const fetchCategoriesForDropdown = async () => {
    if (categories.length > 0) return;
    setIsLoadingCategories(true);
    try {
      const url = `${apiEndPoints.CATEGORY_MANAGEMENT_CATEGORIES}?page=1&limit=500&search=${encodeURIComponent("")}`;
      const resp = await getApi(url);
      const payload = resp?.data?.data || {};
      setCategories(Array.isArray(payload.categories) ? payload.categories : []);
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const url = `${apiEndPoints.SUBCATEGORY_MANAGEMENT_SUB_CATEGORIES}?page=${page}&limit=${pageLimit}&search=${encodeURIComponent(
        deferredSearch || ""
      )}`;
      const resp = await getApi(url);
      const payload = resp?.data?.data || {};

      const newRows = Array.isArray(payload.sub_categories) ? payload.sub_categories : [];
      const newTotal = typeof payload.total_count === "number" ? payload.total_count : 0;

      setRows(newRows);
      setTotalCount(newTotal);

      const totalPages = Math.ceil(newTotal / pageLimit) || 1;
      if (page > totalPages) setPage(totalPages);
    } catch (e) {
      setRows([]);
      setTotalCount(0);
      showError(e?.response?.data?.message || "Failed to fetch sub-categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageLimit, deferredSearch]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageLimit) || 1, [totalCount, pageLimit]);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10), [
    totalPages,
  ]);

  const openCreate = async () => {
    setEditingId(null);
    setFormData({ name: "", categoryId: "" });
    await fetchCategoriesForDropdown();
    createModal.onOpen();
  };

  const openEdit = async (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name || "",
      categoryId: row.categoryId ? String(row.categoryId) : "",
    });
    await fetchCategoriesForDropdown();
    createModal.onOpen();
  };

  const closeModal = () => {
    createModal.onClose();
    setEditingId(null);
    setFormData({ name: "", categoryId: "" });
  };

  const handleSubmit = async () => {
    const name = formData.name?.trim() || "";
    const categoryId = formData.categoryId ? parseInt(formData.categoryId, 10) : NaN;

    if (!name) {
      showError("Sub-category name is required");
      return;
    }
    if (Number.isNaN(categoryId)) {
      showError("Please select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name, categoryId };
      if (editingId) {
        await putApi(`${apiEndPoints.SUBCATEGORY_MANAGEMENT_SUB_CATEGORIES}/${editingId}`, payload);
        showSuccess("Sub-category updated successfully");
      } else {
        await postApi(apiEndPoints.SUBCATEGORY_MANAGEMENT_SUB_CATEGORIES, payload);
        showSuccess("Sub-category created successfully");
      }
      closeModal();
      fetchList();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to save sub-category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDelete = (row) => {
    setSelectedForDelete(row);
    deleteConfirm.onOpen();
  };

  const closeDelete = () => {
    deleteConfirm.onClose();
    setSelectedForDelete(null);
  };

  const confirmDelete = async () => {
    if (!selectedForDelete) return;
    setIsDeleting(true);
    try {
      await deleteApi(`${apiEndPoints.SUBCATEGORY_MANAGEMENT_SUB_CATEGORIES}/${selectedForDelete.id}`);
      showSuccess("Sub-category deleted successfully");
      closeDelete();
      fetchList();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to delete sub-category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      h={{ base: "calc(100vh - 70px)", md: "calc(100vh - 70px)", xl: "calc(100vh - 70px)" }}
      overflow="hidden"
    >
      <Card bg={bgColor} h="100%" overflow="hidden">
        <Flex direction="column" h="100%" p="12px">
          <Flex justify="space-between" align="center" gap={3} mb={4} flexWrap="nowrap">
            <Text color={textColor} fontSize="l" fontWeight="700" mb="0">
              Sub Categories
            </Text>

            <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={openCreate} size="sm" whiteSpace="nowrap">
              Add Sub Category
            </Button>
          </Flex>

          {isLoading && rows.length === 0 ? (
            <Flex justify="center" align="center" flex="1" minH={0}>
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : (
            <>
              <Box
                flex="1"
                minH={0}
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
                        Category
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" bg={bgColor}>
                        Sub Category
                      </Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="capitalize" textAlign="center" bg={bgColor}>
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={3} textAlign="center" py="40px">
                          <Text color="black">No sub-categories found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((row, index) => {
                        const isOddRow = index % 2 === 0;
                        return (
                          <Tr
                            key={row.id}
                            bg={isOddRow ? "#F4F7FE" : "transparent"}
                            _hover={{ bg: hoverBg }}
                            transition="all 0.2s"
                          >
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {row.category_name || (row.categoryId ? `#${row.categoryId}` : "--")}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} pt="8px" pb="8px">
                              <Text color={textColor} fontSize="sm" fontWeight="normal">
                                {row.name || "--"}
                              </Text>
                            </Td>
                            <Td borderColor={borderColor} textAlign="center" pt="8px" pb="8px">
                              <HStack spacing={2} justify="center">
                                <IconButton
                                  aria-label="Edit sub-category"
                                  icon={<MdEdit />}
                                  size="sm"
                                  variant="ghost"
                                  style={{ color: "rgb(32, 33, 36)" }}
                                  onClick={() => openEdit(row)}
                                />
                                <IconButton
                                  aria-label="Delete sub-category"
                                  icon={<MdDelete />}
                                  size="sm"
                                  variant="ghost"
                                  style={{ color: "rgb(32, 33, 36)" }}
                                  onClick={() => openDelete(row)}
                                />
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
                      _hover={{ borderColor: "brand.500" }}
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    isDisabled={page === 1}
                    variant="outline"
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 10)
                    .map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={page === p ? "solid" : "outline"}
                        colorScheme={page === p ? "brand" : "gray"}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  <IconButton
                    aria-label="Next page"
                    icon={<MdChevronRight />}
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    isDisabled={page === totalPages}
                    variant="outline"
                  />
                </HStack>
              </Flex>
            </>
          )}
        </Flex>
      </Card>

      <Modal isOpen={createModal.isOpen} onClose={closeModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>{editingId ? "Edit Sub Category" : "Create Sub Category"}</ModalHeader>
          <ModalCloseButton />
              <ModalBody>
            <VStack>
              <FormControl isRequired mb={4}>
                <FormLabel fontSize="sm" color={textColor}>
                  Sub-category Name
                </FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter sub-category name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color={textColor}>
                  Category
                </FormLabel>
                <Select
                  placeholder="Select category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  isDisabled={isLoadingCategories || categories.length === 0}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeModal} mr={3} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit} isLoading={isSubmitting} loadingText="Saving">
              {editingId ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteConfirm.isOpen} onClose={closeDelete} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Delete Sub Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.600">
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="700" color="gray.800">
                {selectedForDelete?.name || ""}
              </Text>
              ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeDelete} mr={3} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} isLoading={isDeleting} loadingText="Deleting">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


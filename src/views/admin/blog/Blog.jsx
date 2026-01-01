import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
  Box,
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
  InputGroup,
  InputLeftElement,
  Spinner,
  Flex,
  HStack,
  Tooltip,
  VStack,
  FormControl,
  FormLabel,
  Image,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdDelete,
  MdRefresh,
  MdSearch,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdImage,
  MdVisibility,
  MdArrowBack,
  MdRemove,
} from 'react-icons/md';
import {
  createBlog,
  getAllBlogs,
  deleteBlog,
  getBlogById,
  updateBlog,
} from '../../../features/admin/blogSlice';
import { showError } from '../../../helpers/messageHelper';

export default function Blog() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // View state: 'list', 'create', or 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingBlogId, setEditingBlogId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearchFilter, setDebouncedSearchFilter] = useState('');

  const deleteModal = useDisclosure();
  const viewModal = useDisclosure();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formData, setFormData] = useState({
    title: '',
    blog_slug: '',
    content: '',
    relevant_blogs: [''],
  });

  const pageLimit = 10;

  const { isLoading, createLoading, blogList, totalCount, selectedBlog } = useSelector(
    (state) => state.blog
  );

  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');  
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('#FFFFFF', 'black');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const cardBg = useColorModeValue('white', 'navy.800');
  const contentBgColor = useColorModeValue('gray.50', 'gray.700');

  // Debouncing effect for search filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchFilter(searchFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchFilter]);

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    await dispatch(
      getAllBlogs({
        page: currentPage,
        limit: pageLimit,
        search: debouncedSearchFilter || undefined,
      })
    );
  }, [dispatch, currentPage, pageLimit, debouncedSearchFilter]);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchBlogs();
    }
  }, [fetchBlogs, viewMode]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  };

  // Validate image dimensions
  const validateImageDimensions = (file, requiredWidth, requiredHeight, imageType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Use window.Image to avoid conflict with Chakra UI Image component
        const img = new window.Image();
        img.onload = () => {
          if (img.width !== requiredWidth || img.height !== requiredHeight) {
            reject(new Error(`${imageType} image must be exactly ${requiredWidth}x${requiredHeight} pixels. Current size: ${img.width}x${img.height} pixels`));
          } else {
            resolve(true);
          }
        };
        img.onerror = () => {
          reject(new Error('Failed to load image for validation'));
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image selection
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      // Validate dimensions: 1920x350 for blog image
      try {
        await validateImageDimensions(file, 1920, 400, 'Blog');
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        showError(error.message);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Handle thumbnail image selection
  const handleThumbnailSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        showError('Please select a valid thumbnail image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError('Thumbnail image size must be less than 5MB');
        return;
      }

      // Validate dimensions: 600x400 for thumbnail image
      try {
        await validateImageDimensions(file, 600, 400, 'Thumbnail');
        setSelectedThumbnail(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        showError(error.message);
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = '';
        }
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      blog_slug: '',
      content: '',
      relevant_blogs: [''],
    });
    setEditorState(EditorState.createEmpty());
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  // Handle editor state change
  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    // Convert editor state to HTML
    const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
    handleInputChange('content', htmlContent);
  };

  // Handle relevant blogs changes
  const handleRelevantBlogChange = (index, value) => {
    const newRelevantBlogs = [...formData.relevant_blogs];
    newRelevantBlogs[index] = value;
    setFormData((prev) => ({
      ...prev,
      relevant_blogs: newRelevantBlogs,
    }));
  };

  const addRelevantBlog = () => {
    setFormData((prev) => ({
      ...prev,
      relevant_blogs: [...prev.relevant_blogs, ''],
    }));
  };

  const removeRelevantBlog = (index) => {
    const newRelevantBlogs = formData.relevant_blogs.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      relevant_blogs: newRelevantBlogs,
    }));
  };

  // Handle create blog
  const handleCreateBlog = async () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }

    // Filter out empty relevant blog slugs
    const filteredRelevantBlogs = formData.relevant_blogs
      .map((slug) => (typeof slug === 'string' ? slug.trim() : String(slug)))
      .filter((slug) => slug !== '');

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('blog_slug', formData.blog_slug);
    formDataObj.append('content', formData.content);
    formDataObj.append('relevant_blogs', JSON.stringify(filteredRelevantBlogs));

    if (selectedImage) {
      formDataObj.append('image', selectedImage);
    }

    try {
      const result = await dispatch(createBlog(formDataObj));
      if (result.payload?.data?.success) {
        resetForm();
        setViewMode('list');
        fetchBlogs();
      }
    } catch (error) {
      console.error('Create blog error:', error);
    }
  };

  // Handle update blog
  const handleUpdateBlog = async () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }

    if (!editingBlogId) {
      showError('Blog ID is missing');
      return;
    }

    // Filter out empty relevant blog slugs
    const filteredRelevantBlogs = formData.relevant_blogs
      .map((slug) => (typeof slug === 'string' ? slug.trim() : String(slug)))
      .filter((slug) => slug !== '');

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('blog_slug', formData.blog_slug);
    formDataObj.append('content', formData.content);
    formDataObj.append('relevant_blogs', JSON.stringify(filteredRelevantBlogs));

    // Only append image if a new one is selected
    if (selectedImage) {
      formDataObj.append('image', selectedImage);
    }

    // Only append thumbnail if a new one is selected
    if (selectedThumbnail) {
      formDataObj.append('thumbnail_image', selectedThumbnail);
    }

    try {
      const result = await dispatch(updateBlog({ id: editingBlogId, formData: formDataObj }));
      if (result.payload?.data?.success) {
        resetForm();
        setViewMode('list');
        setEditingBlogId(null);
        fetchBlogs();
      }
    } catch (error) {
      console.error('Update blog error:', error);
    }
  };

  // Handle delete blog
  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      await dispatch(deleteBlog(selectedRecord.id));
      deleteModal.onClose();
      setSelectedRecord(null);
      fetchBlogs();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle view/edit blog - opens form with pre-filled data
  const handleViewDetails = async (record) => {
    try {
      // Fetch full blog details
      await dispatch(getBlogById(record.id));
      setEditingBlogId(record.id);
      setViewMode('edit');
    } catch (error) {
      console.error('Error fetching blog details:', error);
    }
  };

  // Load blog data into form when editing
  useEffect(() => {
    if (viewMode === 'edit' && selectedBlog) {
      // Convert relevant_blogs to array of strings (slugs) for input fields
      const relevantBlogsArray = selectedBlog.relevant_blogs && Array.isArray(selectedBlog.relevant_blogs)
        ? selectedBlog.relevant_blogs.map((slug) => String(slug))
        : [];

      setFormData({
        title: selectedBlog.title || '',
        blog_slug: selectedBlog.blog_slug || '',
        content: selectedBlog.content || '',
        relevant_blogs: relevantBlogsArray.length > 0 ? relevantBlogsArray : [''],
      });
      
      // Convert HTML content to EditorState
      if (selectedBlog.content) {
        try {
          const contentBlock = htmlToDraft(selectedBlog.content);
          if (contentBlock && contentBlock.contentBlocks && contentBlock.contentBlocks.length > 0) {
            const contentState = ContentState.createFromBlockArray(
              contentBlock.contentBlocks,
              contentBlock.entityMap
            );
            const editorState = EditorState.createWithContent(contentState);
            setEditorState(editorState);
          } else {
            setEditorState(EditorState.createEmpty());
          }
        } catch (error) {
          console.error('Error converting HTML to draft:', error);
          setEditorState(EditorState.createEmpty());
        }
      } else {
        setEditorState(EditorState.createEmpty());
      }
      
      // Set existing image preview if available
      if (selectedBlog.image_path) {
        setImagePreview(getImageUrl(selectedBlog.image_path));
        setSelectedImage(null); // Clear new image selection
      } else {
        setImagePreview(null);
        setSelectedImage(null);
      }

      // Set existing thumbnail preview if available
      if (selectedBlog.thumbnail_image) {
        setThumbnailPreview(getImageUrl(selectedBlog.thumbnail_image));
        setSelectedThumbnail(null); // Clear new thumbnail selection
      } else {
        setThumbnailPreview(null);
        setSelectedThumbnail(null);
      }
    } else if (viewMode === 'create') {
      // Reset editor state for create mode
      setEditorState(EditorState.createEmpty());
    }
  }, [viewMode, selectedBlog]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchFilter('');
    setCurrentPage(1);
  };

  // Get image URL - now returns full URL directly from API or null
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If imagePath already contains http/https, return as is (full URL from API)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Fallback for backward compatibility
    return `${process.env.REACT_APP_WEBSITE_API_URL}/blogImages/${imagePath}`;
  };

  // Handle Add Blog click
  const handleAddBlogClick = () => {
    resetForm();
    setViewMode('create');
  };

  // Handle Back to List
  const handleBackToList = () => {
    resetForm();
    setViewMode('list');
    setEditingBlogId(null);
  };

  const totalPages = Math.ceil(totalCount / pageLimit) || 1;

  // Render Create/Edit Form View
  const renderFormView = () => {
    const isEditMode = viewMode === 'edit';
    
    return (
      <Box>
        {/* Header */}
        <Box mb="6px">
          <Box p="8px" ps="12px" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Flex align="center" gap={3}>
              <IconButton
                icon={<MdArrowBack />}
                variant="ghost"
                onClick={handleBackToList}
                aria-label="Back to list"
                size="sm"
              />
              <Text color={textColor} fontSize="xl" fontWeight="700">
                {isEditMode ? 'Edit Blog' : 'Create New Blog'}
              </Text>
            </Flex>
          </Box>
        </Box>

      {/* Form */}
      <Box bg={bgColor} p="20px" borderRadius="12px">
        <VStack spacing={6} align="stretch" w="100%">
          {/* Image Upload */}
          <FormControl>
            <FormLabel fontWeight="600">Blog Image</FormLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="md"
              p={6}
              textAlign="center"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ borderColor: 'brand.500', bg: hoverBg }}
              transition="all 0.2s"
            >
              {imagePreview ? (
                <VStack>
                  <Image src={imagePreview} alt="Preview" maxH="250px" objectFit="contain" borderRadius="md" />
                  <Text fontSize="sm" color="gray.500">Click to change image</Text>
                </VStack>
              ) : (
                <VStack py={4}>
                  <MdImage size={56} color="gray" />
                  <Text fontSize="md" color="gray.600" fontWeight="500">Click to upload image</Text>
                  <Text fontSize="sm" color="gray.400">JPEG, PNG, GIF, WebP (max 5MB)</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>Required size: 1920x350 pixels</Text>
                </VStack>
              )}
            </Box>
          </FormControl>

          {/* Thumbnail Image Upload */}
          <FormControl>
            <FormLabel fontWeight="600">Thumbnail Image</FormLabel>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleThumbnailSelect}
              style={{ display: 'none' }}
            />
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="md"
              p={6}
              textAlign="center"
              cursor="pointer"
              onClick={() => thumbnailInputRef.current?.click()}
              _hover={{ borderColor: 'brand.500', bg: hoverBg }}
              transition="all 0.2s"
            >
              {thumbnailPreview ? (
                <VStack>
                  <Image src={thumbnailPreview} alt="Thumbnail Preview" maxH="200px" objectFit="contain" borderRadius="md" />
                  <Text fontSize="sm" color="gray.500">Click to change thumbnail</Text>
                </VStack>
              ) : (
                <VStack py={4}>
                  <MdImage size={48} color="gray" />
                  <Text fontSize="md" color="gray.600" fontWeight="500">Click to upload thumbnail</Text>
                  <Text fontSize="sm" color="gray.400">JPEG, PNG, GIF, WebP (max 5MB)</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>Required size: 600x400 pixels</Text>
                </VStack>
              )}
            </Box>
            <Text fontSize="xs" color="gray.500" mt={2}>
              A smaller image used for previews and listings (optional)
            </Text>
          </FormControl>

          {/* Title */}
          <FormControl isRequired>
            <FormLabel fontWeight="600">Title</FormLabel>
            <Input
              placeholder="Enter blog title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              size="lg"
              bg={cardBg}
            />
          </FormControl>

          {/* Blog Slug */}
          <FormControl>
            <FormLabel fontWeight="600">Blog Slug</FormLabel>
            <Input
              placeholder="e.g., my-awesome-blog-post"
              value={formData.blog_slug}
              onChange={(e) => handleInputChange('blog_slug', e.target.value)}
              bg={cardBg}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              URL-friendly identifier for the blog (optional)
            </Text>
          </FormControl>

          {/* Content */}
          <FormControl>
            <FormLabel fontWeight="600">Content</FormLabel>
            <Box
              w="100%"
              bg={cardBg}
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
              _focusWithin={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
              minH="400px"
            >
              <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                placeholder="Enter blog content..."
                wrapperStyle={{
                  width: '100%',
                }}
                editorStyle={{
                  minHeight: '350px',
                  padding: '12px',
                  backgroundColor: cardBg,
                }}
                toolbarStyle={{
                  backgroundColor: '#fafafa',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                }}
                toolbar={{
                  options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image', 'remove', 'history'],
                  inline: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                    options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                  },
                  blockType: {
                    inDropdown: true,
                    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                  },
                  fontSize: {
                    options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                  },
                  list: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                    options: ['unordered', 'ordered', 'indent', 'outdent'],
                  },
                  textAlign: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                    options: ['left', 'center', 'right', 'justify'],
                  },
                  link: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    popupClassName: undefined,
                    dropdownClassName: undefined,
                    showOpenOptionOnHover: true,
                    defaultTargetOption: '_self',
                    options: ['link', 'unlink'],
                  },
                  image: {
                    className: undefined,
                    component: undefined,
                    popupClassName: undefined,
                    urlEnabled: true,
                    uploadEnabled: false,
                    alignmentEnabled: true,
                    uploadCallback: undefined,
                    previewImage: false,
                    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                    alt: { present: false, mandatory: false },
                    defaultSize: {
                      height: 'auto',
                      width: 'auto',
                    },
                  },
                }}
              />
            </Box>
          </FormControl>

          {/* Relevant Blogs */}
          <FormControl>
            <FormLabel fontWeight="600">Relevant Blogs</FormLabel>
            <VStack spacing={2} align="stretch">
              {formData.relevant_blogs.map((blogId, index) => (
                <HStack key={index} spacing={2}>
                  <Input
                    placeholder="Enter blog slug"
                    value={blogId}
                    onChange={(e) => handleRelevantBlogChange(index, e.target.value)}
                    bg={cardBg}
                  />
                  <IconButton
                    aria-label="Remove blog"
                    icon={<MdRemove />}
                    onClick={() => removeRelevantBlog(index)}
                    colorScheme="red"
                    variant="outline"
                    size="md"
                    isDisabled={formData.relevant_blogs.length === 1}
                  />
                </HStack>
              ))}
              <Button
                leftIcon={<MdAdd />}
                onClick={addRelevantBlog}
                variant="outline"
                size="sm"
                colorScheme="blue"
                width="fit-content"
              >
                Add Blog
              </Button>
            </VStack>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Add blog slugs that are related to this blog
            </Text>
          </FormControl>

          {/* Action Buttons */}
          <Flex gap={3} pt={4}>
            <Button
              variant="outline"
              onClick={handleBackToList}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={isEditMode ? handleUpdateBlog : handleCreateBlog}
              isLoading={createLoading || isLoading}
              loadingText={isEditMode ? "Updating..." : "Creating..."}
              size="lg"
            >
              {isEditMode ? 'Update Blog' : 'Create Blog'}
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
    );
  };

  // Render List View
  const renderListView = () => (
    <Box>
      {/* Header Section */}
      <Box mb="6px">
        <Box p="8px" ps="12px" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Flex justify="space-between" align="center" mb="8px" flexWrap="wrap" gap={2}>
            <Box>
              <Text color={textColor} fontSize="xl" fontWeight="700" mb="2px">
                Blog Management
              </Text>
            </Box>
          </Flex>

          <Flex gap={2} flexWrap="wrap" align="center">
            <Button
              leftIcon={<MdAdd />}
              variant="outline"
              size="sm"
              onClick={handleAddBlogClick}
              isDisabled={isLoading}
            >
              Add Blog
            </Button>
            <Button
              leftIcon={<MdRefresh />}
              variant="outline"
              size="sm"
              onClick={fetchBlogs}
              isDisabled={isLoading}
            >
              Refresh
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Search Filter */}
      <Box bg={bgColor}>
        <Box p="8px">
          <HStack spacing={2}>
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by title..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                size="sm"
              />
            </InputGroup>
            {searchFilter && (
              <IconButton
                aria-label="Clear search"
                icon={<MdClose />}
                onClick={clearFilters}
                size="sm"
              />
            )}
          </HStack>
        </Box>
      </Box>

      {/* Data Table */}
      <Box bg={bgColor}>
        <Box p="12px">
          {isLoading && blogList.length === 0 ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : blogList.length === 0 ? (
            <Box textAlign="center" py="40px">
              <Text fontSize="lg" color={textColor} mb="8px">
                No blogs found
              </Text>
              <Text fontSize="sm" color={textColor} mb="16px">
                Click "Add Blog" to create your first blog post
              </Text>
              <Button
                leftIcon={<MdAdd />}
                colorScheme="brand"
                onClick={handleAddBlogClick}
              >
                Add Your First Blog
              </Button>
            </Box>
          ) : (
            <>
              <Box
                maxH={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 210px)', xl: 'calc(100vh - 210px)' }}
                overflowY="auto"
                overflowX="auto"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="8px"
              >
                <Table variant="simple" color="gray.500" minW="800px">
                  <Thead position="sticky" top="0" zIndex="1" bg={bgColor}>
                    <Tr>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>ID</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Image</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Title</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" bg={bgColor}>Created At</Th>
                      <Th borderColor={borderColor} color="black" fontSize="xs" fontWeight="700" textTransform="uppercase" textAlign="center" bg={bgColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {blogList.map((row, index) => {
                      // Apply background color to odd rows (1st, 3rd, 5th, etc.)
                      const isOddRow = index % 2 === 0;
                      return (
                        <Tr key={row.id} bg={isOddRow ? '#F4F7FE' : 'transparent'} _hover={{ bg: hoverBg }} transition="all 0.2s">
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" fontWeight="normal">
                            {row.id}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          {row.image_path ? (
                            <Image
                              src={getImageUrl(row.image_path)}
                              alt={row.title}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="md"
                              fallback={<Box boxSize="50px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center"><MdImage size={24} color="gray" /></Box>}
                            />
                          ) : (
                            <Box boxSize="50px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                              <MdImage size={24} color="gray" />
                            </Box>
                          )}
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" fontWeight="normal" noOfLines={2} maxW="300px">
                            {row.title || '-'}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={textColor} fontSize="sm" fontWeight="normal">
                            {formatDate(row.createdAt)}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor} textAlign="center">
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Edit Blog">
                              <IconButton
                                aria-label="Edit"
                                icon={<MdVisibility />}
                                size="sm"
                                style={{ color: 'rgb(32, 33, 36)' }}
                                variant="ghost"
                                onClick={() => handleViewDetails(row)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                aria-label="Delete"
                                icon={<MdDelete />}
                                size="sm"
                                style={{ color: 'rgb(32, 33, 36)' }}
                                variant="ghost"
                                onClick={() => {
                                  setSelectedRecord(row);
                                  deleteModal.onOpen();
                                }}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="space-between" align="center" mt="6px" pt="6px" borderTop="1px solid" borderColor={borderColor}>
                <Text color={textColor} fontSize="sm">
                  Page {currentPage} of {totalPages} ({totalCount} total)
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
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
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
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Are you sure you want to delete this blog?</Text>
            {selectedRecord && (
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>ID:</strong> {selectedRecord.id}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Title:</strong> {selectedRecord.title || 'N/A'}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Blog Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecord && (
              <VStack align="stretch" spacing={4}>
                {/* Image */}
                {selectedRecord.image_path && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={2}>Image</Text>
                    <Image
                      src={getImageUrl(selectedRecord.image_path)}
                      alt={selectedRecord.title}
                      maxH="300px"
                      objectFit="contain"
                      borderRadius="md"
                    />
                  </Box>
                )}

                {/* Title */}
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>Title</Text>
                  <Text fontSize="md" fontWeight="600">{selectedRecord.title || 'N/A'}</Text>
                </Box>

                {/* Blog Slug */}
                {selectedRecord.blog_slug && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Blog Slug</Text>
                    <Text fontSize="sm" fontFamily="monospace" color="blue.500">
                      {selectedRecord.blog_slug}
                    </Text>
                  </Box>
                )}

                {/* Content */}
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>Content</Text>
                  <Box
                    p={3}
                    bg={contentBgColor}
                    borderRadius="md"
                    maxH="300px"
                    overflowY="auto"
                    className="ql-editor"
                    dangerouslySetInnerHTML={{
                      __html: selectedRecord.content || 'No content available'
                    }}
                    sx={{
                      '& p': { marginBottom: '8px' },
                      '& h1, & h2, & h3, & h4, & h5, & h6': { marginTop: '12px', marginBottom: '8px', fontWeight: 'bold' },
                      '& ul, & ol': { paddingLeft: '20px', marginBottom: '8px' },
                      '& a': { color: 'blue.500', textDecoration: 'underline' },
                      '& img': { maxWidth: '100%', height: 'auto' },
                    }}
                  />
                </Box>

                {/* Meta Info */}
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Created At</Text>
                    <Text fontSize="sm">{formatDate(selectedRecord.createdAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Updated At</Text>
                    <Text fontSize="sm">{formatDate(selectedRecord.updatedAt)}</Text>
                  </Box>
                </SimpleGrid>

                {/* Relevant Blogs */}
                {selectedRecord.relevant_blogs && selectedRecord.relevant_blogs.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Relevant Blogs</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {selectedRecord.relevant_blogs.map((blogId, index) => (
                        <Badge key={index} colorScheme="purple">ID: {blogId}</Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={viewModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );

  return (viewMode === 'create' || viewMode === 'edit') ? renderFormView() : renderListView();
}

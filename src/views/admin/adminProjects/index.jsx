import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Text,
    Flex,
    useColorModeValue,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select,
    Input,
    Textarea,
    useDisclosure,
    Spinner,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { MdAdd } from 'react-icons/md';
import { getApi } from 'services/api';
import { apiEndPoints } from 'config/path';
import { showError, showSuccess } from 'helpers/messageHelper';

export default function AdminProjects() {
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        subCategory: '',
        projectCount: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await getApi(apiEndPoints.GET_CATEGORIES);
            if (response?.data?.data) {
                setCategories(response.data.data);
            } else if (response?.data) {
                setCategories(response.data);
            }
        } catch (error) {
            showError('Failed to fetch categories');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            setIsLoading(true);
            const response = await getApi(`${apiEndPoints.GET_SUBCATEGORIES}/${categoryId}`);
            if (response?.data?.data) {
                setSubCategories(response.data.data);
            } else if (response?.data) {
                setSubCategories(response.data);
            }
        } catch (error) {
            showError('Failed to fetch sub-categories');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData({ ...formData, category: categoryId, subCategory: '' });
        if (categoryId) {
            fetchSubCategories(categoryId);
        } else {
            setSubCategories([]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.category || !formData.subCategory || !formData.projectCount || !formData.description) {
            showError('Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);

            // Find category and sub-category names
            const selectedCategory = categories.find(cat => String(cat.id) === String(formData.category));
            const selectedSubCategory = subCategories.find(sub => String(sub.id) === String(formData.subCategory));

            // Get admin data for posted_by_user_id
            const adminDataStr = localStorage.getItem('adminData');
            let adminId = 157; // Default as fallback if not found
            // if (adminDataStr) {
            //     try {
            //         const adminData = JSON.parse(adminDataStr);
            //         adminId = adminData.id || adminData._id || 154;
            //     } catch (e) {
            //         console.error('Error parsing adminData', e);
            //     }
            // }

            const payload = {
                project_category: selectedCategory?.name || '',
                project_category_id: parseInt(formData.category),
                project_sub_category: selectedSubCategory?.name || '',
                project_sub_category_id: parseInt(formData.subCategory),
                number_of_projects: parseInt(formData.projectCount),
                description: formData.description,
                posted_by_user_id: adminId
            };

            console.log('Sending payload:', payload);

            const aiBaseUrl = process.env.REACT_APP_AI_API_ENDPOINT;
            if (!aiBaseUrl) {
                showError("AI API endpoint is not configured (REACT_APP_AI_API_ENDPOINT)");
                return;
            }

            const response = await axios.post(`${aiBaseUrl}/api/generate-projects`, payload);

            if (response.status === 200 || response.status === 201) {
                showSuccess('Projects generated successfully!');
                onClose();
                // Reset form
                setFormData({
                    category: '',
                    subCategory: '',
                    projectCount: '',
                    description: '',
                });
            } else {
                showError(response?.data?.message || 'Failed to generate projects');
            }
        } catch (error) {
            showError(error.response?.data?.message || 'An error occurred while generating projects');
            console.error('API Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Card
                direction='column'
                w='100%'
                px='0px'
                overflowX={{ sm: 'scroll', lg: 'hidden' }}>
                <Flex px='25px' justify='space-between' mb='20px' align='center'>
                    <Text
                        color={textColor}
                        fontSize='22px'
                        fontWeight='700'
                        lineHeight='100%'>
                        Admin Projects
                    </Text>
                    <Button
                        leftIcon={<MdAdd />}
                        colorScheme='brand'
                        variant='solid'
                        onClick={onOpen}>
                        Create Project
                    </Button>
                </Flex>
                <Box px='25px'>
                    <Text color={textColor} fontSize='md'>
                        This is the new Admin Projects section. Content will be added here soon.
                    </Text>
                </Box>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Project</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb="4" isRequired>
                            <FormLabel>Select Category</FormLabel>
                            <Select
                                placeholder="Select category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl mb="4" isRequired>
                            <FormLabel>Select Sub Category</FormLabel>
                            <Select
                                placeholder="Select sub category"
                                value={formData.subCategory}
                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                isDisabled={!formData.category || isLoading}
                            >
                                {subCategories.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </Select>
                            {isLoading && <Spinner size="xs" mt="2" />}
                        </FormControl>

                        <FormControl mb="4" isRequired>
                            <FormLabel>Count of the project</FormLabel>
                            <Input
                                type="number"
                                placeholder="Enter count"
                                value={formData.projectCount}
                                onChange={(e) => setFormData({ ...formData, projectCount: e.target.value })}
                            />
                        </FormControl>

                        <FormControl mb="4" isRequired>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="brand" onClick={handleSubmit} isLoading={isSubmitting}>
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

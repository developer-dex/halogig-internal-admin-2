import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Text,
  Flex,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Checkbox,
  CheckboxGroup,
  Stack,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { postApi } from '../../../services/api';
import { apiEndPoints } from '../../../config/path';
import { showError, showSuccess } from '../../../helpers/messageHelper';
import {
  fetchCategories,
  fetchSubcategories,
  fetchTechnologies,
  fetchIndustries,
  clearSubcategories,
} from '../../../features/admin/dropdownDataSlice';

export default function PostProject() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromClient = location.state || {};

  const { categories, subcategories, technologies, industries, isLoading } = useSelector((s) => s.dropdownDataReducer || {});

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgColor = useColorModeValue('white', 'navy.800');

  const [form, setForm] = useState({
    client_id: fromClient.clientId || fromClient.client?.id || fromClient.id || '',
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    duration_weeks: '',
    category_id: '',
    subcategory_id: '',
    technology_ids: [],
    industry_id: '',
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTechnologies());
    dispatch(fetchIndustries());
  }, [dispatch]);

  useEffect(() => {
    if (!form.category_id) {
      dispatch(clearSubcategories());
      return;
    }
    dispatch(fetchSubcategories(form.category_id));
  }, [dispatch, form.category_id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async () => {
    try {
      if (!form.client_id) {
        showError('Missing client');
        return;
      }
      const payload = {
        client_id: form.client_id,
        title: form.title,
        description: form.description,
        budget_range: { min: Number(form.budget_min) || 0, max: Number(form.budget_max) || 0 },
        duration_weeks: Number(form.duration_weeks) || null,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        technology_ids: form.technology_ids,
        industry_id: form.industry_id || null,
      };
      await postApi(apiEndPoints.UPDATE_PROJECT, payload);
      showSuccess('Project created');
      navigate('/admin/projects');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <Box>
      <Card>
        <Box p="24px">
          <Text color={textColor} fontSize="2xl" fontWeight="700" mb="20px">
            Create Project {fromClient.clientName ? `for ${fromClient.clientName}` : ''}
          </Text>

          {isLoading ? (
            <Flex justify="center" align="center" minH="200px"><Spinner /></Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input name="title" value={form.title} onChange={onChange} placeholder="Enter project title" />
              </FormControl>
              <FormControl>
                <FormLabel>Industry</FormLabel>
                <Select name="industry_id" value={form.industry_id} onChange={onChange} placeholder="Select industry">
                  {industries.map((i) => (
                    <option key={i.id || i._id} value={i.id || i._id}>{i.name || i.title}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
                <FormLabel>Description</FormLabel>
                <Textarea name="description" value={form.description} onChange={onChange} rows={6} placeholder="Describe the project" />
              </FormControl>

              <FormControl>
                <FormLabel>Budget Min</FormLabel>
                <Input type="number" name="budget_min" value={form.budget_min} onChange={onChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Budget Max</FormLabel>
                <Input type="number" name="budget_max" value={form.budget_max} onChange={onChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Duration (weeks)</FormLabel>
                <Input type="number" name="duration_weeks" value={form.duration_weeks} onChange={onChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select name="category_id" value={form.category_id} onChange={onChange} placeholder="Select category">
                  {categories.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name || c.title}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Subcategory</FormLabel>
                <Select name="subcategory_id" value={form.subcategory_id} onChange={onChange} placeholder="Select subcategory">
                  {subcategories.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.title}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
                <FormLabel>Technologies</FormLabel>
                <CheckboxGroup
                  value={form.technology_ids}
                  onChange={(vals) => setForm((f) => ({ ...f, technology_ids: vals }))}
                >
                  <Stack direction="row" wrap="wrap" spacing={4}>
                    {technologies.map((t) => (
                      <Checkbox key={t.id || t._id} value={String(t.id || t._id)}>{t.name || t.title}</Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </SimpleGrid>
          )}

          <Flex mt={8} justify="flex-end" gap={3}>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button colorScheme="brand" onClick={onSubmit}>Create Project</Button>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}



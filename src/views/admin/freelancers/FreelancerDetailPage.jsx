import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdArrowBack } from 'react-icons/md';
import { freelancerCompleteData } from 'features/admin/freelancerManagementSlice';
import { FreelancerDetailContent } from './FreelancerList';

export default function FreelancerDetailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: userIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);

  const pageBg = useColorModeValue('gray.50', 'navy.900');
  const cardWrapBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const isEditMode = searchParams.get('edit') === '1';

  const {
    completeData,
    completeDataLoading,
    completeDataError,
  } = useSelector((s) => s.freelancerDataReducer || {});

  const backPath = useMemo(() => {
    const from = location.state?.from;
    if (typeof from === 'string' && from.startsWith('/admin')) return from;
    return '/admin/freelancers-management';
  }, [location.state]);

  const breadcrumbParentLabel = useMemo(() => {
    if (backPath.includes('referral-partners')) return 'Referral Partners';
    if (backPath.includes('freelancers-management')) return 'Freelancers';
    return 'Freelancers';
  }, [backPath]);

  useEffect(() => {
    if (!userIdParam) return;
    dispatch(freelancerCompleteData({ userId: userIdParam }));
  }, [dispatch, userIdParam]);

  useEffect(() => {
    setTabIndex(0);
  }, [userIdParam, isEditMode]);

  const displayName = useMemo(() => {
    const u = completeData?.primaryIntroduction?.user;
    if (!u) return '';
    return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  }, [completeData]);

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <Box  bg={pageBg} p={4}>
      {/* <Container maxW="container.xl" px={{ base: 4, md: 6 }}> */}
        {/* <Breadcrumb fontSize="sm" color="gray.500" mb={4} spacing={1} separator="/">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={handleBack} cursor="pointer">
              {breadcrumbParentLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text as="span" color="gray.600" fontWeight="medium">
              {isEditMode ? 'Edit profile' : 'Profile'}
            </Text>
          </BreadcrumbItem>
        </Breadcrumb> */}
          <Button
            leftIcon={<MdArrowBack />}
            variant="ghost"
            // alignSelf={{ base: 'flex-start', sm: 'center' }}
            onClick={handleBack}
            // size="lg"
          >
            {/* Back to list */}
          </Button>

        <Box
          bg={cardWrapBg}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          p={{ base: 4, md: 4, lg: 4 }}
        >
          {completeDataLoading ? (
            <Flex py={16} align="center" justify="center" gap={3} direction="column">
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text color="gray.500">Loading profile…</Text>
            </Flex>
          ) : completeDataError ? (
            <Flex py={16} align="center" justify="center" direction="column" gap={3}>
              <Text color="red.500" fontWeight="semibold">
                Failed to load freelancer details
              </Text>
              <Text color="gray.500" fontSize="sm">
                Please try again or go back to the list.
              </Text>
              <Button colorScheme="brand" variant="outline" onClick={handleBack}>
                Back to list
              </Button>
            </Flex>
          ) : !completeData || Object.keys(completeData).length === 0 ? (
            <Flex py={16} align="center" justify="center">
              <Text color="gray.500">No details available</Text>
            </Flex>
          ) : (
            <FreelancerDetailContent
              completeData={completeData}
              tabIndex={tabIndex}
              onTabChange={setTabIndex}
              isEditMode={isEditMode}
              userId={userIdParam}
              detailVariant="page"
            />
          )}
        </Box>
      {/* </Container> */}
    </Box>
  );
}

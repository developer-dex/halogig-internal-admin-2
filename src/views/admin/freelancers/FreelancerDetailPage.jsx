import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { freelancerCompleteData } from 'features/admin/freelancerManagementSlice';
import { FreelancerDetailContent } from './FreelancerList';
import './freelancerDetailPage.css';

export default function FreelancerDetailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: userIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);

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

  useEffect(() => {
    if (!userIdParam) return;
    dispatch(freelancerCompleteData({ userId: userIdParam }));
  }, [dispatch, userIdParam]);

  useEffect(() => {
    setTabIndex(0);
  }, [userIdParam, isEditMode]);

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <div className="fdp-page-wrapper">
      {/* Back button */}
      <button className="fdp-back-btn" onClick={handleBack} type="button">
        <IoMdArrowRoundBack size={15} />
        Back
      </button>

      {/* Main card */}
      <div className="fdp-card-wrap">
        {completeDataLoading ? (
          <div className="fdp-loading-state">
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text color="gray.500" fontSize="sm">Loading profile…</Text>
          </div>
        ) : completeDataError ? (
          <div className="fdp-empty-state">
            <Text color="red.500" fontWeight="semibold">Failed to load freelancer details</Text>
            <Text color="gray.500" fontSize="sm">Please try again or go back to the list.</Text>
            <Button mt={3} colorScheme="brand" variant="outline" size="sm" onClick={handleBack}>
              Back to list
            </Button>
          </div>
        ) : !completeData || Object.keys(completeData).length === 0 ? (
          <div className="fdp-empty-state">
            <Text color="gray.500">No details available</Text>
          </div>
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
      </div>
    </div>
  );
}

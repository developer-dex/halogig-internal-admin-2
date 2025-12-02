import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  PinInput,
  PinInputField,
  HStack,
} from '@chakra-ui/react';
import { verifyOtp, clearLoginState } from '../../../features/auth/loginSlice';
import logo from 'assets/img/logo/logo.png';

function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoading, isSuccess, isError, responseData } = useSelector(
    (state) => state.loginDataReducer
  );

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const pinInputRef = useRef(null);

  const textColor = useColorModeValue('black', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('black', 'secondaryGray.600');

  useEffect(() => {
    // Get email from location state
    const emailFromState = location.state?.email;
    if (!emailFromState) {
      // If no email in state, redirect to login
      navigate('/auth/sign-in');
      return;
    }
    setEmail(emailFromState);
  }, [location, navigate]);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isAdminLogIn');
    if (isLoggedIn === 'true') {
      navigate('/admin/default');
    }
  }, [navigate]);

  useEffect(() => {
    if (isSuccess && responseData?.token) {
      // Store token and admin data in localStorage
      localStorage.setItem('adminToken', responseData.token);
      localStorage.setItem('adminData', JSON.stringify(responseData.admin));
      localStorage.setItem('isAdminLogIn', 'true');
      
      // Clear the stored OTP
      localStorage.removeItem('tempOtp');
      localStorage.removeItem('tempEmail');
      
      // Navigate to dashboard
      navigate('/admin/default');
    }
  }, [isSuccess, responseData, navigate]);

  const handleOtpChange = (value) => {
    setOtp(value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      dispatch(verifyOtp({
        email,
        otp
      }));
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  const handleResendOtp = () => {
    // Navigate back to sign-in to resend OTP
    dispatch(clearLoginState());
    navigate('/auth/sign-in', { state: { email } });
  };

  return (
    <Flex
      minH='100vh'
      w='100%'
      bg='#F2F6FC'
      alignItems='center'
      justifyContent='center'
      px={{ base: '25px', md: '0px' }}
      flexDirection='column'>
      <Box
        w={{ base: '100%', md: 'max-content' }}
        maxW='100%'
        mx='auto'
        style={{ 
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          padding: '20px',
          borderRadius: '15px'
        }}>
        <Box textAlign='center' mb='36px'>
          <Image 
            src={logo} 
            alt="HaloGig Logo" 
            h='auto' 
            w='140px' 
            maxH='30px'
            mx='auto'
            mb='24px'
            objectFit='contain'
          />
          <Heading color={textColor} fontSize='20px' mb='10px'>
            Two-Factor Authentication
          </Heading>
          <Text
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            Enter the 6-digit code sent to {email}
          </Text>
        </Box>
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: '100%', md: '420px' }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx='auto'>
          
          {isError && (
            <Alert status='error' mb='24px' borderRadius='15px'>
              <AlertIcon />
              {error || 'Invalid or expired OTP. Please try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction='column' alignItems='center' mb='24px'>
              <HStack spacing='12px' mb='8px'>
                <PinInput 
                  otp 
                  size='lg' 
                  value={otp} 
                  onChange={handleOtpChange}
                  isDisabled={isLoading}
                  ref={pinInputRef}
                  autoFocus>
                  <PinInputField 
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      textAlign: 'center',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <PinInputField 
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      textAlign: 'center',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <PinInputField 
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      textAlign: 'center',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <PinInputField 
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      textAlign: 'center',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <PinInputField 
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      textAlign: 'center',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <PinInputField 
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      textAlign: 'center',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                </PinInput>
              </HStack>
              {error && (
                <Text color='red.500' fontSize='sm' mt='8px'>
                  {error}
                </Text>
              )}
            </Flex>
            
            <Button
              fontSize='sm'
              fontWeight='500'
              w='100%'
              h='50px'
              mb='16px'
              type='submit'
              isLoading={isLoading}
              style={{ background: 'linear-gradient(#c3362a 0, #92150d 74%)', color: 'white' }}
              loadingText='Verifying...'
              spinner={<Spinner size='sm' />}>
              Verify Code
            </Button>

            <Flex justifyContent='center' alignItems='center'>
              <Text fontSize='sm' color={textColorSecondary} mr='4px'>
                Didn't receive the code?
              </Text>
              <Button
                variant='link'
                fontSize='sm'
                color='#c3362a'
                fontWeight='500'
                onClick={handleResendOtp}
                isDisabled={isLoading}>
                Resend
              </Button>
            </Flex>
          </form>
        </Flex>
      </Box>
      
      <Flex
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        maxW='100%'
        mt='30px'>
        <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
          © 2024 HaloGig Admin Panel. All rights reserved.
        </Text>
      </Flex>
    </Flex>
  );
}

export default VerifyOtp;


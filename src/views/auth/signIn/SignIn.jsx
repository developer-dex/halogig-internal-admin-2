import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { adminLogin } from '../../../features/auth/loginSlice';
import DefaultAuth from 'layouts/auth/Default';
import logo from 'assets/img/logo/logo.png';

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, isSuccess, isError, responseData } = useSelector(
    (state) => state.loginDataReducer
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);

  const textColor = useColorModeValue('black', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('black', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('black', 'white');
  const brandStars = useColorModeValue('black', 'brand.400');

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isAdminLogIn');
    if (isLoggedIn === 'true') {
      navigate('/admin/default');
    }
  }, [navigate]);

  useEffect(() => {
    if (isSuccess && responseData?.requiresOtp) {
      // Store OTP temporarily for verification
      localStorage.setItem('tempOtp', responseData.otp);
      localStorage.setItem('tempEmail', responseData.email);
      
      // Navigate to OTP verification page
      navigate('/auth/verify-otp', { state: { email: responseData.email } });
    } else if (isSuccess && responseData?.token) {
      // Direct login (if 2FA is disabled or bypassed)
      localStorage.setItem('adminToken', responseData.token);
      localStorage.setItem('adminData', JSON.stringify(responseData.admin));
      localStorage.setItem('isAdminLogIn', 'true');
      
      // Navigate to dashboard
      navigate('/admin/default');
    }
  }, [isSuccess, responseData, navigate]);

  const handleClick = () => setShow(!show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      dispatch(adminLogin({
        email: formData.email,
        password: formData.password
      }));
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <>
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
            Brain In Progress
            </Heading>
            {/* <Text
              color={textColorSecondary}
              fontWeight='400'
              fontSize='md'>
              Enter your email and password to sign in!
            </Text> */}
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
                Invalid credentials. Please try again.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.email} mb='24px'>
                <FormLabel
                  display='flex'
                  ms='4px'
                  fontSize='sm'
                  fontWeight='500'
                  color={textColor}
                  mb='8px'>
                  Login<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant='auth'
                  fontSize='sm'
                  ms={{ base: '0px', md: '0px' }}
                  type='email'
                  name='email'
                  placeholder='mail@example.com'
                  fontWeight='500'
                  size='lg'
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete='email'
                  autoFocus
                />
                {errors.email && (
                  <Text color='red.500' fontSize='sm' mt='8px'>
                    {errors.email}
                  </Text>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.password} mb='24px'>
                <FormLabel
                  ms='4px'
                  fontSize='sm'
                  fontWeight='500'
                  color={textColor}
                  display='flex'>
                  Password<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size='lg'>
                  <Input
                    isRequired={true}
                    fontSize='sm'
                    placeholder='Min. 6 characters'
                    name='password'
                    size='lg'
                    type={show ? 'text' : 'password'}
                    variant='auth'
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete='current-password'
                  />
                  <InputRightElement display='flex' alignItems='center' mt='4px'>
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: 'pointer' }}
                      as={show ? MdOutlineRemoveRedEye: RiEyeCloseLine }
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <Text color='red.500' fontSize='sm' mt='8px'>
                    {errors.password}
                  </Text>
                )}
              </FormControl>
              <Button
                fontSize='sm'
                // variant='brand'
                fontWeight='500'
                w='30%'
                // w="fit-content"
                h='40px'
                mb='10px'
                type='submit'
                isLoading={isLoading}
                style={{ background: 'linear-gradient(#c3362a 0, #92150d 74%)', color: 'white' }}
                loadingText='Signing in...'
                spinner={<Spinner size='sm' />}>
                Sign In
              </Button>
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
    </>
  );
}

export default SignIn;

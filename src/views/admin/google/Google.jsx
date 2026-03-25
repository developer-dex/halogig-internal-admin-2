import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLinkIcon, RepeatIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaGoogle } from 'react-icons/fa';
import Card from 'components/card/Card';
import { getApi, postApi } from 'services/api';
import { apiEndPoints } from 'config/path';
import { showError, showSuccess } from 'helpers/messageHelper';

function maskToken(token) {
  if (!token) {
    return 'Not available';
  }

  if (token.length <= 12) {
    return token;
  }

  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function DetailRow({
  label,
  value,
  maskedValue,
  canToggle = false,
  isVisible = false,
  onToggle,
}) {
  const labelColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const valueColor = useColorModeValue('secondaryGray.900', 'white');

  return (
    <Flex
      py="12px"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.100', 'whiteAlpha.100')}
      align="center"
      justify="space-between"
      gap="16px"
      wrap="wrap"
    >
      <Text color={labelColor} fontWeight="600" minW="160px">
        {label}
      </Text>
      <Flex align="center" gap="10px" flex="1" justify="flex-end">
        <Text
          color={valueColor}
          fontFamily={canToggle ? 'mono' : 'inherit'}
          wordBreak="break-all"
          textAlign="right"
        >
          {canToggle ? (isVisible ? value : maskedValue) : value}
        </Text>
        {canToggle && value ? (
          <IconButton
            aria-label={isVisible ? 'Hide token value' : 'Show token value'}
            icon={isVisible ? <ViewOffIcon /> : <ViewIcon />}
            size="sm"
            variant="ghost"
            onClick={onToggle}
          />
        ) : null}
      </Flex>
    </Flex>
  );
}

export default function Google() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const mutedColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const subtleBg = useColorModeValue('gray.50', 'navy.800');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100');

  const [authUrl, setAuthUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [tokenDetails, setTokenDetails] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [loadingTokenDetails, setLoadingTokenDetails] = useState(true);
  const [savingToken, setSavingToken] = useState(false);
  const [regeneratingToken, setRegeneratingToken] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);

  const fetchTokenDetails = useCallback(async () => {
    try {
      setLoadingTokenDetails(true);
      const response = await getApi(apiEndPoints.GOOGLE_TOKEN_DETAILS);
      setTokenDetails(response?.data?.data || null);
    } catch (error) {
      setTokenDetails(null);
      showError(error?.response?.data?.message || 'Failed to fetch Google token details');
    } finally {
      setLoadingTokenDetails(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenDetails();
  }, [fetchTokenDetails]);

  const handleGenerateUrl = async () => {
    try {
      setLoadingUrl(true);
      const response = await getApi(apiEndPoints.GOOGLE_AUTHORIZE);
      const data = response?.data || {};

      setAuthUrl(data.url || '');
      showSuccess('Authorization URL generated successfully');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to generate Google authorization URL');
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleCopy = async (value, successMessage) => {
    if (!value) {
      showError('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showSuccess(successMessage);
    } catch (error) {
      showError('Failed to copy value');
    }
  };

  const handleSaveToken = async () => {
    const trimmedCode = authCode.trim();

    if (!trimmedCode) {
      showError('Please paste the Google authorization code');
      return;
    }

    try {
      setSavingToken(true);
      const response = await postApi(apiEndPoints.GOOGLE_GENERATE_TOKENS, {
        code: trimmedCode,
      });

      setAuthCode('');
      setShowAccessToken(false);
      setShowRefreshToken(false);
      await fetchTokenDetails();
      showSuccess(response?.data?.message || 'Google token generated successfully');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to generate Google token');
    } finally {
      setSavingToken(false);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      setRegeneratingToken(true);
      await postApi(apiEndPoints.GOOGLE_CLEAR_TOKENS, {});
      setTokenDetails(null);
      setAuthCode('');
      setShowAccessToken(false);
      setShowRefreshToken(false);
      await handleGenerateUrl();
      await fetchTokenDetails();
      showSuccess('Previous token cleared. Generate a new Google token now.');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to regenerate Google token');
    } finally {
      setRegeneratingToken(false);
    }
  };

  const tokenStatus = useMemo(() => {
    if (!tokenDetails) {
      return {
        label: 'Not Saved',
        colorScheme: 'gray',
      };
    }

    if (tokenDetails.is_expired) {
      return {
        label: 'Expired',
        colorScheme: 'red',
      };
    }

    return {
      label: 'Active',
      colorScheme: 'green',
    };
  }, [tokenDetails]);

  return (
    <Box pt={{ base: '80px', md: '40px', xl: '40px' }}>
      <Stack spacing="24px">
        <Card p="28px">
          <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap="16px" wrap="wrap">
            <Box>
              <Flex align="center" gap="10px" mb="10px">
                <Icon as={FaGoogle} boxSize={6} color="#4285F4" />
                <Text color={textColor} fontSize="24px" fontWeight="700">
                  Google
                </Text>
              </Flex>
              <Text color={mutedColor}>
                Generate the authorization URL, paste the callback code, and manage the stored Google organizer token.
              </Text>
            </Box>
            <Badge colorScheme={tokenStatus.colorScheme} px="12px" py="6px" borderRadius="full">
              {tokenStatus.label}
            </Badge>
          </Flex>
        </Card>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="24px">
          <Card p="28px">
            <Stack spacing="18px">
              <Box>
                <Text color={textColor} fontSize="20px" fontWeight="700">
                  Step 1: Authorization URL
                </Text>
                <Text color={mutedColor} mt="6px">
                  Generate the Google authorization URL, copy it, or open it in a new tab.
                </Text>
              </Box>

              <Button
                colorScheme="blue"
                onClick={handleGenerateUrl}
                isLoading={loadingUrl}
                loadingText="Generating URL"
                alignSelf="flex-start"
              >
                Generate Authorization URL
              </Button>

              <FormControl>
                <FormLabel color={mutedColor}>Authorization URL</FormLabel>
                <Input
                  value={authUrl}
                  readOnly
                  placeholder="Generate URL to display it here"
                  bg={subtleBg}
                />
              </FormControl>

              <Flex gap="12px" wrap="wrap">
                <Button variant="outline" onClick={() => handleCopy(authUrl, 'Authorization URL copied')}>
                  Copy URL
                </Button>
                <Button
                  rightIcon={<ExternalLinkIcon />}
                  onClick={() => window.open(authUrl, '_blank', 'noopener,noreferrer')}
                  isDisabled={!authUrl}
                >
                  Open URL
                </Button>
              </Flex>
            </Stack>
          </Card>

          <Card p="28px">
            <Stack spacing="18px">
              <Box>
                <Text color={textColor} fontSize="20px" fontWeight="700">
                  Step 2: Save Access Token
                </Text>
                <Text color={mutedColor} mt="6px">
                  Paste the Google callback code here to generate the access token and save it in the database.
                </Text>
              </Box>

              <FormControl>
                <FormLabel color={mutedColor}>Authorization Code</FormLabel>
                <InputGroup>
                  <Input
                    value={authCode}
                    onChange={(event) => setAuthCode(event.target.value)}
                    placeholder="Paste the Google authorization code"
                    bg={subtleBg}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(authCode, 'Authorization code copied')}
                    >
                      Copy
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Flex gap="12px" wrap="wrap">
                <Button
                  colorScheme="blue"
                  onClick={handleSaveToken}
                  isLoading={savingToken}
                  loadingText="Saving token"
                >
                  Generate Token And Save
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<RepeatIcon />}
                  onClick={handleRegenerateToken}
                  isLoading={regeneratingToken}
                  loadingText="Regenerating"
                >
                  Regenerate Access Token
                </Button>
              </Flex>
            </Stack>
          </Card>
        </SimpleGrid>

        <Card p="28px">
          <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap="12px" wrap="wrap" mb="18px">
            <Box>
              <Text color={textColor} fontSize="20px" fontWeight="700">
                Current Token Details
              </Text>
              <Text color={mutedColor} mt="6px">
                Review the stored token, expiry date, and last update details.
              </Text>
            </Box>
            <Button variant="outline" onClick={fetchTokenDetails} isLoading={loadingTokenDetails}>
              Refresh Details
            </Button>
          </Flex>

          {loadingTokenDetails ? (
            <Flex py="40px" justify="center">
              <Spinner size="lg" />
            </Flex>
          ) : !tokenDetails ? (
            <Box p="20px" borderRadius="16px" bg={subtleBg} borderWidth="1px" borderColor={borderColor}>
              <Text color={textColor} fontWeight="600">
                No Google token saved yet
              </Text>
              <Text color={mutedColor} mt="4px">
                Generate the authorization URL, paste the code, and save the token to see details here.
              </Text>
            </Box>
          ) : (
            <Box>
              <DetailRow
                label="Access Token"
                value={tokenDetails.has_access_token ? 'Available' : 'Not available'}
                maskedValue={tokenDetails.has_access_token ? 'Available' : 'Not available'}
              />
              <DetailRow
                label="Refresh Token"
                value={tokenDetails.has_refresh_token ? 'Available' : 'Not available'}
                maskedValue={tokenDetails.has_refresh_token ? 'Available' : 'Not available'}
              />
              <DetailRow
                label="Expiry Date"
                value={formatDateTime(tokenDetails.expires_at)}
              />
              <DetailRow
                label="Status"
                value={tokenDetails.is_expired ? 'Expired' : 'Active'}
              />
              <DetailRow
                label="Active"
                value={tokenDetails.is_active !== false ? 'Yes' : 'No'}
              />
            </Box>
          )}
        </Card>
      </Stack>
    </Box>
  );
}


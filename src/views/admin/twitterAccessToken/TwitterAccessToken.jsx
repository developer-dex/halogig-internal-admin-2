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
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card';
import { getApi, postApi, patchApi } from 'services/api';
import { apiEndPoints } from 'config/path';
import { showError, showSuccess } from 'helpers/messageHelper';
import { FaTwitter } from 'react-icons/fa';

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

export default function TwitterAccessToken() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const mutedColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const subtleBg = useColorModeValue('gray.50', 'navy.800');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100');

  const [accessToken, setAccessToken] = useState('');
  const [accessTokenSecret, setAccessTokenSecret] = useState('');

  const [tokenDetails, setTokenDetails] = useState(null);
  const [loadingTokenDetails, setLoadingTokenDetails] = useState(true);

  const [savingToken, setSavingToken] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showAccessSecret, setShowAccessSecret] = useState(false);

  const fetchTokenDetails = useCallback(async () => {
    try {
      setLoadingTokenDetails(true);
      const response = await getApi(apiEndPoints.TWITTER_TOKEN_DETAILS);
      setTokenDetails(response?.data?.data || null);
    } catch (error) {
      setTokenDetails(null);
      showError(error?.response?.data?.message || 'Failed to fetch Twitter token details');
    } finally {
      setLoadingTokenDetails(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenDetails();
  }, [fetchTokenDetails]);

  const tokenStatus = useMemo(() => {
    if (!tokenDetails) {
      return {
        label: 'Not Saved',
        colorScheme: 'gray',
      };
    }

    if (tokenDetails.is_active === false) {
      return {
        label: 'Disabled',
        colorScheme: 'red',
      };
    }

    return {
      label: 'Active',
      colorScheme: 'green',
    };
  }, [tokenDetails]);

  const handleSaveTokens = async () => {
    const token = accessToken.trim();
    const secret = accessTokenSecret.trim();

    if (!token || !secret) {
      showError('Access Token and Access Token Secret are required');
      return;
    }

    try {
      setSavingToken(true);
      const response = await postApi(apiEndPoints.TWITTER_SAVE_TOKENS, {
        access_token: token,
        access_token_secret: secret,
      });

      setAccessToken('');
      setAccessTokenSecret('');
      await fetchTokenDetails();

      showSuccess(response?.data?.message || 'Twitter tokens saved successfully');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to save Twitter tokens');
    } finally {
      setSavingToken(false);
    }
  };

  const handleClearTokens = async () => {
    try {
      await postApi(apiEndPoints.TWITTER_CLEAR_TOKENS, {});
      setTokenDetails(null);
      setAccessToken('');
      setAccessTokenSecret('');
      showSuccess('Twitter tokens cleared successfully');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to clear Twitter tokens');
    }
  };

  const handleTogglePostingStatus = async (isActive) => {
    try {
      setTogglingStatus(true);
      const response = await patchApi(apiEndPoints.TWITTER_TOGGLE_STATUS, { is_active: isActive });

      if (response?.data?.success) {
        showSuccess(response?.data?.message || `Twitter posting ${isActive ? 'enabled' : 'disabled'} successfully`);
      } else {
        showError(response?.data?.message || 'Failed to toggle Twitter posting status');
      }
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to toggle Twitter posting status');
    } finally {
      await fetchTokenDetails();
      setTogglingStatus(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);

      const token = accessToken.trim();
      const secret = accessTokenSecret.trim();

      if (!token || !secret) {
        showError('Access Token and Access Token Secret are required to test connection');
        return;
      }

      const response = await postApi(apiEndPoints.TWITTER_TEST_CONNECTION, {
        access_token: token,
        access_token_secret: secret,
      });

      showSuccess(response?.data?.message || 'Twitter connection is working');
    } catch (error) {
      showError(error?.response?.data?.message || 'Twitter connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Box pt={{ base: '80px', md: '40px', xl: '40px' }}>
      <Stack spacing="24px">
        <Card p="28px">
          <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap="16px" wrap="wrap">
            <Box>
              <Flex align="center" gap="10px" mb="10px">
                <Icon
                  as={FaTwitter}
                  boxSize={6}
                  color="#1DA1F2"
                />
                <Text color={textColor} fontSize="24px" fontWeight="700">
                  Twitter Access Token
                </Text>
              </Flex>
              <Text color={mutedColor}>
                Paste your OAuth 1.0a access token & secret and manage Twitter posting settings.
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
                  Step 1: Save Tokens
                </Text>
                <Text color={mutedColor} mt="6px">
                  Paste Access Token and Access Token Secret to enable posting on X.com.
                </Text>
              </Box>

              <FormControl>
                <FormLabel color={mutedColor}>Access Token</FormLabel>
                <InputGroup>
                  <Input
                    value={accessToken}
                    onChange={(event) => setAccessToken(event.target.value)}
                    placeholder="Paste Access Token"
                    bg={subtleBg}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel color={mutedColor}>Access Token Secret</FormLabel>
                <InputGroup>
                  <Input
                    value={accessTokenSecret}
                    onChange={(event) => setAccessTokenSecret(event.target.value)}
                    placeholder="Paste Access Token Secret"
                    bg={subtleBg}
                  />
                </InputGroup>
              </FormControl>

              <Flex gap="12px" wrap="wrap">
                <Button
                  colorScheme="blue"
                  onClick={handleSaveTokens}
                  isLoading={savingToken}
                  loadingText="Saving tokens"
                  alignSelf="flex-start"
                >
                  Save Tokens
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<RepeatIcon />}
                  onClick={handleClearTokens}
                >
                  Clear Tokens
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  isLoading={testingConnection}
                  loadingText="Testing"
                >
                  Test Connection
                </Button>
              </Flex>
            </Stack>
          </Card>

          <Card p="28px">
            <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap="12px" wrap="wrap" mb="18px">
              <Box>
                <Text color={textColor} fontSize="20px" fontWeight="700">
                  Current Token Details
                </Text>
                <Text color={mutedColor} mt="6px">
                  Review stored tokens and control whether posting is enabled.
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
                  No Twitter token saved yet
                </Text>
                <Text color={mutedColor} mt="4px">
                  Paste your tokens and click “Save Tokens” to manage details here.
                </Text>
              </Box>
            ) : (
              <Box>
                <Flex
                  py="12px"
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  align="center"
                  justify="space-between"
                  gap="12px"
                  wrap="wrap"
                  mb="18px"
                >
                  <Box>
                    <Text color={textColor} fontSize="sm" fontWeight="600">
                      Enable Posting
                    </Text>
                    <Text color={mutedColor} fontSize="sm">
                      {tokenDetails.is_active !== false ? 'Enabled' : 'Disabled'}
                    </Text>
                  </Box>
                  <Flex align="center" gap="10px" flex="1" justify="flex-end">
                    <Switch
                      isChecked={tokenDetails.is_active !== false}
                      onChange={(e) => handleTogglePostingStatus(e.target.checked)}
                      isDisabled={togglingStatus}
                      colorScheme="blue"
                      size="md"
                    />
                  </Flex>
                </Flex>

                <DetailRow
                  label="Access Token"
                  value={tokenDetails.access_token}
                  maskedValue={maskToken(tokenDetails.access_token)}
                  canToggle
                  isVisible={showAccessToken}
                  onToggle={() => setShowAccessToken((prev) => !prev)}
                />

                <DetailRow
                  label="Access Token Secret"
                  value={tokenDetails.access_token_secret}
                  maskedValue={maskToken(tokenDetails.access_token_secret)}
                  canToggle
                  isVisible={showAccessSecret}
                  onToggle={() => setShowAccessSecret((prev) => !prev)}
                />

                <DetailRow
                  label="Last Updated"
                  value={formatDateTime(tokenDetails.updated_at)}
                />
              </Box>
            )}
          </Card>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}


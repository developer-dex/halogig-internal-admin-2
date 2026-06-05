import React from "react";
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdExplore } from "react-icons/md";

const ExploriumSearch = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const pageBg = useColorModeValue("#F4F7FE", "black");
  const cardBg = useColorModeValue("#FFFFFF", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const subtleText = useColorModeValue("gray.600", "gray.300");

  return (
    <Box bg={pageBg} minH="100%">
      <Card
        bg={cardBg}
        borderRadius="12px"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Box p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={4}>
          <Box>
            <Heading as="h1" size="md" color={textColor} fontWeight="700">
              Explorium Search
            </Heading>
            <Text fontSize="sm" color={subtleText} mt={1}>
              Search and discover businesses using Explorium's data intelligence platform.
            </Text>
          </Box>

          <Flex
            justify="center"
            align="center"
            py={20}
            direction="column"
            gap={4}
            opacity={0.5}
          >
            <MdExplore size={64} />
            <Text fontSize="lg" color={subtleText} fontWeight="600">
              Coming Soon
            </Text>
            <Text fontSize="sm" color={subtleText} maxW="400px" textAlign="center">
              The Explorium search interface is currently under development.
              Check back later for updates.
            </Text>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
};

export default ExploriumSearch;

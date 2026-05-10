import React from "react";
import {
  Box,
  Card,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import ProcessEmailsV2 from "./ProcessEmails";
import GenerateEmailsV2 from "./GenerateEmails";
import InstantlyV2 from "./Instantly";

const EmailDomainAnalysisV2 = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const pageBg = useColorModeValue("#F4F7FE", "black");
  const cardBg = useColorModeValue("#FFFFFF", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  return (
    <Box bg={pageBg} minH="100%">
      <Card bg={cardBg} borderRadius="12px" borderWidth="1px" borderColor={borderColor} boxShadow="sm">
        <Box p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={4}>
          <Text color={textColor} fontSize="lg" fontWeight="700">
            Email Domain Analysis (V2)
          </Text>

          <Tabs variant="unstyled">
            <TabList
              borderBottomWidth="2px"
              borderColor={borderColor}
              overflowX="auto"
              sx={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Tab
                fontSize="13.5px"
                fontWeight="600"
                color="gray.500"
                borderBottomWidth="2px"
                borderColor="transparent"
                px={4}
                py={3}
                _selected={{ color: "brand.500", borderColor: "brand.500" }}
              >
                Process Emails
              </Tab>
              <Tab
                fontSize="13.5px"
                fontWeight="600"
                color="gray.500"
                borderBottomWidth="2px"
                borderColor="transparent"
                px={4}
                py={3}
                _selected={{ color: "brand.500", borderColor: "brand.500" }}
              >
                Generate Emails
              </Tab>
              <Tab
                fontSize="13.5px"
                fontWeight="600"
                color="gray.500"
                borderBottomWidth="2px"
                borderColor="transparent"
                px={4}
                py={3}
                _selected={{ color: "brand.500", borderColor: "brand.500" }}
              >
                Instantly
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0} pt={4}>
                <ProcessEmailsV2 />
              </TabPanel>
              <TabPanel px={0} pt={4}>
                <GenerateEmailsV2 />
              </TabPanel>
              <TabPanel px={0} pt={4}>
                <InstantlyV2 />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
};

export default EmailDomainAnalysisV2;


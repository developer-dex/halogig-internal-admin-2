import React from "react";
import {
  Box,
  Card,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import ProcessEmails from "./ProcessEmails";
import Instantly from "./Instantly";
import GenerateEmails from "./GenerateEmails";
// import EmailSent from "./EmailSent";

const EmailDomainAnalysis = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const pageBg = useColorModeValue("#F4F7FE", "black");
  const cardBg = useColorModeValue("#FFFFFF", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  return (
    <Box bg={pageBg} minH="100%">
      <Card bg={cardBg} borderRadius="12px" borderWidth="1px" borderColor={borderColor} boxShadow="sm">
        <Box p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={4}>
          <Text color={textColor} fontSize="lg" fontWeight="700">
            Email Domain Analysis
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
              {/* <Tab>Email Sent</Tab> */}
            </TabList>

            <TabPanels>
              {/* Process Emails Tab */}
              <TabPanel px={0} pt={4}>
                <ProcessEmails />
              </TabPanel>



              {/* Generate Emails Tab */}
              <TabPanel px={0} pt={4}>
                <GenerateEmails />
              </TabPanel>
              
              {/* Instantly Tab */}
              <TabPanel px={0} pt={4}>
                <Instantly />
              </TabPanel> 

              {/* Email Sent Tab */}
              {/* <TabPanel px={0} pt={4}>
                <EmailSent />
              </TabPanel> */}
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
};

export default EmailDomainAnalysis;


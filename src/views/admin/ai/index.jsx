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
import GenerateEmails from "./GenerateEmails";
import EmailSent from "./EmailSent";

const EmailDomainAnalysis = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const bgColor = useColorModeValue("#F4F7FE", "black");

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px" display="flex" flexDirection="column">
          <Text color={textColor} fontSize="2xl" fontWeight="700" mb="10px">
            Email Domain Analysis
          </Text>

          <Tabs>
            <TabList>
              <Tab>Process Emails</Tab>
              <Tab>Generate Emails</Tab>
              <Tab>Email Sent</Tab>
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

              {/* Email Sent Tab */}
              <TabPanel px={0} pt={4}>
                <EmailSent />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
};

export default EmailDomainAnalysis;


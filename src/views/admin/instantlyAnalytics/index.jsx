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
import LeadStatusTab from "./LeadStatusTab";
import OverviewTab from "./OverviewTab";
import CampaignPerformanceTab from "./CampaignPerformanceTab";
import DailyTrendsTab from "./DailyTrendsTab";
import AccountHealthTab from "./AccountHealthTab";

const InstantlyAnalytics = () => {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const pageBg = useColorModeValue("#F4F7FE", "black");
  const cardBg = useColorModeValue("#FFFFFF", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  return (
    <Box bg={pageBg} minH="100%">
      <Card bg={cardBg} borderRadius="12px" borderWidth="1px" borderColor={borderColor} boxShadow="sm">
        <Box p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={4}>
          <Text color={textColor} fontSize="lg" fontWeight="700">
            Instantly Analytics
          </Text>

          <Tabs isLazy variant="unstyled">
            <TabList
              borderBottomWidth="2px"
              borderColor={borderColor}
              overflowX="auto"
              sx={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {[
                "Lead Status",
                "Overview",
                "Campaign Performance",
                "Daily Trends",
                "Account Health",
              ].map((label) => (
                <Tab
                  key={label}
                  fontSize="13.5px"
                  fontWeight="600"
                  color="gray.500"
                  borderBottomWidth="2px"
                  borderColor="transparent"
                  px={4}
                  py={3}
                  whiteSpace="nowrap"
                  _selected={{ color: "brand.500", borderColor: "brand.500" }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* Lead Status — API 36 */}
              <TabPanel px={0} pt={4}>
                <LeadStatusTab />
              </TabPanel>

              {/* Overview KPIs — API 38 */}
              <TabPanel px={0} pt={4}>
                <OverviewTab />
              </TabPanel>

              {/* Campaign Performance Table — API 39 */}
              <TabPanel px={0} pt={4}>
                <CampaignPerformanceTab />
              </TabPanel>

              {/* Daily Trends — API 40 */}
              <TabPanel px={0} pt={4}>
                <DailyTrendsTab />
              </TabPanel>

              {/* Account Health — API 41 */}
              <TabPanel px={0} pt={4}>
                <AccountHealthTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
};

export default InstantlyAnalytics;

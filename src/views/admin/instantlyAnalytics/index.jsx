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
  const bgColor = useColorModeValue("#F4F7FE", "black");

  return (
    <Box>
      <Card bg={bgColor}>
        <Box p="12px" display="flex" flexDirection="column">
          <Text color={textColor} fontSize="2xl" fontWeight="700" mb="10px">
            Instantly Analytics
          </Text>

          <Tabs isLazy>
            <TabList flexWrap="wrap">
              <Tab>Lead Status</Tab>
              <Tab>Overview</Tab>
              <Tab>Campaign Performance</Tab>
              <Tab>Daily Trends</Tab>
              <Tab>Account Health</Tab>
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

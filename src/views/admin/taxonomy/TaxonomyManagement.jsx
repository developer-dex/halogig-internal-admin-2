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

import CategoryManagement from "./CategoryManagement";
import SubCategoryManagement from "./SubCategoryManagement";
import TechnologyManagement from "./TechnologyManagement";

export default function TaxonomyManagement() {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const bgColor = useColorModeValue("#FFFFFF", "black");

  return (
    <Box>
      <Card
        bg={bgColor}
        h={{ base: "calc(100vh - 120px)", md: "calc(100vh - 105px)", xl: "calc(100vh - 105px)" }}
        overflow="hidden"
      >
        <Box p="12px">
          <Text color={textColor} fontSize="l" fontWeight="700" mb="8px">
            Taxonomy Management
          </Text>

          <Tabs variant="enclosed" colorScheme="brand" h="100%">
            <TabList>
              <Tab>Category</Tab>
              <Tab>Sub Category</Tab>
              <Tab>Technologies</Tab>
            </TabList>

            <TabPanels h="100%" overflow="hidden">
              <TabPanel px={0} pt={4} h="100%" overflow="hidden">
                <CategoryManagement />
              </TabPanel>
              <TabPanel px={0} pt={4} h="100%" overflow="hidden">
                <SubCategoryManagement />
              </TabPanel>
              <TabPanel px={0} pt={4} h="100%" overflow="hidden">
                <TechnologyManagement />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>
    </Box>
  );
}


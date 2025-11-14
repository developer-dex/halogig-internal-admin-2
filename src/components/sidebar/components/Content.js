// chakra imports
import { Box, Flex, Stack } from "@chakra-ui/react";
//   Custom components
import Brand from "components/sidebar/components/Brand";
import Links from "components/sidebar/components/Links";
import SidebarCard from "components/sidebar/components/SidebarCard";
import React from "react";

// FUNCTIONS

function SidebarContent(props) {
  const { routes } = props;
  // SIDEBAR
  return (
    <Flex direction='column' height='100%' pt='15px' px="6px" borderRadius='30px'>
      <Brand />
      <Stack direction='column' flex='1' mt='8px' minH='0'>
        <Box flex='1' overflowY='auto'>
          <Links routes={routes} />
        </Box>
      </Stack>

      <Box
        mt='auto'
        mb='20px'
        borderRadius='30px'>
        <SidebarCard />
      </Box>
    </Flex>
  );
}

export default SidebarContent;

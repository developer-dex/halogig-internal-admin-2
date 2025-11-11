import React from "react";

// Chakra imports
import { Flex, Image } from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";

// Assets
import logo from "assets/img/logo/logo.png";

export function SidebarBrand() {
  return (
    <Flex  direction='column'>
      <Image 
        src={logo} 
        alt="HaloGig Logo" 
        h='20px' 
        w='100px' 
        style={{ marginLeft: '16px' }}
        // maxH='60px'
        // my='32px' 
        mb='12px'
        objectFit='contain'
      />
      <HSeparator />
    </Flex>
  );
}

export default SidebarBrand;

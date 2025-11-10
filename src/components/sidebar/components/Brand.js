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
        h='30px' 
        w='180px' 
        // maxH='60px'
        // my='32px' 
        objectFit='contain'
      />
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;

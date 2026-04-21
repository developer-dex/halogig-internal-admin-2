import React, { useContext } from "react";

// Chakra imports
import { Flex, Image, IconButton, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";
import { SidebarContext } from "contexts/SidebarContext";

// Assets
import logo from "assets/img/logo/logo.png";
import { MdUnfoldLess, MdUnfoldMore } from "react-icons/md";

export function SidebarBrand() {
  const { areModulesExpanded, setAreModulesExpanded } = useContext(SidebarContext) || {};
  const iconColor = useColorModeValue("gray.700", "white");

  return (
    <Flex  direction='column'>
      <Flex align="center" justify="space-between" px="16px" mb="12px">
        <Image
          src={logo}
          alt="HaloGig Logo"
          h="20px"
          w="110px"
          objectFit="contain"
        />

        <IconButton
          aria-label={areModulesExpanded ? "Collapse all modules" : "Expand all modules"}
          icon={areModulesExpanded ? <MdUnfoldLess /> : <MdUnfoldMore />}
          size="sm"
          variant="ghost"
          color={iconColor}
          onClick={() => setAreModulesExpanded?.((v) => !v)}
        />
      </Flex>
      <HSeparator />
    </Flex>
  );
}

export default SidebarBrand;

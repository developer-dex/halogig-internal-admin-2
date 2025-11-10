/* eslint-disable */
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue, Icon, Collapse } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

export function SidebarLinks(props) {
  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600"
  );
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");
  let categoryColor = useColorModeValue("gray.600", "gray.300");
  let categoryHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  const { routes } = props;
  
  // State to manage which categories are expanded (initialize all as expanded)
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initialState = {};
    routes.forEach(route => {
      if (route.category) {
        initialState[route.category] = true; // Default to expanded
      }
    });
    return initialState;
  });

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Check if any route in category is active
  const isCategoryActive = (items) => {
    return items?.some(item => activeRoute(item.path?.toLowerCase()));
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.category) {
        const isExpanded = expandedCategories[route.category] === true;
        const categoryActive = isCategoryActive(route.items);
        
        return (
          <Box key={index} mb="4px">
            {/* Category Header with Dropdown */}
            <Flex
              align="center"
              justify="space-between"
              px="16px"
              py="12px"
              mt="18px"
              mb="8px"
              cursor="pointer"
              borderRadius="8px"
              _hover={{ bg: categoryHoverBg }}
              onClick={() => toggleCategory(route.category)}
            >
              <Text
                fontSize="sm"
                color={categoryActive ? activeColor : categoryColor}
                fontWeight={categoryActive ? "bold" : "600"}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                {route.category}
              </Text>
              <Icon
                as={isExpanded ? ChevronDownIcon : ChevronRightIcon}
                color={categoryColor}
                w="16px"
                h="16px"
                transition="all 0.2s"
              />
            </Flex>
            
            {/* Category Items with Collapse Animation */}
            <Collapse in={isExpanded} animateOpacity>
              <Box pl="8px">
                {createLinks(route.items)}
              </Box>
            </Collapse>
          </Box>
        );
      } else if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py='5px'
                  ps='10px'>
                  <Flex w='100%' alignItems='center' justifyContent='center'>
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeIcon
                          : textColor
                      }
                      me='18px'>
                      {route.icon}
                    </Box>
                    <Text
                      me='auto'
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase())
                          ? "bold"
                          : "normal"
                      }>
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h='36px'
                    w='4px'
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor
                        : "transparent"
                    }
                    borderRadius='5px'
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py='5px'
                  ps='10px'>
                  <Text
                    me='auto'
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                    }>
                    {route.name}
                  </Text>
                  <Box h='36px' w='4px' bg='brand.400' borderRadius='5px' />
                </HStack>
              </Box>
            )}
          </NavLink>
        );
      }
    });
  };
  //  BRAND
  return createLinks(routes);
}

export default SidebarLinks;

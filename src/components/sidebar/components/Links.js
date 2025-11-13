/* eslint-disable */
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue, Icon, Collapse } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

export function SidebarLinks(props) {
  //   Chakra color mode
  let location = useLocation();
  let navigate = useNavigate();
  let activeColor = "black";
  let inactiveColor = "black";
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = "black";
  let brandColor = useColorModeValue("brand.500", "brand.400");
  let categoryColor = "black";
  let categoryHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  const { routes } = props;

  // Handle logout - clear all localStorage and redirect to sign in
  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/sign-in');
  };
  
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
        // Get icon from first item in category that has an icon
        const categoryIcon = route.items?.find(item => item.icon)?.icon;
        
        return (
          <Box key={index}>
            {/* Category Header with Dropdown */}
            <Flex
              align="center"
              justify="space-between"
              px="16px"
              py="2px"
              mt="8px"
              mb="8px"
              cursor="pointer"
              borderRadius="8px"
              _hover={{ bg: categoryHoverBg }}
              onClick={() => toggleCategory(route.category)}
            >
              <HStack spacing="8px">
                {categoryIcon && (
                  <Box
                    color={categoryActive ? activeIcon : textColor}
                    // me="2px"
                  >
                    {categoryIcon}
                  </Box>
                )}
                <Text
                  fontSize="13px"
                  color={categoryActive ? activeColor : categoryColor}
                  fontWeight={categoryActive ? "bold" : "600"}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  {route.category}
                </Text>
              </HStack>
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
              <Box>
                {createLinks(route.items)}
              </Box>
            </Collapse>
          </Box>
        );
      } else if (
        (route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl") &&
        !route.hidden
      ) {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  ps='16px'
                  // py='5px'
                  // ps='10px'>
                  >
                  <Flex w='100%' alignItems='center' justifyContent='center'>
                    {/* <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeIcon
                          : textColor
                      }
                      me='12px'>
                      {route.icon}
                    </Box> */}
                    <Text
                      me='auto'
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontSize="14px"
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
                    bg="transparent"
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
                  <Box h='36px' w='4px' bg='transparent' borderRadius='5px' />
                </HStack>
              </Box>
            )}
          </NavLink>
        );
      }
    });
  };
  //  BRAND
  return (
    <>
      {createLinks(routes)}
      {/* Logout option at the end */}
      <Box
        as="button"
        onClick={handleLogout}
        w="100%"
        borderTop="1px solid"
        borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
      >
        <HStack
          spacing="26px"
          ps='16px'
          py='8px'
          _hover={{ bg: categoryHoverBg }}
          borderRadius="8px"
          cursor="pointer"
        >
          <Flex w='100%' alignItems='center' justifyContent='center'>
            <Text
              me='auto'
              color={textColor}
              fontSize="14px"
              fontWeight="normal"
            >
              Logout
            </Text>
          </Flex>
          <Box
            h='36px'
            w='4px'
            bg="transparent"
            borderRadius='5px'
          />
        </HStack>
      </Box>
    </>
  );
}

export default SidebarLinks;

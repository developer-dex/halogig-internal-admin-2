/* eslint-disable */
import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue, Icon, Collapse, Button } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { MdPowerSettingsNew } from "react-icons/md";
import { useSelector } from "react-redux";

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

  // Get pending view counts from Redux store
  const { freelancer: freelancerCount, client: clientCount } = useSelector((state) => state.pendingViewCounts || { freelancer: 0, client: 0 });

  // Handle logout - clear all localStorage and redirect to sign in
  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    // Remove specific admin-related items
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('isAdminLogIn');
    // Redirect to sign-in page
    window.location.href = '/auth/sign-in';
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
  const activeRoute = (routeName, fullPath) => {
    // For exact path matching, use the full path
    if (fullPath) {
      const currentPath = location.pathname;
      const routeFullPath = fullPath.toLowerCase();
      // Check for exact match or if current path starts with route path followed by / or end of string
      return currentPath === routeFullPath || currentPath.startsWith(routeFullPath + '/');
    }
    // Fallback to includes for backward compatibility
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
  const isCategoryActive = (items, layout) => {
    return items?.some(item => {
      const itemFullPath = layout + item.path;
      return activeRoute(item.path?.toLowerCase(), itemFullPath);
    });
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.category) {
        const isExpanded = expandedCategories[route.category] === true;
        const categoryActive = isCategoryActive(route.items, route.layout);
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
                  fontWeight={categoryActive ? "600" : "500"}
                  // textTransform="uppercase"
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
                {route.items?.map((item, itemIndex) => {
                  const isFreelancers = item.name === 'Freelancers' && (item.path === '/freelancers' || item.path === '/freelancers-management');
                  const isClients = item.name === 'Clients' && (item.path === '/offline-clients' || item.path === '/clients');
                  const showRedDot = (isFreelancers && freelancerCount > 0) || (isClients && clientCount > 0);
                  
                  const itemFullPath = item.layout + item.path;
                  const isItemActive = activeRoute(item.path?.toLowerCase(), itemFullPath);
                  
                  return (
                    <NavLink key={itemIndex} to={itemFullPath}>
                      {item.icon ? (
                        <Box>
                          <HStack
                            spacing={isItemActive ? "22px" : "26px"}
                            ps='16px'
                          >
                            <Flex w='100%' alignItems='center' justifyContent='space-between'>
                              <Text
                                me='auto'
                                color={
                                  isItemActive
                                    ? activeColor
                                    : textColor
                                }
                                fontSize="14px"
                                fontWeight={
                                  isItemActive
                                    ? "bold"
                                    : "normal"
                                }>
                                {item.name}
                              </Text>
                              {showRedDot && (
                                <Box
                                  bg="red.500"
                                  borderRadius="full"
                                  w="10px"
                                  h="10px"
                                  minW="10px"
                                  flexShrink={0}
                                  boxShadow="0 0 0 2px white, 0 0 0 3px rgba(229, 62, 62, 0.3)"
                                />
                              )}
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
                            spacing={isItemActive ? "22px" : "26px"}
                            py='5px'
                            ps='10px'>
                            <Flex w='100%' alignItems='center' justifyContent='space-between'>
                              <Text
                                me='auto'
                                color={
                                  isItemActive
                                    ? activeColor
                                    : inactiveColor
                                }
                                fontWeight={
                                  isItemActive ? "bold" : "normal"
                                }>
                                {item.name}
                              </Text>
                              {showRedDot && (
                                <Box
                                  bg="red.500"
                                  borderRadius="full"
                                  w="10px"
                                  h="10px"
                                  minW="10px"
                                  flexShrink={0}
                                  boxShadow="0 0 0 2px white, 0 0 0 3px rgba(229, 62, 62, 0.3)"
                                />
                              )}
                            </Flex>
                            <Box h='36px' w='4px' bg='transparent' borderRadius='5px' />
                          </HStack>
                        </Box>
                      )}
                    </NavLink>
                  );
                })}
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
        const isFreelancers = route.name === 'Freelancers' && (route.path === '/freelancers' || route.path === '/freelancers-management');
        const isClients = route.name === 'Clients' && (route.path === '/offline-clients' || route.path === '/clients');
        const showRedDot = (isFreelancers && freelancerCount > 0) || (isClients && clientCount > 0);
        
        const routeFullPath = route.layout + route.path;
        const isRouteActive = activeRoute(route.path.toLowerCase(), routeFullPath);
        
        return (
          <NavLink key={index} to={routeFullPath}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    isRouteActive ? "22px" : "26px"
                  }
                  ps='16px'
                  // py='5px'
                  // ps='10px'>
                  >
                  <Flex w='100%' alignItems='center' justifyContent='space-between'>
                    {/* <Box
                      color={
                        isRouteActive
                          ? activeIcon
                          : textColor
                      }
                      me='12px'>
                      {route.icon}
                    </Box> */}
                    <Text
                      me='auto'
                      color={
                        isRouteActive
                          ? activeColor
                          : textColor
                      }
                      fontSize="14px"
                      fontWeight={
                        isRouteActive
                          ? "bold"
                          : "normal"
                      }>
                      {route.name}
                    </Text>
                    {showRedDot && (
                      <Box
                        bg="red.500"
                        borderRadius="full"
                        w="10px"
                        h="10px"
                        minW="10px"
                        flexShrink={0}
                        boxShadow="0 0 0 2px white, 0 0 0 3px rgba(229, 62, 62, 0.3)"
                      />
                    )}
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
                    isRouteActive ? "22px" : "26px"
                  }
                  py='5px'
                  ps='10px'>
                  <Flex w='100%' alignItems='center' justifyContent='space-between'>
                    <Text
                      me='auto'
                      color={
                        isRouteActive
                          ? activeColor
                          : inactiveColor
                      }
                      fontWeight={
                        isRouteActive ? "bold" : "normal"
                      }>
                      {route.name}
                    </Text>
                    {showRedDot && (
                      <Box
                        bg="red.500"
                        borderRadius="full"
                        w="10px"
                        h="10px"
                        minW="10px"
                        flexShrink={0}
                        boxShadow="0 0 0 2px white, 0 0 0 3px rgba(229, 62, 62, 0.3)"
                      />
                    )}
                  </Flex>
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
    <Flex direction='column' h='100%'>
      <Box flex='1' overflowY='auto'>
        {createLinks(routes)}
      </Box>
      {/* Logout option at the end */}
      <Box
        mt="auto"
        pt="16px"
        borderTop="1px solid"
        borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
        flexShrink={0}
      >
        <Button
          leftIcon={<MdPowerSettingsNew />}
          w="100%"
          justifyContent="flex-start"
          variant="ghost"
          color={textColor}
          fontSize="0.95rem"
          fontWeight="500"
          h="40px"
          borderRadius="8px"
          px="16px"
          _hover={{
            bg: categoryHoverBg,
            color: '#c3362a',
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Flex>
  );
}

export default SidebarLinks;

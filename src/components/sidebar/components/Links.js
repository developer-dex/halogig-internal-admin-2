/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue, Icon, Collapse, Button } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { MdPowerSettingsNew } from "react-icons/md";
import { useSelector } from "react-redux";
import { SidebarContext } from "contexts/SidebarContext";

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
  const { areModulesExpanded } = useContext(SidebarContext) || {};

  const { permissions, admin } = useSelector((state) => state.rbac || { permissions: {}, admin: null });

  const hasPermission = (moduleKey, action = 'view') => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    const modulePerms = permissions && permissions[moduleKey];
    if (modulePerms === true) return true;
    if (!modulePerms || typeof modulePerms !== 'object') return false;
    return !!(modulePerms[action] || modulePerms.view || modulePerms.create || modulePerms.edit || modulePerms.delete);
  };

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
        initialState[route.category] = areModulesExpanded !== false; // Default to expanded
      }
    });
    return initialState;
  });

  useEffect(() => {
    const shouldExpand = areModulesExpanded !== false;
    setExpandedCategories((prev) => {
      const next = { ...prev };
      routes.forEach((route) => {
        if (route.category) {
          next[route.category] = shouldExpand;
        }
      });
      return next;
    });
  }, [areModulesExpanded, routes]);

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

  const getVisibleCategoryItems = (items, layout) => {
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.filter((item) => {
      const itemFullPath = (layout || item.layout || '') + item.path;
      return hasPermission(itemFullPath, 'view');
    });
  };

  // Check if any *visible* route in category is active
  const isCategoryActive = (items, layout) => {
    const visibleItems = getVisibleCategoryItems(items, layout);
    return visibleItems.some((item) => {
      const itemFullPath = (layout || item.layout || '') + item.path;
      return activeRoute(item.path?.toLowerCase(), itemFullPath);
    });
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routesConfig) => {
    return routesConfig.map((route, index) => {
      if (route.category) {
        const visibleItems = getVisibleCategoryItems(route.items, route.layout);
        if (!visibleItems.length) {
          return null;
        }
        const isExpanded = expandedCategories[route.category] === true;
        const categoryActive = isCategoryActive(route.items, route.layout);
        // Get icon from first item in category that has an icon
        const categoryIcon = route.items?.find(item => item.icon)?.icon;
        const isCategoryHighlighted = categoryActive;
        
        return (
          <Box key={index}>
            {/* Category Header with Dropdown */}
            <Flex
              align="center"
              justify="space-between"
              px="16px"
              py="6px"
              mt="10px"
              mb="2px"
              cursor="pointer"
              borderRadius="8px"
              _hover={{ bg: categoryHoverBg }}
              onClick={() => toggleCategory(route.category)}
            >
              <HStack spacing="8px">
                <Text
                  fontSize="15px"
                  color={isCategoryHighlighted ? brandColor : categoryColor}
                  fontWeight="700"
                  letterSpacing="0.2px"
                >
                  {route.category}
                </Text>
              </HStack>
              <Icon
                as={isExpanded ? ChevronDownIcon : ChevronRightIcon}
                color="gray.400"
                w="14px"
                h="14px"
                transition="all 0.2s"
              />
            </Flex>
            
            {/* Category Items with Collapse Animation */}
            <Collapse in={isExpanded} animateOpacity>
              <Box>
                {visibleItems.map((item, itemIndex) => {
                  const isFreelancers = item.name === 'Freelancers' && (item.path === '/freelancers' || item.path === '/freelancers-management');
                  const isClients = item.name === 'Clients' && (item.path === '/offline-clients' || item.path === '/clients');
                  const showRedDot = (isFreelancers && freelancerCount > 0) || (isClients && clientCount > 0);
                  
                  const itemFullPath = item.layout + item.path;
                  const isItemActive = activeRoute(item.path?.toLowerCase(), itemFullPath);
                  
                  return (
                    <NavLink key={itemIndex} to={itemFullPath}>
                      <HStack
                        spacing="0"
                        ps="28px"
                        py="1px"
                        borderRadius="10px"
                        bg={isItemActive ? "brand.50" : "transparent"}
                        _hover={{ bg: isItemActive ? "brand.50" : categoryHoverBg }}
                        transition="all 0.15s"
                      >
                        <Box
                          me="10px"
                          flexShrink={0}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg={isItemActive ? brandColor : "gray.400"}
                          />
                        </Box>

                        <Flex w="100%" alignItems="center" justifyContent="space-between" py="8px">
                          <Text
                            me="auto"
                            color={isItemActive ? brandColor : textColor}
                            fontSize="13px"
                            fontWeight={isItemActive ? "600" : "normal"}
                          >
                            {item.name}
                          </Text>
                          {showRedDot && (
                            <Box
                              bg="red.500"
                              borderRadius="full"
                              w="8px"
                              h="8px"
                              minW="8px"
                              flexShrink={0}
                              me="12px"
                              boxShadow="0 0 0 2px white, 0 0 0 3px rgba(229, 62, 62, 0.3)"
                            />
                          )}
                        </Flex>

                        <Box
                          h="36px"
                          w="4px"
                          bg={isItemActive ? brandColor : "transparent"}
                          borderRadius="5px"
                          flexShrink={0}
                        />
                      </HStack>
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
        const moduleKey = routeFullPath;
        if (!hasPermission(moduleKey, 'view')) {
          return null;
        }
        const isRouteActive = activeRoute(route.path.toLowerCase(), routeFullPath);
        
        return (
          <NavLink key={index} to={routeFullPath}>
            <HStack
              spacing="0"
              ps="28px"
              py="1px"
              borderRadius="10px"
              bg={isRouteActive ? "brand.50" : "transparent"}
              _hover={{ bg: isRouteActive ? "brand.50" : categoryHoverBg }}
              transition="all 0.15s"
            >
              <Box
                me="10px"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={isRouteActive ? brandColor : "gray.400"}
                />
              </Box>
              <Flex w="100%" alignItems="center" justifyContent="space-between" py="8px">
                <Text
                  me="auto"
                  color={isRouteActive ? brandColor : textColor}
                  fontSize="13px"
                  fontWeight={isRouteActive ? "600" : "normal"}
                >
                  {route.name}
                </Text>
                {showRedDot && (
                  <Box
                    bg="red.500"
                    borderRadius="full"
                    w="8px"
                    h="8px"
                    minW="8px"
                    flexShrink={0}
                    me="12px"
                    boxShadow="0 0 0 2px white, 0 0 0 3px rgba(229, 62, 62, 0.3)"
                  />
                )}
              </Flex>
              <Box
                h="36px"
                w="4px"
                bg={isRouteActive ? brandColor : "transparent"}
                borderRadius="5px"
                flexShrink={0}
              />
            </HStack>
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

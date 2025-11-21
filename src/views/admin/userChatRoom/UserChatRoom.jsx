import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Text,
  Avatar,
  IconButton,
  Flex,
  HStack,
  VStack,
  Badge,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdSearch,
  MdClose,
  MdMoreVert,
  MdCheckCircle,
  MdBlock,
  MdSend,
  MdDelete,
} from 'react-icons/md';
import {
  getUserChatRooms,
  updateChatRoomStatus,
  getChatRoomMessages,
  setCurrentChatRoom,
  clearCurrentChatRoom,
} from '../../../features/admin/chatManagementSlice';

export default function UserChatRoom() {
  const dispatch = useDispatch();
  const {
    isLoading,
    userChatRooms,
    currentChatRoom,
    messages,
  } = useSelector((state) => state.chatManagementReducer);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Refs for scrolling
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Chakra color mode values
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const activeBg = useColorModeValue('#f0f7ff', 'whiteAlpha.100');
  const mainBg = useColorModeValue('#f3f6fa', 'navy.900');

  useEffect(() => {
    // Fetch user chat rooms on component mount
    dispatch(getUserChatRooms());
    
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentChatRoom());
    };
  }, [dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Filter chat rooms based on search term
  const filteredChatRooms = userChatRooms.filter((room) => {
    if (!searchTerm.trim()) return true;
    const lowerSearch = searchTerm.toLowerCase();
    
    // Search in member names and emails
    const membersMatch = room.members?.some((member) => {
      const fullName = `${member.user?.first_name || ''} ${member.user?.last_name || ''}`.toLowerCase();
      const email = member.user?.email?.toLowerCase() || '';
      return fullName.includes(lowerSearch) || email.includes(lowerSearch);
    });
    
    return membersMatch || room.name?.toLowerCase().includes(lowerSearch);
  });

  // Handle status change
  const handleStatusChange = async (roomId, newStatus, e) => {
    e.stopPropagation(); // Prevent room selection when clicking menu
    try {
      await dispatch(updateChatRoomStatus({ roomId, status: newStatus })).unwrap();
      // Refresh the list after status update
      dispatch(getUserChatRooms());
      // If the updated room is currently selected, refresh messages
      if (currentChatRoom?.id === roomId) {
        dispatch(getChatRoomMessages({ roomId, page: 1, limit: 100 }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Get member names for display
  const getMemberNames = (members) => {
    if (!members || members.length === 0) return 'No members';
    const names = members.map((member) => {
      const firstName = member.user?.first_name || '';
      const lastName = member.user?.last_name || '';
      return `${firstName} ${lastName}`.trim();
    }).filter(name => name);
    
    if (names.length === 0) return 'No members';
    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(' & ');
    return `${names[0]} & ${names.length - 1} other${names.length - 1 > 1 ? 's' : ''}`;
  };

  // Get room display name
  const getRoomName = (room) => {
    if (room.name) return room.name;
    if (room.members && room.members.length > 0) {
      return getMemberNames(room.members);
    }
    return 'Individual Chat';
  };

  // Handle room click
  const handleRoomClick = (room) => {
    dispatch(setCurrentChatRoom(room));
    dispatch(getChatRoomMessages({ roomId: room.id, page: 1, limit: 100 }));

    // Scroll to bottom after loading messages
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  };

  // Format message time
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get last message preview for list
  const getLastMessagePreview = (room) => {
    // This would need to come from the API response
    // For now, return a placeholder
    return 'Click to view messages';
  };

  if (isLoading && userChatRooms.length === 0) {
    return (
      <Flex justify="center" align="center" minH="600px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box
      p="0"
      h="100vh"
      position="fixed"
      top="0"
      left={{ base: '0', xl: '200px' }}
      right="0"
      bottom="0"
      overflow="hidden"
      m="0"
      w={{ base: '100%', xl: 'calc(100% - 200px)' }}
      maxW="none"
      bg={mainBg}
      zIndex="10"
    >
      <Flex h="100%" direction={{ base: 'column', lg: 'row' }} gap="0">
        {/* Left Sidebar - Chat Rooms List */}
        <Box
          w={{ base: '100%', lg: '340px' }}
          bg={bgColor}
          borderRight={{ base: 'none', lg: '1.5px solid' }}
          borderBottom={{ base: '1.5px solid', lg: 'none' }}
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
          h="100%"
          flexShrink={0}
        >
          {/* Sidebar Header */}
          <Box
            p="20px 18px 10px 18px"
            borderBottom="1.5px solid"
            borderColor={borderColor}
            bg={bgColor}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing="8px">
                <Text color={textColor} fontSize="1.18rem" fontWeight="700">
                  User Chat Rooms
                </Text>
              </HStack>
            </Flex>
          </Box>

          {/* Search Bar */}
          <Box p="12px 18px 8px 18px" bg={bgColor}>
            <InputGroup>
              <Input
                placeholder="Search People..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="20px"
                border="1.5px solid"
                borderColor={borderColor}
                bg={hoverBg}
                fontSize="1rem"
                _focus={{
                  border: '1.5px solid',
                  borderColor: 'brand.500',
                  bg: bgColor,
                }}
              />
              <InputRightElement>
                {searchTerm ? (
                  <IconButton
                    aria-label="Clear search"
                    icon={<MdClose />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setSearchTerm('')}
                  />
                ) : (
                  <MdSearch color={textColorSecondary} />
                )}
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* Chat Rooms List - Scrollable area */}
          <Box 
            flex="1" 
            overflowY="auto" 
            bg={bgColor}
            minH="0"
          >
            {filteredChatRooms.length === 0 ? (
              <Box textAlign="center" color={textColorSecondary} p="18px 0">
                {searchTerm ? 'No rooms found' : 'No user chat rooms yet'}
              </Box>
            ) : (
              filteredChatRooms.map((room) => (
                <Box
                  key={room.id}
                  p="10px 18px"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  cursor="pointer"
                  bg={currentChatRoom?.id === room.id ? activeBg : bgColor}
                  _hover={{ bg: activeBg }}
                  transition="background 0.18s"
                  onClick={() => handleRoomClick(room)}
                  position="relative"
                >
                  <Flex justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing="4px" flex="1" minW="0">
                      <Text
                        color={textColor}
                        fontSize="1rem"
                        fontWeight="600"
                        noOfLines={1}
                      >
                        {getRoomName(room)}
                      </Text>
                      <Text
                        color={textColorSecondary}
                        fontSize="0.88rem"
                        noOfLines={1}
                      >
                        {getMemberNames(room.members)}
                      </Text>
                      <HStack spacing="6px" mt="2px">
                        <Badge
                          colorScheme={room.chat_type === 'individual' ? 'blue' : 'purple'}
                          fontSize="0.7rem"
                          borderRadius="4px"
                          px="6px"
                          py="2px"
                        >
                          {room.chat_type || 'individual'}
                        </Badge>
                        <Badge
                          colorScheme={room.status === 'active' ? 'green' : room.status === 'suspended' ? 'red' : 'gray'}
                          fontSize="0.7rem"
                          borderRadius="4px"
                          px="6px"
                          py="2px"
                        >
                          {room.status || 'active'}
                        </Badge>
                      </HStack>
                    </VStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<MdMoreVert />}
                        variant="ghost"
                        size="sm"
                        color={textColorSecondary}
                        fontSize="18px"
                        w="32px"
                        h="32px"
                        minW="32px"
                        onClick={(e) => e.stopPropagation()}
                        _hover={{
                          bg: hoverBg,
                          color: textColor,
                        }}
                      />
                      <MenuList
                        bg={bgColor}
                        borderColor={borderColor}
                        boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                        minW="180px"
                      >
                        <MenuItem
                          icon={<MdCheckCircle />}
                          onClick={(e) => handleStatusChange(room.id, 'active', e)}
                          isDisabled={room.status === 'active'}
                          bg={bgColor}
                          _hover={{ bg: hoverBg }}
                          color={room.status === 'active' ? textColorSecondary : 'green.500'}
                          fontSize="0.9rem"
                        >
                          {room.status === 'active' ? 'Already Active' : 'Set as Active'}
                        </MenuItem>
                        <MenuItem
                          icon={<MdBlock />}
                          onClick={(e) => handleStatusChange(room.id, 'suspended', e)}
                          isDisabled={room.status === 'suspended'}
                          bg={bgColor}
                          _hover={{ bg: hoverBg }}
                          color={room.status === 'suspended' ? textColorSecondary : 'red.500'}
                          fontSize="0.9rem"
                        >
                          {room.status === 'suspended' ? 'Already Suspended' : 'Suspend'}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Right Content Area - Chat Window or Empty State */}
        <Box flex="1" display="flex" flexDirection="column" bg={mainBg} minW="0" h="100%">
          {!currentChatRoom ? (
            // Empty State
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="100%"
              textAlign="center"
              p="60px 0"
            >
              <Text fontSize="3rem" color="gray.400" mb="1rem">
                💬
              </Text>
              <Text
                color={textColor}
                fontSize="1.2rem"
                fontWeight="600"
                mb="0.5rem"
              >
                Select a chat room
              </Text>
              <Text color={textColorSecondary} fontSize="1rem">
                Choose a chat room from the sidebar to view conversation
              </Text>
            </Flex>
          ) : (
            // Chat Window
            <Flex direction="column" h="100%" bg={bgColor}>
              {/* Chat Header */}
              <Box
                p="18px 28px 14px 28px"
                borderBottom="1.5px solid"
                borderColor={borderColor}
                bg={bgColor}
                flexShrink={0}
                minH="68px"
              >
                <Flex align="center" justify="space-between">
                  <HStack spacing="10px">
                    {currentChatRoom.members && currentChatRoom.members.length > 0 ? (
                      <Box position="relative">
                        <Avatar
                          size="md"
                          bg="linear-gradient(135deg, #c3362a 0%, #92150d 100%)"
                          color="white"
                          name={currentChatRoom.members[0]?.user?.first_name || 'U'}
                        >
                          {currentChatRoom.members[0]?.user?.first_name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        {currentChatRoom.members.length > 1 && (
                          <Avatar
                            size="sm"
                            bg="linear-gradient(135deg, #92150d 0%, #c3362a 100%)"
                            color="white"
                            name={currentChatRoom.members[1]?.user?.first_name || 'U'}
                            position="absolute"
                            bottom="-4px"
                            right="-8px"
                            border="2px solid white"
                          >
                            {currentChatRoom.members[1]?.user?.first_name?.[0]?.toUpperCase() || 'U'}
                          </Avatar>
                        )}
                      </Box>
                    ) : (
                      <Avatar
                        size="md"
                        bg="linear-gradient(135deg, #c3362a 0%, #92150d 100%)"
                        color="white"
                      />
                    )}
                    <VStack align="flex-start" spacing="0">
                      <Text color={textColor} fontSize="1.1rem" fontWeight="700">
                        {getRoomName(currentChatRoom)}
                      </Text>
                      <HStack spacing="8px" mt="4px">
                        <Badge
                          colorScheme={currentChatRoom.chat_type === 'individual' ? 'blue' : 'purple'}
                          fontSize="0.75rem"
                        >
                          {currentChatRoom.chat_type || 'individual'}
                        </Badge>
                        <Badge
                          colorScheme={currentChatRoom.status === 'active' ? 'green' : currentChatRoom.status === 'suspended' ? 'red' : 'gray'}
                          fontSize="0.75rem"
                        >
                          {currentChatRoom.status || 'active'}
                        </Badge>
                        <Text color="green.500" fontSize="0.85rem">
                          {currentChatRoom.members?.length || 0} Member
                          {currentChatRoom.members?.length === 1 ? '' : 's'}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Flex>
              </Box>

              {/* Messages Container */}
              <Box
                ref={messagesContainerRef}
                flex="1"
                overflowY="auto"
                bg={mainBg}
                minH="0"
                p="32px"
              >
                {messages.length === 0 ? (
                  <Flex
                    justify="center"
                    align="center"
                    h="200px"
                    textAlign="center"
                  >
                    <Text color={textColorSecondary} fontSize="1.05rem">
                      No messages yet. Start the conversation!
                    </Text>
                  </Flex>
                ) : (
                  <VStack align="stretch" spacing="18px">
                    {messages.map((message) => {
                      // Determine if message is from a user (not admin)
                      const isUserMessage = true; // All messages in user chat rooms are from users
                      return (
                        <Box
                          key={message.id}
                          role="group"
                          display="flex"
                          justifyContent="flex-start"
                          _hover={{
                            '& .delete-btn': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Flex
                            direction="row"
                            align="flex-end"
                            spacing="12px"
                            maxW="60%"
                            gap="12px"
                          >
                            <Avatar
                              size="sm"
                              bg="linear-gradient(135deg, #c3362a 0%, #92150d 100%)"
                              color="white"
                              name={`${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`}
                              flexShrink={0}
                            >
                              {message.sender?.first_name?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <VStack
                              align="flex-start"
                              spacing="4px"
                              flex="1"
                              minW="0"
                            >
                              <HStack
                                spacing="8px"
                                direction="row"
                              >
                                <Text
                                  color="brand.500"
                                  fontSize="0.85rem"
                                  fontWeight="600"
                                >
                                  {`${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`}
                                </Text>
                                <Text color={textColorSecondary} fontSize="0.78rem">
                                  {formatMessageTime(message.created_at)}
                                </Text>
                              </HStack>
                              <Box
                                bg={bgColor}
                                color={textColor}
                                p="14px 18px 12px 18px"
                                borderRadius="18px 18px 18px 6px"
                                maxW="100%"
                                wordBreak="break-word"
                                boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                                fontSize="1rem"
                              >
                                <Text
                                  color={textColor}
                                  fontSize="1rem"
                                >
                                  {message.message}
                                </Text>
                                {message.privacy_masked && (
                                  <Badge
                                    colorScheme="blue"
                                    size="sm"
                                    mt="8px"
                                    fontSize="xs"
                                  >
                                    Privacy Protected
                                  </Badge>
                                )}
                              </Box>
                            </VStack>
                          </Flex>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Message Input - Disabled for viewing only */}
              <Box
                p="16px 28px"
                borderTop="1.5px solid"
                borderColor={borderColor}
                bg={bgColor}
                flexShrink={0}
                minH="70px"
              >
                <HStack spacing="10px" align="center">
                  <Input
                    flex="1"
                    placeholder="Viewing conversation (read-only)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    borderRadius="20px"
                    border="1.5px solid"
                    borderColor={borderColor}
                    bg={hoverBg}
                    fontSize="1rem"
                    isDisabled
                    _focus={{
                      border: '1.5px solid',
                      borderColor: 'brand.500',
                      bg: bgColor,
                    }}
                  />
                  <IconButton
                    aria-label="Send message"
                    icon={<MdSend />}
                    bg="gray.300"
                    color="white"
                    borderRadius="20px"
                    w="48px"
                    h="38px"
                    fontSize="20px"
                    isDisabled
                    cursor="not-allowed"
                  />
                </HStack>
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

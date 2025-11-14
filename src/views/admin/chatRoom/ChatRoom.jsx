import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Text,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Card,
  Avatar,
  IconButton,
  Flex,
  HStack,
  VStack,
  Badge,
  Divider,
  Spinner,
  Tooltip,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdChat,
  MdGroup,
  MdAccessTime,
  MdSend,
  MdDelete,
  MdArrowBack,
  MdSearch,
  MdClose,
} from 'react-icons/md';
import {
  getAllUsers,
  createChatRoom,
  getAdminChatRooms,
  getChatRoomMessages,
  sendMessage,
  deleteMessage,
  setCurrentChatRoom,
  clearCurrentChatRoom,
  addMessage,
} from '../../../features/admin/chatManagementSlice';
import socketService from '../../../services/socket.service';
import { showSuccess, showError } from '../../../helpers/messageHelper';

export default function ChatRoom() {
  const dispatch = useDispatch();
  const {
    isLoading,
    chatRooms,
    currentChatRoom,
    messages,
    users,
    totalCount,
  } = useSelector((state) => state.chatManagementReducer);

  // Local state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Socket-related refs
  const unsubscribeRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Chakra color mode values
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('rgb(32, 33, 36)', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('#F4F7FE', 'navy.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const activeBg = useColorModeValue('#f0f7ff', 'whiteAlpha.100');
  const mainBg = useColorModeValue('#f3f6fa', 'navy.900');

  useEffect(() => {
    // Fetch initial data
    dispatch(getAdminChatRooms({ page: currentPage, limit: 50 }));
  }, [dispatch, currentPage]);

  // Initialize socket connection for admin
  useEffect(() => {
    const adminJson = localStorage.getItem('adminData');
    if (adminJson) {
      try {
        const admin = JSON.parse(adminJson);
        setCurrentAdmin(admin);

        // Initialize socket connection
        socketService.connect(admin.id);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Setup socket listeners for the current chat room
  useEffect(() => {
    if (currentChatRoom && currentAdmin) {
      // Join the room
      socketService.joinRoom(currentChatRoom.id);

      // Listen for messages in this room
      const unsubscribe = socketService.onRoomMessage(
        currentChatRoom.id,
        (incomingMessage) => {
          // Only add message if it's not from current admin (to avoid duplicates)
          if (incomingMessage.sender_id !== currentAdmin.id) {
            // Add the incoming message directly to state for better performance
            dispatch(addMessage(incomingMessage));
          }
        }
      );

      // Store unsubscribe function
      unsubscribeRef.current = unsubscribe;

      // Cleanup when room changes
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        socketService.leaveRoom(currentChatRoom.id);
      };
    }
  }, [currentChatRoom, currentAdmin, dispatch]);

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

  const handleCreateRoom = () => {
    onOpen();
    if (users.length === 0) {
      dispatch(getAllUsers());
    }
  };

  const handleCloseCreateModal = () => {
    onClose();
    setRoomName('');
    setRoomDescription('');
    setSelectedUsers([]);
    setSearchUser('');
  };

  const handleSubmitCreateRoom = async () => {
    if (!roomName.trim() || selectedUsers.length === 0) {
      showError('Please provide room name and select at least one user');
      return;
    }

    const roomData = {
      name: roomName,
      description: roomDescription,
      userEmails: selectedUsers.map((user) => user.email),
      roomType: 'group',
    };

    const result = await dispatch(createChatRoom(roomData));
    if (result.type === '/chat/createChatRoom/fulfilled') {
      handleCloseCreateModal();
      // Refresh room list
      dispatch(getAdminChatRooms({ page: 1, limit: 50 }));
    }
  };

  const handleRoomClick = (room) => {
    dispatch(setCurrentChatRoom(room));
    dispatch(getChatRoomMessages({ roomId: room.id, page: 1, limit: 100 }));

    // Scroll to bottom after loading messages
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatRoom) return;

    const messageData = {
      message: newMessage,
      messageType: 'text',
    };

    const result = await dispatch(
      sendMessage({
        roomId: currentChatRoom.id,
        messageData,
      })
    );

    if (result.type === '/chat/sendMessage/fulfilled') {
      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage(messageId));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLastMessagePreview = (room) => {
    if (room?.lastMessage) {
      const message = room.lastMessage.message;
      if (typeof message === 'string') {
        return message.length > 30 ? message.substring(0, 30) + '...' : message;
      }
      return 'Message';
    }
    return 'No messages yet';
  };

  const toggleUserSelection = (user) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredChatRooms = chatRooms.filter((room) => {
    if (!searchTerm.trim()) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return room.name?.toLowerCase().includes(lowerSearch);
  });

  // Check if message is from current admin
  const isAdminMessage = (message) => {
    return (
      message.sender_id === currentAdmin?.id ||
      message.sender?.id === currentAdmin?.id
    );
  };

  if (isLoading && chatRooms.length === 0) {
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
        {/* Left Sidebar - Messages List */}
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
                  Chat Rooms
                </Text>
                {/* <Badge
                  bg="brand.500"
                  color="white"
                  borderRadius="full"
                  fontSize="0.72rem"
                  px="6px"
                  minW="18px"
                  minH="18px"
                  display="flex"
                  align="center"
                  justify="center"
                >
                  {filteredChatRooms.length}
                </Badge> */}
              </HStack>
              <IconButton
                aria-label="Create new room"
                icon={<MdAdd />}
                size="sm"
                bg={bgColor}
                border="1.5px solid"
                borderColor={borderColor}
                borderRadius="full"
                w="34px"
                h="34px"
                color="#c3362a"
                fontSize="18px"
                _hover={{
                  bg: hoverBg,
                  boxShadow: '0 2px 8px rgba(195, 54, 42, 0.08)',
                  color: '#92150d',
                }}
                onClick={handleCreateRoom}
              />
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

          {/* Chat Rooms List */}
          <Box flex="1" overflowY="auto" bg={bgColor}>
            {filteredChatRooms.length === 0 ? (
              <Box textAlign="center" color={textColorSecondary} p="18px 0">
                No conversations yet
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
                >
                  <Flex justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing="4px" flex="1" minW="0">
                      <Text
                        color={textColor}
                        fontSize="1rem"
                        fontWeight="600"
                        noOfLines={1}
                      >
                        {room.name}
                      </Text>
                      <Text
                        color={textColorSecondary}
                        fontSize="0.88rem"
                        noOfLines={1}
                      >
                        {getLastMessagePreview(room)}
                      </Text>
                    </VStack>
                    <VStack align="flex-end" spacing="2px" ml="8px" minW="48px">
                      <Text color="gray.400" fontSize="0.75rem">
                        {room.lastMessage && formatTime(room.lastMessage.created_at)}
                      </Text>
                      {room.unreadCount > 0 && (
                        <Badge
                          bg="brand.500"
                          color="white"
                          borderRadius="full"
                          fontSize="0.72rem"
                          minW="18px"
                          minH="18px"
                          display="flex"
                          align="center"
                          justify="center"
                          px="6px"
                        >
                          {room.unreadCount}
                        </Badge>
                      )}
                    </VStack>
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
                Select a conversation
              </Text>
              <Text color={textColorSecondary} fontSize="1rem" mb="1.2rem">
                Choose a chat from the sidebar to start messaging
              </Text>
              <Button
                bg="linear-gradient(90deg, #c3362a 0%, #92150d 100%)"
                color="white"
                borderRadius="20px"
                px="24px"
                py="10px"
                fontSize="1rem"
                fontWeight="600"
                _hover={{
                  bg: 'linear-gradient(90deg, #92150d 0%, #c3362a 100%)',
                }}
                onClick={handleCreateRoom}
              >
                Start New Conversation
              </Button>
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
                    <Avatar
                      size="md"
                      bg="linear-gradient(135deg, #c3362a 0%, #92150d 100%)"
                      color="white"
                      name={currentChatRoom.name}
                    >
                      {currentChatRoom.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <VStack align="flex-start" spacing="0">
                      <Text color={textColor} fontSize="1.1rem" fontWeight="700">
                        {currentChatRoom.name}
                      </Text>
                      <Text color="green.500" fontSize="0.85rem">
                        {currentChatRoom.memberCount || 0} Member
                        {currentChatRoom.memberCount === 1 ? '' : 's'}
                      </Text>
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
                      const isAdmin = isAdminMessage(message);
                      return (
                        <Box
                          key={message.id}
                          role="group"
                          display="flex"
                          justifyContent={isAdmin ? 'flex-end' : 'flex-start'}
                          _hover={{
                            '& .delete-btn': {
                              opacity: 1,
                            },
                          }}
                        >
                          <Flex
                            direction={isAdmin ? 'row-reverse' : 'row'}
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
                              {message.sender?.first_name?.[0]?.toUpperCase()}
                            </Avatar>
                            <VStack
                              align={isAdmin ? 'flex-end' : 'flex-start'}
                              spacing="4px"
                              flex="1"
                              minW="0"
                            >
                              <HStack
                                spacing="8px"
                                direction={isAdmin ? 'row-reverse' : 'row'}
                              >
                                {!isAdmin && (
                                  <Text
                                    color="brand.500"
                                    fontSize="0.85rem"
                                    fontWeight="600"
                                  >
                                    {`${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`}
                                  </Text>
                                )}
                                <Text color={textColorSecondary} fontSize="0.78rem">
                                  {formatMessageTime(message.created_at)}
                                </Text>
                              </HStack>
                              <Box
                                bg={
                                  isAdmin
                                    ? 'linear-gradient(90deg, #c3362a 0%, #92150d 100%)'
                                    : bgColor
                                }
                                color={isAdmin ? 'white' : textColor}
                                p="14px 18px 12px 18px"
                                borderRadius={isAdmin ? '18px 18px 6px 18px' : '18px 18px 18px 6px'}
                                maxW="100%"
                                wordBreak="break-word"
                                boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                                fontSize="1rem"
                              >
                                <Text
                                  color={isAdmin ? 'white' : textColor}
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
                            {isAdmin && (
                              <Tooltip label="Delete message">
                                <IconButton
                                  className="delete-btn"
                                  aria-label="Delete message"
                                  icon={<MdDelete />}
                                  size="xs"
                                  variant="ghost"
                                  color="red.500"
                                  opacity="0"
                                  transition="opacity 0.2s"
                                  onClick={() => handleDeleteMessage(message.id)}
                                  flexShrink={0}
                                />
                              </Tooltip>
                            )}
                          </Flex>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Message Input */}
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
                    placeholder="Type message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
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
                  <IconButton
                    aria-label="Send message"
                    icon={<MdSend />}
                    bg="linear-gradient(90deg, #c3362a 0%, #92150d 100%)"
                    color="white"
                    borderRadius="20px"
                    w="48px"
                    h="38px"
                    fontSize="20px"
                    _hover={{
                      bg: 'linear-gradient(90deg, #92150d 0%, #c3362a 100%)',
                    }}
                    isDisabled={!newMessage.trim()}
                    onClick={handleSendMessage}
                  />
                </HStack>
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Create Room Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseCreateModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader color={textColor}>Create New Chat Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="20px" align="stretch">
              <FormControl isRequired>
                <FormLabel color={textColor}>Room Name</FormLabel>
                <Input
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  bg={cardBg}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Description (Optional)</FormLabel>
                <Textarea
                  placeholder="Enter room description"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  rows={3}
                  bg={cardBg}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Select Users</FormLabel>
                <Input
                  placeholder="Search users..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  mb="12px"
                  bg={cardBg}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                  }}
                />
                <Box
                  maxH="200px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  p="8px"
                  bg={cardBg}
                >
                  {filteredUsers.length === 0 ? (
                    <Text
                      color={textColorSecondary}
                      fontSize="sm"
                      p="12px"
                      textAlign="center"
                    >
                      No users found
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing="8px">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUsers.some((u) => u.id === user.id);
                        return (
                          <Box
                            key={user.id}
                            p="12px"
                            borderRadius="8px"
                            cursor="pointer"
                            bg={isSelected ? activeBg : 'transparent'}
                            border="1px solid"
                            borderColor={isSelected ? 'brand.500' : borderColor}
                            _hover={{ bg: hoverBg }}
                            onClick={() => toggleUserSelection(user)}
                          >
                            <HStack justify="space-between">
                              <HStack spacing="12px">
                                <Avatar
                                  size="sm"
                                  name={`${user.first_name} ${user.last_name}`}
                                  bg="linear-gradient(135deg, #c3362a 0%, #92150d 100%)"
                                  color="white"
                                >
                                  {user.first_name?.[0]?.toUpperCase()}
                                </Avatar>
                                <VStack align="flex-start" spacing="0">
                                  <Text color={textColor} fontSize="sm" fontWeight="500">
                                    {user.first_name} {user.last_name}
                                  </Text>
                                  <Text color={textColorSecondary} fontSize="xs">
                                    {user.email}
                                  </Text>
                                </VStack>
                              </HStack>
                              {isSelected && (
                                <Badge colorScheme="brand" fontSize="xs">
                                  Selected
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </Box>
                {selectedUsers.length > 0 && (
                  <Box mt="12px">
                    <Text color={textColor} fontSize="sm" mb="8px" fontWeight="500">
                      Selected Users ({selectedUsers.length}):
                    </Text>
                    <Flex wrap="wrap" gap="8px">
                      {selectedUsers.map((user) => (
                        <Badge
                          key={user.id}
                          colorScheme="brand"
                          fontSize="xs"
                          p="4px 8px"
                          borderRadius="full"
                        >
                          {user.first_name} {user.last_name}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleCloseCreateModal}
              color={textColor}
            >
              Cancel
            </Button>
            <Button
              bg="linear-gradient(135deg, #c3362a 0%, #92150d 100%)"
              color="white"
              _hover={{
                bg: 'linear-gradient(135deg, #92150d 0%, #c3362a 100%)',
              }}
              onClick={handleSubmitCreateRoom}
              isDisabled={!roomName.trim() || selectedUsers.length === 0}
            >
              Create Room
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

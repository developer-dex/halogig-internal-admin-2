import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.adminId = null;
    this.messageListeners = new Map();
    this.roomListeners = new Map();
  }

  // Initialize socket connection after admin login
  initializeAfterLogin() {
    const adminJson = localStorage.getItem('adminAuth');
    if (adminJson) {
      try {
        const admin = JSON.parse(adminJson);
        if (admin && admin.id) {
          this.connect(admin.id);
          return true;
        }
      } catch (error) {
        console.error('Error parsing admin data from localStorage:', error);
      }
    }
    return false;
  }

  // Initialize socket connection
  connect(adminId) {
    console.log('Admin socket connect() called with adminId:', adminId);
    
    if (this.socket && this.isConnected) {
      console.log('Admin socket already connected, reusing existing connection');
      return this.socket;
    }

    this.adminId = adminId;
    
    // Get socket URL from environment or use default
    const socketUrl = process.env.REACT_APP_SOCKET_URL

    console.log('Admin connecting to socket server:', socketUrl);

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true, // Force a new connection
    });

    this.setupEventHandlers();
    
    console.log('Admin socket instance created:', {
      socketId: this.socket.id,
      connected: this.socket.connected,
      adminId: this.adminId
    });
    
    return this.socket;
  }

  // Setup socket event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Admin socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Authenticate admin
      if (this.adminId) {
        this.socket.emit('authenticate', { userId: this.adminId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Admin socket disconnected');
      this.isConnected = false;
    });

    // Authentication events
    this.socket.on('auth_success', (data) => {
      console.log('Admin socket authentication successful:', data);
    });

    this.socket.on('auth_error', (error) => {
      console.error('Admin socket authentication failed:', error);
    });

    // Room events
    this.socket.on('join_room_success', (data) => {
      console.log('Admin joined room successfully:', data);
    });

    this.socket.on('join_room_error', (error) => {
      console.error('Admin failed to join room:', error);
    });

    this.socket.on('leave_room_success', (data) => {
      console.log('Admin left room successfully:', data);
    });

    this.socket.on('leave_room_error', (error) => {
      console.error('Admin failed to leave room:', error);
    });

    // Message events
    this.socket.on('receive_room_message', (data) => {
      console.log('Admin received message:', data);
      this.handleIncomingMessage(data);
    });

    this.socket.on('message_error', (error) => {
      console.error('Admin message error:', error);
    });

    // Connection error handling
    this.socket.on('connect_error', (error) => {
      console.error('Admin socket connection error:', error);
    });
  }

  // Handle incoming messages
  handleIncomingMessage(data) {
    console.log('Admin handling incoming message:', data);
    const { roomId } = data;
    
    // Notify room-specific listeners - pass the complete data object since message properties are at top level
    if (this.roomListeners.has(roomId)) {
      const listeners = this.roomListeners.get(roomId);
      console.log(`Admin found ${listeners.size} listeners for room ${roomId}`);
      listeners.forEach(callback => callback(data));  // Pass complete data object
    } else {
      console.log(`Admin no listeners found for room ${roomId}`);
    }

    // Notify general message listeners
    console.log(`Admin notifying ${this.messageListeners.size} general message listeners`);
    this.messageListeners.forEach(callback => callback(data));
  }

  // Join a chat room
  joinRoom(roomId) {
    console.log('Admin joinRoom called with:', {
      roomId,
      hasSocket: !!this.socket,
      isConnected: this.isConnected,
      adminId: this.adminId,
      socketId: this.socket?.id
    });
    
    if (this.socket && this.isConnected) {
      console.log(`Admin joining room: ${roomId} with adminId: ${this.adminId}`);
      this.socket.emit('join_room', { 
        roomId, 
        userId: this.adminId 
      });
    } else {
      console.error('Admin cannot join room: Socket not connected', {
        hasSocket: !!this.socket,
        isConnected: this.isConnected,
        adminId: this.adminId,
        socketId: this.socket?.id
      });
      
      // Try to reconnect if socket is not connected
      if (!this.isConnected && this.adminId) {
        console.log('Admin attempting to reconnect...');
        this.connect(this.adminId);
        
        // Retry joining room after a short delay
        setTimeout(() => {
          if (this.socket && this.isConnected) {
            console.log(`Admin retrying join room: ${roomId}`);
            this.socket.emit('join_room', { 
              roomId, 
              userId: this.adminId 
            });
          }
        }, 1000);
      }
    }
  }

  // Leave a chat room
  leaveRoom(roomId) {
    if (this.socket && this.isConnected) {
      console.log(`Admin leaving room: ${roomId} with adminId: ${this.adminId}`);
      this.socket.emit('leave_room', { 
        roomId, 
        userId: this.adminId 
      });
    } else {
      console.error('Admin cannot leave room: Socket not connected');
    }
  }

  // Send message (this is for real-time broadcasting, actual saving is done via API)
  sendRoomMessage(roomId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_room_message', {
        roomId,
        message,
        userId: this.adminId
      });
    }
  }

  // Listen for messages in a specific room
  onRoomMessage(roomId, callback) {
    console.log(`Admin setting up room listener for room ${roomId}`);
    
    if (!this.roomListeners.has(roomId)) {
      this.roomListeners.set(roomId, new Set());
    }
    this.roomListeners.get(roomId).add(callback);
    
    console.log(`Admin room listeners count for room ${roomId}:`, this.roomListeners.get(roomId).size);
    console.log('Admin total room listeners:', this.roomListeners.size);

    // Return unsubscribe function
    return () => {
      console.log(`Admin unsubscribing from room ${roomId}`);
      if (this.roomListeners.has(roomId)) {
        this.roomListeners.get(roomId).delete(callback);
        if (this.roomListeners.get(roomId).size === 0) {
          this.roomListeners.delete(roomId);
          console.log(`Admin removed all listeners for room ${roomId}`);
        }
      }
    };
  }

  // Listen for all messages
  onMessage(callback) {
    this.messageListeners.set(callback, callback);

    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  // Remove all listeners for a room
  removeRoomListeners(roomId) {
    if (this.roomListeners.has(roomId)) {
      this.roomListeners.delete(roomId);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.adminId = null;
      this.messageListeners.clear();
      this.roomListeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      adminId: this.adminId
    };
  }
}

// Export singleton instance
export default new SocketService();

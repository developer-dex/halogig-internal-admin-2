import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError, showSuccess } from "../../helpers/messageHelper";
import { getApi, postApi, deleteApi, patchApi } from "../../services/api";

const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
    chatRooms: [],
    userChatRooms: [],
    currentChatRoom: null,
    messages: [],
    users: [],
    totalCount: 0,
    userChatRoomsTotalCount: 0,
};

// Get all users for room creation
export const getAllUsers = createAsyncThunk(
    "/chat/getAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const payload = await getApi(apiEndPoints.GET_ALL_USERS);
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to fetch users");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Create chat room
export const createChatRoom = createAsyncThunk(
    "/chat/createChatRoom",
    async (roomData, { rejectWithValue }) => {
        try {
            const payload = await postApi(apiEndPoints.CREATE_CHAT_ROOM, roomData);
            showSuccess("Chat room created successfully!");
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to create chat room");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Get admin chat rooms
export const getAdminChatRooms = createAsyncThunk(
    "/chat/getAdminChatRooms",
    async ({ page = 1, limit = 50 }, { rejectWithValue }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_ADMIN_CHAT_ROOMS}?page=${page}&limit=${limit}`);
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to fetch chat rooms");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Get chat room messages
export const getChatRoomMessages = createAsyncThunk(
    "/chat/getChatRoomMessages",
    async ({ roomId, page = 1, limit = 50 }, { rejectWithValue }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_CHAT_ROOM_MESSAGES}/${roomId}/messages?page=${page}&limit=${limit}`);
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to fetch messages");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Send message
export const sendMessage = createAsyncThunk(
    "/chat/sendMessage",
    async ({ roomId, messageData }, { rejectWithValue }) => {
        try {
            const payload = await postApi(`${apiEndPoints.SEND_MESSAGE}/${roomId}/messages`, messageData);
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to send message");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Delete message
export const deleteMessage = createAsyncThunk(
    "/chat/deleteMessage",
    async (messageId, { rejectWithValue }) => {
        try {
            const payload = await deleteApi(`${apiEndPoints.DELETE_MESSAGE}/${messageId}`);
            showSuccess("Message deleted successfully!");
            return { payload, messageId };
        } catch (error) {
            showError(error.response?.data?.message || "Failed to delete message");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Get chat room details
export const getChatRoomDetails = createAsyncThunk(
    "/chat/getChatRoomDetails",
    async (roomId, { rejectWithValue }) => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_CHAT_ROOM_DETAILS}/${roomId}`);
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to fetch room details");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Get user chat rooms (not created by admin)
export const getUserChatRooms = createAsyncThunk(
    "/chat/getUserChatRooms",
    async (_, { rejectWithValue }) => {
        try {
            const payload = await getApi(apiEndPoints.GET_USER_CHAT_ROOMS);
            return payload;
        } catch (error) {
            showError(error.response?.data?.message || "Failed to fetch user chat rooms");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Update chat room status
export const updateChatRoomStatus = createAsyncThunk(
    "/chat/updateChatRoomStatus",
    async ({ roomId, status }, { rejectWithValue }) => {
        try {
            const payload = await patchApi(`${apiEndPoints.UPDATE_CHAT_ROOM_STATUS}/${roomId}/status`, { status });
            showSuccess(`Chat room ${status === 'active' ? 'activated' : 'suspended'} successfully!`);
            return { payload, roomId, status };
        } catch (error) {
            showError(error.response?.data?.message || "Failed to update chat room status");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const chatManagementSlice = createSlice({
    name: "chatManagement",
    initialState,
    reducers: {
        setCurrentChatRoom: (state, action) => {
            state.currentChatRoom = action.payload;
        },
        clearCurrentChatRoom: (state) => {
            state.currentChatRoom = null;
            state.messages = [];
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        removeMessage: (state, action) => {
            state.messages = state.messages.filter(msg => msg.id !== action.payload);
        },
        resetChatState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all users
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getAllUsers.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.users = payload?.data?.data || [];
                state.responseCode = payload?.status;
            })
            .addCase(getAllUsers.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Create chat room
            .addCase(createChatRoom.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(createChatRoom.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.responseCode = payload?.status;
                // Add the new room to the list if it exists
                if (payload?.data?.data?.room) {
                    state.chatRooms.unshift(payload.data.data.room);
                }
            })
            .addCase(createChatRoom.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Get admin chat rooms
            .addCase(getAdminChatRooms.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getAdminChatRooms.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.chatRooms = payload?.data?.data?.chatRooms || [];
                state.totalCount = payload?.data?.data?.total_count || 0;
                state.responseCode = payload?.status;
            })
            .addCase(getAdminChatRooms.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Get chat room messages
            .addCase(getChatRoomMessages.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getChatRoomMessages.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.messages = payload?.data?.data?.messages || [];
                state.responseCode = payload?.status;
            })
            .addCase(getChatRoomMessages.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Send message
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(sendMessage.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Add the new message to the list
                if (payload?.data?.data) {
                    state.messages.push(payload.data.data);
                }
                state.responseCode = payload?.status;
            })
            .addCase(sendMessage.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Delete message
            .addCase(deleteMessage.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Remove the deleted message from the list
                state.messages = state.messages.filter(msg => msg.id !== payload.messageId);
                state.responseCode = payload?.payload?.status;
            })
            
            // Get chat room details
            .addCase(getChatRoomDetails.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getChatRoomDetails.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentChatRoom = payload?.data?.data || null;
                state.responseCode = payload?.status;
            })
            .addCase(getChatRoomDetails.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Get user chat rooms
            .addCase(getUserChatRooms.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getUserChatRooms.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.userChatRooms = payload?.data?.data || [];
                state.userChatRoomsTotalCount = payload?.data?.data?.length || 0;
                state.responseCode = payload?.status;
            })
            .addCase(getUserChatRooms.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            
            // Update chat room status
            .addCase(updateChatRoomStatus.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(updateChatRoomStatus.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Update the status in the userChatRooms array
                const roomId = payload.roomId;
                const newStatus = payload.status;
                const roomIndex = state.userChatRooms.findIndex(room => room.id === roomId);
                if (roomIndex !== -1) {
                    state.userChatRooms[roomIndex].status = newStatus;
                }
                // Also update in chatRooms array (for admin chat rooms)
                const adminRoomIndex = state.chatRooms.findIndex(room => room.id === roomId);
                if (adminRoomIndex !== -1) {
                    state.chatRooms[adminRoomIndex].status = newStatus;
                }
                state.responseCode = payload?.payload?.status;
            })
            .addCase(updateChatRoomStatus.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
    },
});

export const { 
    setCurrentChatRoom, 
    clearCurrentChatRoom, 
    addMessage, 
    clearMessages, 
    removeMessage, 
    resetChatState 
} = chatManagementSlice.actions;

export const chatManagementReducer = chatManagementSlice.reducer;

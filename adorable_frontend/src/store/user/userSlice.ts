import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  friendCount: number;
  reviewCount: number;
  checkInCount: number;
  createdAt: string;
  lastActive: string;
  isOnline: boolean;
}

export interface FriendRequest {
  id: string;
  fromUser: UserProfile;
  toUser: UserProfile;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface UserState {
  profile: UserProfile | null;
  friends: UserProfile[];
  friendRequests: FriendRequest[];
  blockedUsers: UserProfile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  friends: [],
  friendRequests: [],
  blockedUsers: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setFriends: (state, action: PayloadAction<UserProfile[]>) => {
      state.friends = action.payload;
    },
    addFriend: (state, action: PayloadAction<UserProfile>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(friend => friend.id !== action.payload);
    },
    setFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.friendRequests = action.payload;
    },
    addFriendRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.friendRequests.push(action.payload);
    },
    updateFriendRequest: (state, action: PayloadAction<{ id: string; status: 'accepted' | 'rejected' }>) => {
      const index = state.friendRequests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.friendRequests[index].status = action.payload.status;
      }
    },
    setBlockedUsers: (state, action: PayloadAction<UserProfile[]>) => {
      state.blockedUsers = action.payload;
    },
    blockUser: (state, action: PayloadAction<UserProfile>) => {
      state.blockedUsers.push(action.payload);
      state.friends = state.friends.filter(friend => friend.id !== action.payload.id);
    },
    unblockUser: (state, action: PayloadAction<string>) => {
      state.blockedUsers = state.blockedUsers.filter(user => user.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setFriends,
  addFriend,
  removeFriend,
  setFriendRequests,
  addFriendRequest,
  updateFriendRequest,
  setBlockedUsers,
  blockUser,
  unblockUser,
  setLoading,
  setError,
} = userSlice.actions;

export const userReducer = userSlice.reducer;

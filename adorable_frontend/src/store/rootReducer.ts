import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth/authSlice';
import { userReducer } from './user/userSlice';
import { placeReducer } from './place/placeSlice';
import { chatReducer } from './chat/chatSlice';
import { settingsReducer } from './settings/settingsSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  place: placeReducer,
  chat: chatReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

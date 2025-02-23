import { NavigatorScreenParams } from '@react-navigation/native';
import { Location, SearchResult } from './map';
import { UserProfile, FriendRequest } from '../services/PeopleService';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ChatRoom: { roomId: string };
  PlaceDetails: { placeId: string };
  CategoryList: { category: { id: string; name: string } };
  PopularPlaces: undefined;
  RecommendedPlaces: undefined;
  Map: { location: Location };
  UserProfile: { userId: string };
  FriendRequests: undefined;
  EditProfile: undefined;
  BlockedUsers: undefined;
  Onboarding: undefined;
  CheckIns: undefined;
  SavedPlaces: undefined;
  AddReview: { placeId: string };
  ProfileEdit: undefined;
  Settings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MapStackParamList = {
  Map: undefined;
  PlaceDetails: { placeId: string };
  SearchLocation: { initialResults?: SearchResult[] };
  NearbyUsers: undefined;
  AddReview: { placeId: string };
  UserProfile: { userId: string };
};

export type MapNavigationProp = StackNavigationProp<MapStackParamList>;

export type PeopleStackParamList = {
  PeopleHome: undefined;
  UserProfile: { userId: string };
  Chat: { userId: string };
};

export type PlacesStackParamList = {
  PlacesHome: undefined;
  SavedPlaces: undefined;
  SharedPlaces: undefined;
  CheckIns: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProfileEdit: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  BlockedUsers: undefined;
};

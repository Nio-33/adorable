import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { FIREBASE_CONFIG } from '../config/constants';
import { Message, ChatRoom, User } from '../types';

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private storage: Storage;

  private constructor() {
    this.app = initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    });

    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Auth methods
  public auth() {
    return this.auth;
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    if (this.auth.currentUser) {
      return updateProfile(this.auth.currentUser, { displayName, photoURL });
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  // User methods
  public async createUser(userData: Omit<User, 'id'>) {
    const userRef = doc(collection(this.db, 'users'));
    await setDoc(userRef, {
      ...userData,
      id: userRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return userRef.id;
  }

  public async getUser(userId: string): Promise<User> {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return userDoc.data() as User;
  }

  public async updateUser(userId: string, updates: Partial<User>) {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Chat room methods
  public async createChatRoom(participants: string[]) {
    const chatRef = doc(collection(this.db, 'chatRooms'));
    const chatRoom: ChatRoom = {
      id: chatRef.id,
      participants,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(chatRef, chatRoom);
    return chatRoom;
  }

  public async getChatRoomById(chatRoomId: string): Promise<ChatRoom> {
    const chatRef = doc(this.db, 'chatRooms', chatRoomId);
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      throw new Error('Chat room not found');
    }
    return chatDoc.data() as ChatRoom;
  }

  public subscribeToChatRoom(chatRoomId: string, callback: (chatRoom: ChatRoom) => void) {
    const chatRef = doc(this.db, 'chatRooms', chatRoomId);
    return onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as ChatRoom);
      }
    });
  }

  public subscribeToChatRooms(userId: string, callback: (chatRooms: ChatRoom[]) => void) {
    const chatsQuery = query(
      collection(this.db, 'chatRooms'),
      where('participants', 'array-contains', userId)
    );
    return onSnapshot(chatsQuery, (snapshot) => {
      const chatRooms = snapshot.docs.map(doc => doc.data() as ChatRoom);
      callback(chatRooms);
    });
  }

  // Message methods
  public async sendMessage(chatRoomId: string, message: Omit<Message, 'id'>) {
    const messageRef = doc(collection(this.db, 'chatRooms', chatRoomId, 'messages'));
    const fullMessage: Message = {
      ...message,
      id: messageRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(messageRef, fullMessage);
    return fullMessage;
  }

  public subscribeToMessages(chatRoomId: string, callback: (messages: Message[]) => void) {
    const messagesQuery = query(
      collection(this.db, 'chatRooms', chatRoomId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => doc.data() as Message);
      callback(messages);
    });
  }

  // File upload methods
  public async uploadFile(path: string, file: Blob) {
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  // Cleanup
  public cleanup(): void {
    // Implement any cleanup needed
  }
}

export const firebaseService = FirebaseService.getInstance();

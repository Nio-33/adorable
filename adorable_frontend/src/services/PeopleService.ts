import { collection, query, where, getDocs, doc, getDoc, DocumentData, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { ChatUser } from '../types/ChatUser';
import { Location } from '../types/map';

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  interests?: string[];
  location?: Location;
  lastActive?: number;
  isOnline?: boolean;
  friendCount: number;
  mutualFriendCount?: number;
}

export interface FriendRequest {
  id: string;
  fromUser: ChatUser;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  timestamp: number;
}

interface UserRelationship {
  id: string;
  userId1: string;
  userId2: string;
  status: 'friends' | 'blocked';
  timestamp: number;
}

class PeopleService {
  private readonly friendRequestsCollection = collection(firestore, 'friendRequests');
  private readonly relationshipsCollection = collection(firestore, 'relationships');
  private readonly usersCollection = collection(firestore, 'users');

  async getUserProfile(userId: string): Promise<UserProfile> {
    const userDoc = await getDoc(doc(this.usersCollection, userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const data = userDoc.data();
    const friendCount = (await this.getFriends(userId)).length;

    return {
      id: userDoc.id,
      displayName: data.displayName || 'Anonymous',
      photoURL: data.photoURL,
      bio: data.bio,
      interests: data.interests,
      location: data.location,
      lastActive: data.lastActive,
      isOnline: data.isOnline,
      friendCount,
    };
  }

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      // This is a simple implementation. In a real app, you'd want to use
      // a more sophisticated search solution like Algolia or Elasticsearch
      const q = query(
        this.usersCollection,
        orderBy('displayName'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const users: UserProfile[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data() as DocumentData;
        if (
          data.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          users.push(this.mapToUserProfile(doc.id, data));
        }
      }

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async getNearbyUsers(location: Location, radiusInKm: number = 5): Promise<UserProfile[]> {
    // This is a simple implementation. In a real app, you'd want to use
    // geospatial queries with Firebase GeoFire or a similar solution
    const q = query(this.usersCollection);
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data() as DocumentData;
      if (data.location && this.isWithinRadius(location, data.location, radiusInKm)) {
        users.push(this.mapToUserProfile(doc.id, data));
      }
    }

    return users;
  }

  private mapToUserProfile(id: string, data: DocumentData): UserProfile {
    return {
      id,
      displayName: data.displayName || 'Anonymous',
      photoURL: data.photoURL,
      bio: data.bio,
      interests: data.interests,
      location: data.location,
      lastActive: data.lastActive,
      isOnline: data.isOnline,
      friendCount: 0, // This needs to be calculated separately if needed
    };
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const q = query(
      this.friendRequestsCollection,
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const requests: FriendRequest[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data() as DocumentData;
      const fromUserDoc = await getDoc(data.fromUser);
      
      if (fromUserDoc.exists()) {
        const fromUserData = fromUserDoc.data() as DocumentData;
        requests.push({
          id: doc.id,
          fromUser: {
            id: fromUserDoc.id,
            displayName: fromUserData.displayName || 'Anonymous',
            email: fromUserData.email || '',
            photoURL: fromUserData.photoURL,
            isOnline: fromUserData.isOnline,
            lastSeen: fromUserData.lastSeen,
          },
          toUserId: data.toUserId,
          status: data.status,
          message: data.message,
          timestamp: data.timestamp?.toMillis() || Date.now(),
        });
      }
    }

    return requests;
  }

  async sendFriendRequest(
    fromUser: UserProfile,
    toUserId: string
  ): Promise<string> {
    // Check if request already exists
    const existingQuery = query(
      this.friendRequestsCollection,
      where('fromUserId', '==', fromUser.id),
      where('toUserId', '==', toUserId)
    );

    const existingDocs = await getDocs(existingQuery);
    if (!existingDocs.empty) {
      throw new Error('Friend request already exists');
    }

    // Create new friend request
    const docRef = await addDoc(this.friendRequestsCollection, {
      fromUserId: fromUser.id,
      toUserId: toUserId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async respondToFriendRequest(
    requestId: string,
    userId: string,
    accept: boolean
  ): Promise<void> {
    const requestRef = doc(this.friendRequestsCollection, requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const request = requestDoc.data();
    if (request.toUserId !== userId) {
      throw new Error('Unauthorized to respond to this request');
    }

    const fromUserRef = request.fromUser;
    const fromUserDoc = await getDoc(fromUserRef);

    if (!fromUserDoc.exists()) {
      throw new Error('Requesting user not found');
    }

    const status = accept ? 'accepted' : 'declined';
    await updateDoc(requestRef, { status });

    if (accept) {
      await this.createRelationship(fromUserRef.id, userId, 'friends');
    }
  }

  async getFriends(userId: string): Promise<ChatUser[]> {
    const relationships = await this.getUserRelationships(userId, 'friends');
    const friendIds = relationships.map(rel => 
      rel.userId1 === userId ? rel.userId2 : rel.userId1
    );

    const friends: ChatUser[] = [];
    for (const friendId of friendIds) {
      const friendDoc = await getDoc(doc(this.usersCollection, friendId));
      if (friendDoc.exists()) {
        friends.push({
          id: friendDoc.id,
          ...friendDoc.data(),
        } as ChatUser);
      }
    }

    return friends;
  }

  async getMutualFriends(userId1: string, userId2: string): Promise<ChatUser[]> {
    const [user1Friends, user2Friends] = await Promise.all([
      this.getFriends(userId1),
      this.getFriends(userId2),
    ]);

    const user2FriendIds = new Set(user2Friends.map(f => f.id));
    return user1Friends.filter(friend => user2FriendIds.has(friend.id));
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    // Remove any existing relationship
    const existingRelationship = await this.getRelationship(userId, targetUserId);
    if (existingRelationship) {
      await deleteDoc(doc(this.relationshipsCollection, existingRelationship.id));
    }

    // Create blocking relationship
    await this.createRelationship(userId, targetUserId, 'blocked');

    // Delete any pending friend requests
    const requests = await getDocs(
      query(
        this.friendRequestsCollection,
        where('status', '==', 'pending'),
        where('fromUser', 'in', [
          doc(this.usersCollection, userId),
          doc(this.usersCollection, targetUserId),
        ]),
        where('toUserId', 'in', [userId, targetUserId])
      )
    );

    const deletePromises = requests.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    const relationship = await this.getRelationship(userId, targetUserId);
    if (relationship?.status === 'blocked') {
      await deleteDoc(doc(this.relationshipsCollection, relationship.id));
    }
  }

  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const relationship = await this.getRelationship(userId, targetUserId);
    return relationship?.status === 'blocked';
  }

  private async getRelationship(
    userId1: string,
    userId2: string
  ): Promise<UserRelationship | null> {
    const q = query(
      this.relationshipsCollection,
      where('userId1', 'in', [userId1, userId2]),
      where('userId2', 'in', [userId1, userId2]),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as UserRelationship;
  }

  private async createRelationship(
    userId1: string,
    userId2: string,
    status: UserRelationship['status']
  ): Promise<string> {
    const docRef = await addDoc(this.relationshipsCollection, {
      userId1,
      userId2,
      status,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  private async getUserRelationships(
    userId: string,
    status: UserRelationship['status']
  ): Promise<UserRelationship[]> {
    const q = query(
      this.relationshipsCollection,
      where('status', '==', status),
      where('userId1', 'in', [userId]),
      orderBy('timestamp', 'desc')
    );

    const q2 = query(
      this.relationshipsCollection,
      where('status', '==', status),
      where('userId2', 'in', [userId]),
      orderBy('timestamp', 'desc')
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q),
      getDocs(q2),
    ]);

    const relationships: UserRelationship[] = [];
    
    for (const doc of [...snapshot1.docs, ...snapshot2.docs]) {
      relationships.push({
        id: doc.id,
        ...doc.data(),
      } as UserRelationship);
    }

    return relationships;
  }

  private isWithinRadius(center: Location, point: Location, radiusInKm: number): boolean {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = this.toRad(center.latitude);
    const lat2 = this.toRad(point.latitude);
    const dLat = this.toRad(point.latitude - center.latitude);
    const dLon = this.toRad(point.longitude - center.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radiusInKm;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  async getBlockedUsers(userId: string): Promise<ChatUser[]> {
    try {
      const relationships = await this.getUserRelationships(userId, 'blocked');
      const blockedUserIds = relationships.map(rel => 
        rel.userId1 === userId ? rel.userId2 : rel.userId1
      );

      const blockedUsers: ChatUser[] = [];
      for (const blockedId of blockedUserIds) {
        const userDocRef = doc(firestore, 'users', blockedId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          blockedUsers.push({
            id: userDocSnap.id,
            displayName: userData.displayName || 'Unknown User',
            email: userData.email,
            photoURL: userData.photoURL,
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen?.toMillis() || 0,
          });
        }
      }

      return blockedUsers;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }
}

export const peopleService = new PeopleService(); 
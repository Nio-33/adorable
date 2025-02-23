import { collection, doc, addDoc, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { PlaceDetails } from '../types/map';

export interface PlacePhoto {
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface PlaceReview {
  rating: number;
  text: string;
  authorId: string;
  authorName: string;
  time: number;
}

export interface SavedPlace {
  placeId: string;
  placeName: string;
  placeAddress: string;
  savedAt: Date;
}

export interface CheckIn {
  placeId: string;
  checkedInAt: Date;
}

class PlaceInteractionService {
  private static instance: PlaceInteractionService;
  private savedPlacesCollection = collection(firestore, 'savedPlaces');
  private checkInsCollection = collection(firestore, 'checkIns');
  private photosCollection = collection(firestore, 'placePhotos');
  private reviewsCollection = collection(firestore, 'reviews');

  private constructor() {}

  public static getInstance(): PlaceInteractionService {
    if (!PlaceInteractionService.instance) {
      PlaceInteractionService.instance = new PlaceInteractionService();
    }
    return PlaceInteractionService.instance;
  }

  async savePlace(userId: string, place: PlaceDetails): Promise<void> {
    await addDoc(this.savedPlacesCollection, {
      userId,
      placeId: place.placeId,
      savedAt: Timestamp.now(),
      placeName: place.name,
      placeAddress: place.address,
    });
  }

  async getSavedPlaces(userId: string): Promise<SavedPlace[]> {
    const q = query(this.savedPlacesCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      placeId: doc.data().placeId,
      placeName: doc.data().placeName,
      placeAddress: doc.data().placeAddress,
      savedAt: doc.data().savedAt.toDate(),
    }));
  }

  async checkIn(userId: string, placeId: string): Promise<void> {
    await addDoc(this.checkInsCollection, {
      userId,
      placeId,
      checkedInAt: Timestamp.now(),
    });
  }

  async getCheckIns(userId: string): Promise<CheckIn[]> {
    const q = query(this.checkInsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      placeId: doc.data().placeId,
      checkedInAt: doc.data().checkedInAt.toDate(),
    }));
  }

  async uploadPlacePhoto(userId: string, placeId: string, photoUri: string): Promise<PlacePhoto> {
    // In a real app, you would upload the photo to a storage service like Firebase Storage
    // and get back a URL. For now, we'll just simulate this.
    const photo: PlacePhoto = {
      url: photoUri,
      uploadedBy: userId,
      uploadedAt: new Date(),
    };

    await addDoc(this.photosCollection, {
      ...photo,
      placeId,
      uploadedAt: Timestamp.fromDate(photo.uploadedAt),
    });

    return photo;
  }

  async getPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
    const q = query(this.photosCollection, where('placeId', '==', placeId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      url: doc.data().url,
      uploadedBy: doc.data().uploadedBy,
      uploadedAt: doc.data().uploadedAt.toDate(),
    }));
  }

  async getUserReview(userId: string, placeId: string): Promise<PlaceReview | null> {
    const q = query(
      this.reviewsCollection,
      where('authorId', '==', userId),
      where('placeId', '==', placeId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const reviewDoc = snapshot.docs[0];
    const data = reviewDoc.data();
    
    return {
      rating: data.rating,
      text: data.text,
      authorId: data.authorId,
      authorName: data.authorName,
      time: data.time.seconds,
    };
  }

  async addReview(
    userId: string,
    userName: string,
    placeId: string,
    rating: number,
    text: string
  ): Promise<void> {
    await addDoc(this.reviewsCollection, {
      placeId,
      rating,
      text,
      authorId: userId,
      authorName: userName,
      time: Timestamp.now(),
    });
  }
}

export const placeInteractionService = PlaceInteractionService.getInstance(); 
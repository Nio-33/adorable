import { Platform } from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';

class MediaPickerService {
  private static instance: MediaPickerService;

  private constructor() {}

  public static getInstance(): MediaPickerService {
    if (!MediaPickerService.instance) {
      MediaPickerService.instance = new MediaPickerService();
    }
    return MediaPickerService.instance;
  }

  private async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Adorable needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  async pickFromGallery(options: Partial<ImageLibraryOptions> = {}): Promise<ImagePickerResponse> {
    const defaultOptions: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
      ...options,
    };

    return new Promise((resolve, reject) => {
      launchImageLibrary(defaultOptions, (response) => {
        if (response.errorCode) {
          reject(new Error(response.errorMessage));
        } else if (response.didCancel) {
          reject(new Error('User cancelled image picker'));
        } else {
          resolve(response);
        }
      });
    });
  }

  async takePhoto(options: Partial<CameraOptions> = {}): Promise<ImagePickerResponse> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const defaultOptions: CameraOptions = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
      ...options,
    };

    return new Promise((resolve, reject) => {
      launchCamera(defaultOptions, (response) => {
        if (response.errorCode) {
          reject(new Error(response.errorMessage));
        } else if (response.didCancel) {
          reject(new Error('User cancelled camera'));
        } else {
          resolve(response);
        }
      });
    });
  }

  async takeVideo(options: Partial<CameraOptions> = {}): Promise<ImagePickerResponse> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const defaultOptions: CameraOptions = {
      mediaType: 'video',
      videoQuality: 'high',
      durationLimit: 60,
      saveToPhotos: true,
      ...options,
    };

    return new Promise((resolve, reject) => {
      launchCamera(defaultOptions, (response) => {
        if (response.errorCode) {
          reject(new Error(response.errorMessage));
        } else if (response.didCancel) {
          reject(new Error('User cancelled video recording'));
        } else {
          resolve(response);
        }
      });
    });
  }

  async pickVideo(options: Partial<ImageLibraryOptions> = {}): Promise<ImagePickerResponse> {
    const defaultOptions: ImageLibraryOptions = {
      mediaType: 'video',
      videoQuality: 'high',
      selectionLimit: 1,
      ...options,
    };

    return new Promise((resolve, reject) => {
      launchImageLibrary(defaultOptions, (response) => {
        if (response.errorCode) {
          reject(new Error(response.errorMessage));
        } else if (response.didCancel) {
          reject(new Error('User cancelled video picker'));
        } else {
          resolve(response);
        }
      });
    });
  }
}

export const mediaPickerService = MediaPickerService.getInstance(); 
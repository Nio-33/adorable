import { API_URL } from '@env';

interface Environment {
  API: {
    URL: string;
    TIMEOUT: number;
  };
  MAPS: {
    GOOGLE_MAPS_API_KEY: string | undefined;
    MAPBOX_ACCESS_TOKEN: string | undefined;
  };
  FIREBASE: {
    API_KEY: string | undefined;
    AUTH_DOMAIN: string | undefined;
    PROJECT_ID: string | undefined;
    STORAGE_BUCKET: string | undefined;
    MESSAGING_SENDER_ID: string | undefined;
    APP_ID: string | undefined;
    MEASUREMENT_ID: string | undefined;
    DATABASE_URL: string | undefined;
  };
}

export const ENV: Environment = {
  API: {
    URL: API_URL || 'http://localhost:8000/api',
    TIMEOUT: 10000,
  },
  MAPS: {
    GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    MAPBOX_ACCESS_TOKEN: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  },
  FIREBASE: {
    API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
    AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
    MEASUREMENT_ID: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    DATABASE_URL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  },
};

// Type definitions for environment variables
declare module '@env' {
  export const GOOGLE_MAPS_API_KEY: string;
  export const MAPBOX_ACCESS_TOKEN: string;
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
  export const FIREBASE_DATABASE_URL: string;
}

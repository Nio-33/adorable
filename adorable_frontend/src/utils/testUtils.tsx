import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../store/rootReducer';

interface WrapperProps {
  children: React.ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Record<string, any>;
  store?: ReturnType<typeof configureStore>;
}

function createTestStore(preloadedState?: Record<string, any>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: WrapperProps) {
    return (
      <Provider store={store}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    );
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Mock navigation props
export const createTestProps = (props: Record<string, any> = {}) => ({
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    ...props.navigation,
  },
  route: {
    params: {},
    ...props.route,
  },
});

// Mock geolocation
export const mockGeolocation = () => {
  const getCurrentPosition = jest.fn();
  const watchPosition = jest.fn();
  const clearWatch = jest.fn();

  // @ts-ignore
  global.navigator.geolocation = {
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };

  return {
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
};

// Mock permissions
export const mockPermissions = () => {
  const request = jest.fn();
  const check = jest.fn();

  return {
    request,
    check,
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      BLOCKED: 'blocked',
      UNAVAILABLE: 'unavailable',
    },
  };
};

// Mock async storage
export const mockAsyncStorage = () => {
  const store: Record<string, string> = {};

  return {
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(store[key]);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(store));
    }),
    store,
  };
};

// Mock network info
export const mockNetInfo = () => {
  const addEventListener = jest.fn();
  const removeEventListener = jest.fn();
  const fetch = jest.fn();

  return {
    addEventListener,
    removeEventListener,
    fetch,
    isConnected: {
      fetch: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

// Create a mock error
export const createError = (message: string, code?: string) => {
  const error = new Error(message);
  if (code) {
    // @ts-ignore
    error.code = code;
  }
  return error;
}; 
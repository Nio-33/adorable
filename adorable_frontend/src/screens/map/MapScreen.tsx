import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../config/theme';
import { SearchBar } from '../../components/molecules';
import { Loading } from '../../components/atoms';
import { useLocation } from '../../hooks/useLocation';
import { DEFAULT_LOCATION } from '../../config/constants';

export const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { location, loading, errorMsg, updateLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement location search
  };

  if (loading) {
    return <Loading size="large" text="Getting location..." />;
  }

  if (errorMsg) {
    // TODO: Implement proper error handling
    return null;
  }

  const initialRegion = {
    latitude: location?.coords.latitude || DEFAULT_LOCATION.latitude,
    longitude: location?.coords.longitude || DEFAULT_LOCATION.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        )}
      </MapView>

      <View style={[styles.searchContainer, { top: insets.top + SPACING.md }]}>
        <SearchBar
          value={searchQuery}
          onSearch={handleSearch}
          placeholder="Search places..."
          style={styles.searchBar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  searchBar: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 
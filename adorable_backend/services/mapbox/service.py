import requests
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.core.cache import cache
from datetime import datetime, timedelta

class MapBoxService:
    """Service for MapBox operations"""

    def __init__(self):
        """Initialize MapBox service"""
        self.access_token = settings.MAPBOX_ACCESS_TOKEN
        self.base_url = "https://api.mapbox.com"
        self.cache_timeout = 60 * 60 * 24  # 24 hours

    def geocode(self, address: str) -> Optional[Dict[str, float]]:
        """Geocode an address to coordinates"""
        cache_key = f"geocode_{address}"
        result = cache.get(cache_key)
        
        if result:
            return result

        try:
            url = f"{self.base_url}/geocoding/v5/mapbox.places/{address}.json"
            params = {
                'access_token': self.access_token,
                'limit': 1
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data['features']:
                coordinates = data['features'][0]['geometry']['coordinates']
                result = {
                    'lng': coordinates[0],
                    'lat': coordinates[1]
                }
                cache.set(cache_key, result, self.cache_timeout)
                return result
            
            return None

        except Exception as e:
            print(f"Geocoding error: {str(e)}")
            return None

    def reverse_geocode(self, lat: float, lng: float) -> Optional[Dict]:
        """Convert coordinates to address"""
        cache_key = f"reverse_geocode_{lat}_{lng}"
        result = cache.get(cache_key)
        
        if result:
            return result

        try:
            url = f"{self.base_url}/geocoding/v5/mapbox.places/{lng},{lat}.json"
            params = {
                'access_token': self.access_token,
                'limit': 1
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data['features']:
                result = {
                    'address': data['features'][0]['place_name'],
                    'context': data['features'][0].get('context', [])
                }
                cache.set(cache_key, result, self.cache_timeout)
                return result
            
            return None

        except Exception as e:
            print(f"Reverse geocoding error: {str(e)}")
            return None

    def get_directions(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        waypoints: Optional[List[Tuple[float, float]]] = None
    ) -> Optional[Dict]:
        """Get directions between points"""
        coordinates = [f"{origin[1]},{origin[0]}"]
        
        if waypoints:
            for point in waypoints:
                coordinates.append(f"{point[1]},{point[0]}")
                
        coordinates.append(f"{destination[1]},{destination[0]}")
        
        coords_str = ";".join(coordinates)
        cache_key = f"directions_{coords_str}"
        result = cache.get(cache_key)
        
        if result:
            return result

        try:
            url = f"{self.base_url}/directions/v5/mapbox/driving/{coords_str}"
            params = {
                'access_token': self.access_token,
                'overview': 'full',
                'geometries': 'geojson',
                'steps': True
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data['routes']:
                result = {
                    'distance': data['routes'][0]['distance'],
                    'duration': data['routes'][0]['duration'],
                    'geometry': data['routes'][0]['geometry'],
                    'steps': data['routes'][0]['legs'][0]['steps']
                }
                cache.set(cache_key, result, self.cache_timeout)
                return result
            
            return None

        except Exception as e:
            print(f"Directions error: {str(e)}")
            return None

    def get_places_nearby(
        self,
        lat: float,
        lng: float,
        radius: int = 1000,
        types: Optional[List[str]] = None
    ) -> List[Dict]:
        """Get places near coordinates"""
        cache_key = f"places_{lat}_{lng}_{radius}_{'-'.join(types or [])}"
        result = cache.get(cache_key)
        
        if result:
            return result

        try:
            url = f"{self.base_url}/geocoding/v5/mapbox.places/{lng},{lat}.json"
            params = {
                'access_token': self.access_token,
                'limit': 10,
                'radius': radius,
                'types': ','.join(types) if types else None
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            result = [{
                'id': feature['id'],
                'name': feature['text'],
                'address': feature['place_name'],
                'coordinates': feature['geometry']['coordinates'],
                'category': feature.get('properties', {}).get('category'),
                'distance': feature.get('properties', {}).get('distance')
            } for feature in data['features']]
            
            cache.set(cache_key, result, self.cache_timeout)
            return result

        except Exception as e:
            print(f"Places nearby error: {str(e)}")
            return []

    def get_static_map(
        self,
        center: Tuple[float, float],
        zoom: int = 12,
        width: int = 600,
        height: int = 400,
        markers: Optional[List[Dict]] = None
    ) -> Optional[str]:
        """Get static map image URL"""
        try:
            url = f"{self.base_url}/styles/v1/mapbox/streets-v11/static"
            
            # Add markers if provided
            if markers:
                marker_str = []
                for marker in markers:
                    color = marker.get('color', 'red')
                    label = marker.get('label', '')
                    coords = marker['coordinates']
                    marker_str.append(f"pin-s-{label}+{color}({coords[0]},{coords[1]})")
                url += f"/{','.join(marker_str)}"
            
            # Add center and zoom
            url += f"/{center[1]},{center[0]},{zoom}"
            
            # Add size
            url += f"/{width}x{height}"
            
            # Add access token
            url += f"?access_token={self.access_token}"
            
            return url

        except Exception as e:
            print(f"Static map error: {str(e)}")
            return None

# Create singleton instance
mapbox_service = MapBoxService() 
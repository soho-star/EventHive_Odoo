// Location service for handling geolocation and map-related functionality

class LocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
  }

  // Get current user location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          this.currentPosition = location;
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Watch user location for real-time updates
  watchLocation(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback?.(new Error('Geolocation is not supported'));
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.currentPosition = location;
        callback(location);
      },
      (error) => {
        errorCallback?.(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );

    return this.watchId;
  }

  // Stop watching location
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  // Get events sorted by distance from user location
  sortEventsByDistance(events, userLocation) {
    if (!userLocation) return events;

    return events.map(event => {
      if (event.latitude && event.longitude) {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          event.latitude,
          event.longitude
        );
        return { ...event, distance };
      }
      return { ...event, distance: Infinity };
    }).sort((a, b) => a.distance - b.distance);
  }

  // Check if location permission is granted
  async checkLocationPermission() {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      return 'unsupported';
    }
  }

  // Get location from address using MapTiler Geocoding API
  async geocodeAddress(address) {
    // Import the API key from config
    const { MAPTILER_API_KEY } = await import('../config/map');
    
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          latitude: feature.center[1],
          longitude: feature.center[0],
          address: feature.place_name,
          confidence: feature.relevance
        };
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(latitude, longitude) {
    // Import the API key from config
    const { MAPTILER_API_KEY } = await import('../config/map');
    
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return {
          address: data.features[0].place_name,
          components: data.features[0].context || []
        };
      }
      
      throw new Error('No address found');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // Get current position or return null
  getCurrentPosition() {
    return this.currentPosition;
  }

  // Check if geolocation is supported
  isGeolocationSupported() {
    return 'geolocation' in navigator;
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService;

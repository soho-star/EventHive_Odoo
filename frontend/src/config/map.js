// Map configuration for EventHive
// MapTiler configuration and utilities

// MapTiler API Key - In production, this should be in environment variables
export const MAPTILER_API_KEY = 'wujOwquwV2dH2cPpdhpY';

// Default map configuration
export const MAP_CONFIG = {
  // Default center coordinates (London)
  defaultCenter: [-0.1276, 51.5074],
  
  // Default zoom levels
  defaultZoom: 10,
  detailZoom: 15,
  cityZoom: 12,
  countryZoom: 6,
  
  // Zoom limits
  maxZoom: 18,
  minZoom: 2,
  
  // Map styles available
  styles: {
    streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`,
    streetsDark: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_API_KEY}`,
    satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`,
    outdoor: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_API_KEY}`,
  },
  
  // Default style
  defaultStyle: 'streetsDark',
  
  // Marker configuration
  markers: {
    upcoming: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      },
      scale: 1.0
    },
    past: {
      colors: {
        primary: '#9CA3AF',
        secondary: '#6B7280'
      },
      scale: 0.8
    },
    user: {
      color: '#3B82F6',
      scale: 1.2
    }
  },
  
  // Animation settings
  animations: {
    duration: 1000,
    easing: 'ease-out'
  },
  
  // Clustering settings
  clustering: {
    enabled: true,
    radius: 50,
    maxZoom: 14
  }
};

// Utility functions
export const mapUtils = {
  // Get map style URL
  getStyleUrl: (styleName = MAP_CONFIG.defaultStyle) => {
    return MAP_CONFIG.styles[styleName] || MAP_CONFIG.styles[MAP_CONFIG.defaultStyle];
  },
  
  // Calculate bounds for multiple coordinates
  calculateBounds: (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    
    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];
    
    coordinates.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
    
    return {
      sw: [minLng, minLat],
      ne: [maxLng, maxLat]
    };
  },
  
  // Format coordinates for display
  formatCoordinates: (lng, lat, precision = 4) => {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  },
  
  // Check if coordinates are valid
  isValidCoordinates: (lng, lat) => {
    return (
      typeof lng === 'number' && 
      typeof lat === 'number' && 
      lng >= -180 && lng <= 180 && 
      lat >= -90 && lat <= 90 &&
      !isNaN(lng) && !isNaN(lat)
    );
  }
};

export default MAP_CONFIG;

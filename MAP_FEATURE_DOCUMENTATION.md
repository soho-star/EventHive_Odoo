# EventHive Map Feature Documentation

## Overview

The EventHive map feature provides interactive map functionality using MapTiler SDK, allowing users to discover events geographically, view event locations, and get directions to venues.

## Features Implemented

### 🗺️ Core Map Functionality
- **Interactive Map Display**: Dark-themed MapTiler maps with navigation controls
- **Event Markers**: Color-coded markers for upcoming (blue/purple gradient) and past events (gray)
- **User Location**: Optional user location display with geolocation API
- **Interactive Popups**: Rich event information popups with booking links
- **Responsive Design**: Mobile-friendly map interface

### 📍 Location Services
- **Geolocation**: Get user's current location with permission handling
- **Distance Calculation**: Haversine formula for accurate distance calculations
- **Geocoding**: Address to coordinates conversion using MapTiler API
- **Reverse Geocoding**: Coordinates to address conversion
- **Location Sorting**: Sort events by distance from user location

### 🎪 Event Discovery
- **Map View Toggle**: Switch between grid and map views on Events page
- **Nearby Events**: Backend support for location-based event filtering
- **Filter Integration**: Category, location, and radius-based filtering
- **Real-time Updates**: Dynamic marker updates based on filters

## File Structure

```
frontend/src/
├── components/UI/
│   ├── MapComponent.js          # Core reusable map component
│   └── EventMap.js              # Specialized event discovery map
├── services/
│   └── locationService.js       # Location and geolocation utilities
├── config/
│   └── map.js                   # Map configuration and utilities
└── pages/
    ├── Events.js                # Events page with map toggle
    ├── EventDetails.js          # Event details with location map
    └── Home.js                  # Home page with featured events map
```

## Components

### MapComponent.js
**Core reusable map component**

```javascript
<MapComponent
  events={events}                // Array of events with lat/lng
  center={[lng, lat]}           // Map center coordinates
  zoom={12}                     // Initial zoom level
  height="400px"                // Map container height
  showUserLocation={true}       // Show user location marker
  onEventClick={handleClick}    // Event marker click handler
  className="custom-class"      // Additional CSS classes
/>
```

**Features:**
- Event markers with custom styling
- User location display
- Interactive popups with event details
- Automatic bounds fitting for multiple events
- Legend and event count display

### EventMap.js
**Specialized event discovery map**

```javascript
<EventMap
  initialFilters={{}}           // Initial filter state
  height="500px"                // Map height
  showControls={true}           // Show map controls
  showUserLocation={true}       // Enable geolocation
  className="custom-class"      // Additional CSS classes
/>
```

**Features:**
- Map/List view toggle
- Advanced filtering (category, location, radius)
- Nearby events integration
- Location permission handling
- Filter state management

### locationService.js
**Location utilities and services**

```javascript
// Get current location
const location = await locationService.getCurrentLocation();

// Calculate distance between two points
const distance = locationService.calculateDistance(lat1, lng1, lat2, lng2);

// Sort events by distance
const sortedEvents = locationService.sortEventsByDistance(events, userLocation);

// Geocode address
const coords = await locationService.geocodeAddress("New York, NY");

// Reverse geocode
const address = await locationService.reverseGeocode(lat, lng);
```

## Configuration

### Map Settings (config/map.js)
```javascript
export const MAP_CONFIG = {
  defaultCenter: [-0.1276, 51.5074],  // London coordinates
  defaultZoom: 10,
  detailZoom: 15,
  maxZoom: 18,
  minZoom: 2,
  
  styles: {
    streets: "...",
    streetsDark: "...",    // Default dark theme
    satellite: "...",
    outdoor: "..."
  },
  
  markers: {
    upcoming: { colors: { primary: '#3B82F6', secondary: '#8B5CF6' } },
    past: { colors: { primary: '#9CA3AF', secondary: '#6B7280' } },
    user: { color: '#3B82F6', scale: 1.2 }
  }
};
```

### MapTiler API Key
The API key is configured in `frontend/src/config/map.js`:
```javascript
export const MAPTILER_API_KEY = 'wujOwquwV2dH2cPpdhpY';
```

**⚠️ Production Note**: In production, this should be moved to environment variables:
```javascript
export const MAPTILER_API_KEY = process.env.REACT_APP_MAPTILER_API_KEY;
```

## Backend Integration

### Nearby Events Endpoint
The backend already supports nearby events through:
```
GET /api/events/nearby?latitude=LAT&longitude=LNG&radius=RADIUS&limit=LIMIT
```

### Event Model Support
Events include location fields:
- `latitude` (REAL)
- `longitude` (REAL) 
- `location` (TEXT) - Human-readable address

## Usage Examples

### Events Page Integration
```javascript
// Toggle between grid and map view
const [viewMode, setViewMode] = useState('grid');

{viewMode === 'map' ? (
  <EventMap
    initialFilters={filters}
    height="600px"
    showUserLocation={true}
  />
) : (
  // Grid view components
)}
```

### Event Details Location Map
```javascript
{event.latitude && event.longitude && (
  <MapComponent
    events={[event]}
    center={[event.longitude, event.latitude]}
    zoom={15}
    height="300px"
    showUserLocation={false}
  />
)}
```

### Home Page Featured Events
```javascript
<EventMap
  initialFilters={{}}
  height="500px"
  showControls={true}
  showUserLocation={true}
/>
```

## Styling

### CSS Classes
The map components use Tailwind CSS classes and include:
- Dark theme styling matching the app design
- Responsive breakpoints for mobile/desktop
- Backdrop blur effects for modern UI
- Gradient backgrounds and borders

### Map Theme
Using MapTiler's `streets-v2-dark` style to match the app's dark theme.

## Browser Compatibility

### Geolocation Support
- **Supported**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Fallback**: Graceful degradation when geolocation unavailable
- **HTTPS Required**: Geolocation only works over HTTPS in production

### Map Support
- **WebGL**: Required for MapTiler SDK
- **Mobile**: Touch gestures supported
- **Responsive**: Works on all screen sizes

## Performance Considerations

### Optimization Features
- **Marker Clustering**: Configured for better performance with many events
- **Lazy Loading**: Maps only load when visible
- **Caching**: Location data cached for 5 minutes
- **Debounced Updates**: Filter changes debounced to prevent excessive API calls

### Memory Management
- **Cleanup**: Proper cleanup of map instances and event listeners
- **Marker Management**: Efficient marker creation/removal
- **Popup Management**: Single popup instance reused

## Security

### API Key Security
- **Client-side**: API key is exposed in frontend (MapTiler allows this)
- **Domain Restrictions**: Configure domain restrictions in MapTiler dashboard
- **Rate Limiting**: MapTiler provides built-in rate limiting

### Location Privacy
- **Permission Required**: User must grant location access
- **Optional**: All location features work without user location
- **No Storage**: User location not stored server-side

## Error Handling

### Location Errors
- **Permission Denied**: Graceful fallback without user location
- **Position Unavailable**: Show appropriate error message
- **Timeout**: Configurable timeout with fallback

### Map Loading Errors
- **Network Issues**: Retry mechanism for failed map loads
- **Invalid Coordinates**: Validation for event coordinates
- **API Limits**: Error messages for quota exceeded

## Testing

### Manual Testing Checklist
- [ ] Map loads correctly with dark theme
- [ ] Event markers display with correct colors
- [ ] Popups show event information
- [ ] User location works when granted
- [ ] Filters update map markers
- [ ] Mobile responsive design
- [ ] Error handling for denied location
- [ ] Navigation controls work
- [ ] Zoom levels respect limits

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## Future Enhancements

### Planned Features
- [ ] **Marker Clustering**: Group nearby events at lower zoom levels
- [ ] **Custom Map Styles**: Additional theme options
- [ ] **Offline Support**: Cache map tiles for offline use
- [ ] **Directions Integration**: In-app directions to venues
- [ ] **Street View**: Integration with street view for venues
- [ ] **Event Density Heatmap**: Visual representation of event concentration
- [ ] **Route Planning**: Multi-event route optimization
- [ ] **Venue Details**: Rich venue information and photos

### Technical Improvements
- [ ] **Environment Variables**: Move API key to env vars
- [ ] **Map Caching**: Implement tile caching strategy
- [ ] **Performance Monitoring**: Track map loading times
- [ ] **Analytics**: Track map usage patterns
- [ ] **A/B Testing**: Test different map styles/features

## Troubleshooting

### Common Issues

**Map not loading:**
- Check MapTiler API key validity
- Verify network connectivity
- Check browser console for errors

**Location not working:**
- Ensure HTTPS in production
- Check browser location permissions
- Verify geolocation API support

**Markers not appearing:**
- Validate event coordinate data
- Check event filtering logic
- Verify map bounds calculation

**Performance issues:**
- Reduce number of simultaneous markers
- Implement marker clustering
- Optimize map style complexity

## Dependencies

### Required Packages
```json
{
  "@maptiler/sdk": "^3.7.0"
}
```

### Peer Dependencies
- React 18+
- React Query for data fetching
- Tailwind CSS for styling
- Heroicons for icons

## API Documentation

### MapTiler APIs Used
- **Maps API**: For map tiles and styling
- **Geocoding API**: For address to coordinates conversion
- **Reverse Geocoding API**: For coordinates to address conversion

### Rate Limits
- **Maps API**: 100,000 requests/month (free tier)
- **Geocoding API**: 100,000 requests/month (free tier)
- **Usage Monitoring**: Available in MapTiler dashboard

---

## Support

For issues related to the map functionality:
1. Check this documentation
2. Review browser console for errors
3. Verify MapTiler API key and quotas
4. Test with different browsers/devices

For MapTiler-specific issues:
- [MapTiler Documentation](https://docs.maptiler.com/)
- [MapTiler SDK Examples](https://docs.maptiler.com/sdk-js/)
- [MapTiler Support](https://support.maptiler.com/)

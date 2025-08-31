import React, { useRef, useEffect, useState } from 'react';
import { Map, Marker, Popup, LngLatBounds } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { MAPTILER_API_KEY } from '../../config/map';

const MapComponent = ({ 
  events = [], 
  center = [-74.006, 40.7128], // Default NYC
  zoom = 10, 
  height = '400px',
  showUserLocation = false,
  onEventClick,
  className = ''
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const markersRef = useRef([]);
  const popupsRef = useRef([]);

  // Function to add event markers
  const addEventMarkers = () => {
    if (!map.current) return;

    // Clear old markers/popups
    markersRef.current.forEach(marker => marker.remove());
    popupsRef.current.forEach(popup => popup.remove());
    markersRef.current = [];
    popupsRef.current = [];

    events.forEach((event) => {
      if (!event.latitude || !event.longitude) return;

      const eventDate = new Date(event.eventStart);
      const isUpcoming = eventDate > new Date();

      // Marker element
      const markerElement = document.createElement('div');
      markerElement.className = `
        w-8 h-8 bg-gradient-to-r ${
          isUpcoming ? 'from-blue-500 to-purple-600' : 'from-gray-400 to-gray-600'
        }
        rounded-full border-2 border-white shadow-lg cursor-pointer 
        flex items-center justify-center transform hover:scale-110 transition-transform
      `;

      markerElement.innerHTML = `
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
            00-2-2H5z" />
        </svg>
      `;

      const marker = new Marker({ element: markerElement })
        .setLngLat([event.longitude, event.latitude])
        .addTo(map.current);

      // Popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-4 max-w-sm';
      popupContent.innerHTML = `
        <div class="mb-3">
          ${event.posterUrl ? `<img src="${event.posterUrl}" alt="${event.name}" class="w-full h-32 object-cover rounded-lg mb-3" />` : ''}
          <h3 class="font-semibold text-lg text-gray-900 mb-2">${event.name}</h3>
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                002-2V7a2 2 0 00-2-2H5z" />
            </svg>
            ${eventDate.toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            })}
          </div>
          <div class="flex items-center text-sm text-gray-600 mb-2">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 
                0 01-2.827 0l-4.244-4.243a8 8 0 
                1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 
                0z" />
            </svg>
            ${event.location}
          </div>
          <div class="flex items-center text-sm text-gray-600 mb-3">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 
                0 00-2 2v3a2 2 0 110 4v3a2 2 
                0 002 2h14a2 2 0 002-2v-3a2 2 
                0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            ${event.ticketTypes?.[0]?.price === 0 ? 'Free' : `$${event.ticketTypes?.[0]?.price}`}
          </div>
        </div>
        <div class="flex gap-2">
          <a href="/events/${event.id}" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            View Details
          </a>
        </div>
      `;

      const popup = new Popup({ closeButton: true, closeOnClick: false, maxWidth: '320px' })
        .setDOMContent(popupContent)
        .setLngLat([event.longitude, event.latitude]);

      markerElement.addEventListener('click', () => {
        popupsRef.current.forEach(p => p.remove());
        popup.addTo(map.current);
        if (onEventClick) onEventClick(event);
      });

      markersRef.current.push(marker);
      popupsRef.current.push(popup);
    });

    // Fit bounds to events
    if (events.length > 0) {
      const bounds = events.reduce((b, event) => {
        if (event.latitude && event.longitude) b.extend([event.longitude, event.latitude]);
        return b;
      }, new LngLatBounds());

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      }
    }
  };

  useEffect(() => {
    if (map.current) return;

    console.log('🔍 Map initialization starting...');
    console.log('🔑 API Key:', MAPTILER_API_KEY);
    console.log('📦 Container:', mapContainer.current);
    console.log('🎯 Center:', center);
    console.log('🔍 Zoom:', zoom);

    // Ensure container exists and is ready
    if (!mapContainer.current) {
      console.error('❌ Map container not found!');
      return;
    }

    // Wait for next tick to ensure container is fully rendered
    setTimeout(() => {
      try {
        console.log('🚀 Creating MapTiler map...');
        
        // Initialize the map with explicit API key in style URL
        map.current = new Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_API_KEY}`,
          center: center,
          zoom: zoom,
          maxZoom: 18,
          minZoom: 2
        });

        console.log('✅ Map instance created:', map.current);

        // Wait for map to load
        map.current.on('load', () => {
          console.log('🎉 Map loaded successfully!');
          if (events.length > 0) {
            console.log('📍 Adding event markers...');
            addEventMarkers();
          }
        });

        // Add error handling
        map.current.on('error', (e) => {
          console.error('❌ Map error:', e);
        });

        // Handle user location
        if (showUserLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userCoords = [pos.coords.longitude, pos.coords.latitude];
              setUserLocation(userCoords);
              console.log('📍 User location:', userCoords);

              new Marker({ color: '#3B82F6', scale: 1.2 })
                .setLngLat(userCoords)
                .addTo(map.current);

              if (center[0] === -74.006 && center[1] === 40.7128) {
                map.current.setCenter(userCoords);
                map.current.setZoom(12);
              }
            },
            (err) => console.warn('⚠️ Could not get user location:', err)
          );
        }
      } catch (err) {
        console.error('❌ Error initializing map:', err);
        console.error('Error details:', err.message, err.stack);
      }
    }, 100);

    return () => {
      if (map.current) {
        console.log('🧹 Cleaning up map...');
        map.current.remove();
      }
    };
  }, [center, zoom, showUserLocation]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) addEventMarkers();
  }, [events, onEventClick]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-800"
        style={{ height: height || '400px' }}
      />
      
      {/* Debug Info */}
      <div className="absolute top-2 left-2 bg-black/80 text-white p-3 rounded text-xs font-mono">
        <div>Events: {events.length}</div>
        <div>Container: {mapContainer.current ? '✅ Found' : '❌ Not Found'}</div>
        <div>Map: {map.current ? '✅ Loaded' : '❌ Not Loaded'}</div>
        <div>API Key: {MAPTILER_API_KEY ? '✅ Set' : '❌ Missing'}</div>
      </div>
      
      {/* Fallback if map fails */}
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <div className="text-lg font-semibold mb-2">Loading Map...</div>
            <div className="text-sm text-gray-300 mb-4">Check console for debug info</div>
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh clicked');
                if (mapContainer.current) {
                  console.log('📦 Container dimensions:', mapContainer.current.offsetWidth, 'x', mapContainer.current.offsetHeight);
                }
              }}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Debug Info
            </button>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border border-white"></div>
            <span className="text-gray-700">Upcoming Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full border border-white"></div>
            <span className="text-gray-700">Past Events</span>
          </div>
          {showUserLocation && userLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
              <span className="text-gray-700">Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Events Count */}
      {events.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <span className="text-sm font-medium text-gray-700">
            {events.length} event{events.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;

import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import L from 'leaflet';

export default function LocationPicker({
  latitude,
  longitude,
  locationName,
  onLocationChange,
}) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null); // { type: 'success'|'error'|'info', message: '' }
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const latNum = parseFloat(latitude) || 25.4358;
    const lngNum = parseFloat(longitude) || 81.8463;

    if (!mapInstanceRef.current) {
      // Fix default Leaflet icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current).setView([latNum, lngNum], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([latNum, lngNum], { draggable: true }).addTo(map);

      // Handle marker drag
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        onLocationChange({
          latitude: position.lat.toFixed(6),
          longitude: position.lng.toFixed(6),
        });
      });

      // Handle map click
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationChange({
          latitude: e.latlng.lat.toFixed(6),
          longitude: e.latlng.lng.toFixed(6),
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
        const latLng = [parseFloat(latitude), parseFloat(longitude)];
        markerRef.current.setLatLng(latLng);
        mapInstanceRef.current.setView(latLng, mapInstanceRef.current.getZoom() || 14);
      }
    }

    return () => {
      // Keep map instance alive or clean on unmount
    };
  }, [latitude, longitude]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({
        type: 'error',
        message: 'Geolocation is not supported by your current browser. Please enter coordinates manually.',
      });
      return;
    }

    setGeoLoading(true);
    setGeoStatus({ type: 'info', message: 'Fetching GPS coordinates...' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        
        let detectedAddress = locationName;
        // Attempt reverse-geocoding via OpenStreetMap Nominatim for convenience
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name && (!locationName || locationName.trim() === '')) {
              detectedAddress = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch {
          // Ignore reverse geocode network error, coordinates are already obtained
        }

        onLocationChange({
          latitude: lat,
          longitude: lng,
          locationName: detectedAddress || locationName,
        });

        setGeoLoading(false);
        setGeoStatus({
          type: 'success',
          message: `Location detected accurately (±${Math.round(pos.coords.accuracy)}m)`,
        });
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) msg = 'Location permission was denied. You can enter the location manually below.';
        else if (err.code === 2) msg = 'Location is unavailable. Please enter coordinates manually.';
        else if (err.code === 3) msg = 'Location request timed out. Please retry or enter manually.';
        setGeoStatus({ type: 'error', message: msg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div>
      {/* Geolocation Trigger Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
          Click the map or use device GPS:
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={geoLoading}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'var(--primary-300)', color: 'var(--primary-700)', gap: '0.35rem' }}
        >
          {geoLoading ? <RefreshCw size={15} className="animate-spin" /> : <Navigation size={15} />}
          <span>{geoLoading ? 'Detecting...' : 'Use Current Location'}</span>
        </button>
      </div>

      {/* Geolocation feedback alert */}
      {geoStatus && (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor:
              geoStatus.type === 'success'
                ? 'var(--primary-50)'
                : geoStatus.type === 'error'
                ? '#fee2e2'
                : 'var(--slate-100)',
            color:
              geoStatus.type === 'success'
                ? 'var(--primary-800)'
                : geoStatus.type === 'error'
                ? '#b91c1c'
                : 'var(--slate-700)',
            border: `1px solid ${
              geoStatus.type === 'success'
                ? 'var(--primary-200)'
                : geoStatus.type === 'error'
                ? '#fecaca'
                : 'var(--slate-200)'
            }`,
          }}
        >
          {geoStatus.type === 'success' ? (
            <CheckCircle2 size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
          )}
          <span>{geoStatus.message}</span>
        </div>
      )}

      {/* Location Name Input */}
      <div className="form-group">
        <label className="form-label" htmlFor="locationName">
          <span>Location / Landmark Name *</span>
          <span className="form-label-optional">e.g. Near BBS College, Phaphamau Road</span>
        </label>
        <input
          id="locationName"
          type="text"
          value={locationName}
          onChange={(e) => onLocationChange({ locationName: e.target.value })}
          placeholder="Enter street, landmark, or area name"
          className="form-input"
          required
        />
      </div>

      {/* Coordinate Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <label className="form-label" htmlFor="latitude">
            <span>Latitude *</span>
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLocationChange({ latitude: e.target.value })}
            placeholder="e.g. 25.435800"
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="longitude">
            <span>Longitude *</span>
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLocationChange({ longitude: e.target.value })}
            placeholder="e.g. 81.846300"
            className="form-input"
            required
          />
        </div>
      </div>

      {/* Interactive Map Picker */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-300)',
          overflow: 'hidden',
          zIndex: 1,
        }}
      />
      <div className="form-hint" style={{ textAlign: 'right' }}>
        Tip: Drag the pin or click anywhere on the map to pinpoint waste location
      </div>
    </div>
  );
}

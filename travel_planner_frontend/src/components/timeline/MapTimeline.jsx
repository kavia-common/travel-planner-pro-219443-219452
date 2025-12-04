import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import DayList from './DayList';
import TimelineItem from './TimelineItem';
import { getDailyItinerary, getCoordinatesSequenceWithGeocoding } from '../../services/itineraryService';
import { env } from '../../config/env';

// PUBLIC_INTERFACE
export default function MapTimeline({ trip, items = [], onAddPlace }) {
  /** Split layout map + day list with synchronized focus between markers and list. */
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [provider, setProvider] = useState((process.env.REACT_APP_MAP_PROVIDER || 'maplibre').toLowerCase());
  const [mapReady, setMapReady] = useState(false);
  const [geocoded, setGeocoded] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const markersRef = useRef({});
  const lineRef = useRef(null);

  // Prepare days grouped
  const daysMap = useMemo(() => getDailyItinerary({ trip, items }), [trip, items]);
  const days = useMemo(() => Array.from(daysMap.keys()).sort(), [daysMap]);

  // Compute coordinates with geocoding/caching
  useEffect(() => {
    let mounted = true;
    (async () => {
      const seq = await getCoordinatesSequenceWithGeocoding(trip, items);
      if (mounted) setGeocoded(seq);
    })();
    return () => { mounted = false; };
  }, [trip, items]);

  // Initialize map
  useEffect(() => {
    const prov = provider;
    let cleanup = () => {};
    async function init() {
      if (!containerRef.current) return;
      if (mapRef.current) {
        // already initialized
        setMapReady(true);
        return;
      }

      if (prov === 'mapbox') {
        // Lazy load mapbox-gl if available
        const token = process.env.REACT_APP_MAPBOX_TOKEN;
        if (!token) {
          // eslint-disable-next-line no-console
          console.warn('MAPTIMELINE: Mapbox chosen but REACT_APP_MAPBOX_TOKEN missing. Falling back to MapLibre.');
          setProvider('maplibre');
        }
      }

      if (prov === 'google') {
        // For demo, fallback if key missing
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!key) {
          // eslint-disable-next-line no-console
          console.warn('MAPTIMELINE: Google chosen but REACT_APP_GOOGLE_MAPS_API_KEY missing. Falling back to MapLibre.');
          setProvider('maplibre');
        }
      }

      if (prov === 'google') {
        // Lightweight Google Maps JS API loader
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const existing = document.getElementById('google-maps-script');
        const loadGoogle = () =>
          new Promise((resolve, reject) => {
            if (window.google && window.google.maps) return resolve();
            const s = document.createElement('script');
            s.id = 'google-maps-script';
            s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
          });
        try {
          if (!existing) {
            await loadGoogle();
          } else if (!(window.google && window.google.maps)) {
            await new Promise((res) => {
              existing.addEventListener('load', () => res());
            });
          }
          const map = new window.google.maps.Map(containerRef.current, {
            center: { lat: 20, lng: 0 },
            zoom: 2,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          mapRef.current = { api: 'google', map };
          setMapReady(true);
          cleanup = () => {};
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to load Google Maps. Falling back to MapLibre.', e);
          setProvider('maplibre');
        }
        return;
      }

      if (prov === 'mapbox') {
        try {
          const mapboxgl = await import('mapbox-gl');
          mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
          const map = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 20],
            zoom: 2,
          });
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapRef.current = { api: 'mapbox', map, mapboxgl };
          map.on('load', () => setMapReady(true));
          cleanup = () => map.remove();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to init Mapbox. Falling back to MapLibre.', e);
          setProvider('maplibre');
        }
        return;
      }

      // Default: MapLibre
      try {
        const maplibregl = await import('maplibre-gl');
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [0, 20],
          zoom: 2,
        });
        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        mapRef.current = { api: 'maplibre', map, maplibregl };
        map.on('load', () => setMapReady(true));
        cleanup = () => map.remove();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to init MapLibre', e);
      }
    }
    init();
    return () => {
      if (cleanup) cleanup();
      markersRef.current = {};
      lineRef.current = null;
      mapRef.current = null;
    };
  }, [provider]);

  // Render markers and polyline on map
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const { api, map, maplibregl, mapboxgl } = mapRef.current;

    // Clear existing markers and line
    Object.values(markersRef.current).forEach((m) => {
      if (api === 'google') {
        m.setMap(null);
      } else {
        if (m.remove) m.remove();
      }
    });
    markersRef.current = {};
    if (api !== 'google') {
      try {
        if (lineRef.current && map.getSource && map.getSource(lineRef.current)) {
          // remove previous line layer/source
        }
      // eslint-disable-next-line no-empty
      } catch {}
    }

    // Fit bounds
    const coords = geocoded.filter(({ lat, lon }) => typeof lat === 'number' && typeof lon === 'number');
    if (!coords.length) return;

    const boundsLike = coords.reduce(
      (acc, c) => {
        acc.minLng = Math.min(acc.minLng, c.lon);
        acc.maxLng = Math.max(acc.maxLng, c.lon);
        acc.minLat = Math.min(acc.minLat, c.lat);
        acc.maxLat = Math.max(acc.maxLat, c.lat);
        return acc;
      },
      { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
    );

    if (api === 'google') {
      const bounds = new window.google.maps.LatLngBounds();
      coords.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lon }));
      map.fitBounds(bounds, 64);
      // markers
      geocoded.forEach((c) => {
        const marker = new window.google.maps.Marker({
          position: { lat: c.lat, lng: c.lon },
          map,
          title: c.title || c.name || c.date || '',
        });
        marker.addListener('click', () => {
          setFocusedId(c.id || c.itemId || `${c.lat},${c.lon}`);
        });
        markersRef.current[c.id || c.itemId || `${c.lat},${c.lon}`] = marker;
      });
      // polyline
      // eslint-disable-next-line no-undef
      const path = geocoded.map((c) => ({ lat: c.lat, lng: c.lon }));
      // eslint-disable-next-line no-undef
      const poly = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#2563EB',
        strokeOpacity: 0.8,
        strokeWeight: 3,
      });
      poly.setMap(map);
      lineRef.current = poly;
    } else if (api === 'mapbox') {
      const b = new mapboxgl.LngLatBounds(
        [boundsLike.minLng, boundsLike.minLat],
        [boundsLike.maxLng, boundsLike.maxLat]
      );
      map.fitBounds(b, { padding: 64 });
      // markers
      geocoded.forEach((c) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.borderRadius = '50%';
        el.style.background = '#2563EB';
        el.style.boxShadow = '0 0 0 2px white, 0 0 0 4px rgba(37,99,235,0.3)';
        el.style.transition = 'transform 150ms ease';
        el.addEventListener('click', () => setFocusedId(c.id || c.itemId || `${c.lat},${c.lon}`));
        const m = new mapboxgl.Marker(el).setLngLat([c.lon, c.lat]).addTo(map);
        markersRef.current[c.id || c.itemId || `${c.lat},${c.lon}`] = m;
      });
      // polyline
      const lineId = 'timeline-line';
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(lineId)) map.removeSource(lineId);
      map.addSource(lineId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: geocoded.map((c) => [c.lon, c.lat]),
          },
        },
      });
      map.addLayer({
        id: lineId,
        type: 'line',
        source: lineId,
        paint: {
          'line-color': '#2563EB',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });
      lineRef.current = lineId;
    } else {
      // maplibre
      const b = new maplibregl.LngLatBounds(
        [boundsLike.minLng, boundsLike.minLat],
        [boundsLike.maxLng, boundsLike.maxLat]
      );
      map.fitBounds(b, { padding: 64 });
      geocoded.forEach((c) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.borderRadius = '50%';
        el.style.background = '#2563EB';
        el.style.boxShadow = '0 0 0 2px white, 0 0 0 4px rgba(37,99,235,0.3)';
        el.style.transition = 'transform 150ms ease';
        el.addEventListener('click', () => setFocusedId(c.id || c.itemId || `${c.lat},${c.lon}`));
        const m = new maplibregl.Marker(el).setLngLat([c.lon, c.lat]).addTo(map);
        markersRef.current[c.id || c.itemId || `${c.lat},${c.lon}`] = m;
      });
      const lineId = 'timeline-line';
      if (map.getLayer && map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource && map.getSource(lineId)) map.removeSource(lineId);
      map.addSource(lineId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: geocoded.map((c) => [c.lon, c.lat]),
          },
        },
      });
      map.addLayer({
        id: lineId,
        type: 'line',
        source: lineId,
        paint: {
          'line-color': '#2563EB',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });
      lineRef.current = lineId;
    }
  }, [mapReady, geocoded]);

  // Focus on marker when list selection changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !focusedId) return;
    const hit = geocoded.find((c) => (c.id || c.itemId || `${c.lat},${c.lon}`) === focusedId);
    if (!hit) return;
    const { api, map } = mapRef.current;
    if (api === 'google') {
      map.panTo({ lat: hit.lat, lng: hit.lon });
      map.setZoom(Math.max(map.getZoom(), 8));
    } else {
      map.easeTo({ center: [hit.lon, hit.lat], zoom: Math.max(map.getZoom(), 8) });
    }
    // pulse marker
    const marker = markersRef.current[focusedId];
    if (marker) {
      if (api === 'google') {
        // No simple pulse API; noop
      } else {
        const el = marker.getElement ? marker.getElement() : null;
        if (el) {
          el.style.transform = 'scale(1.4)';
          setTimeout(() => (el.style.transform = 'scale(1)'), 200);
        }
      }
    }
  }, [focusedId, geocoded, mapReady]);

  const onFocusDay = useCallback((dateKey) => {
    // Find the first item with coords on that day
    const dayItems = daysMap.get(dateKey) || [];
    const withCoord = geocoded.find((c) => dayItems.some((it) => it.id === c.itemId));
    if (withCoord) {
      setFocusedId(withCoord.id || withCoord.itemId || `${withCoord.lat},${withCoord.lon}`);
    }
  }, [daysMap, geocoded]);

  const onFocusItem = useCallback((item) => {
    // find item match
    const match = geocoded.find((c) => c.itemId === item.id);
    if (match) setFocusedId(match.id || match.itemId || `${match.lat},${match.lon}`);
  }, [geocoded]);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
      <div className="card" style={{ padding: 0, height: 480, overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600 }}>Map</div>
          <span className="chip">Provider: {provider}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div ref={containerRef} style={{ width: '100%', height: 420 }} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600 }}>Timeline</div>
          <div className="text-xs text-gray-500">{days.length} days</div>
        </div>
        <div className="card-body" style={{ maxHeight: 420, overflow: 'auto' }}>
          <DayList
            days={days}
            daysMap={daysMap}
            onFocusDay={onFocusDay}
            onAddPlace={onAddPlace}
            renderItem={(it) => (
              <TimelineItem key={it.id} item={it} onFocus={() => onFocusItem(it)} />
            )}
          />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import type { ParkingLocation } from '../../types';
import { formatPrice, formatAvailability } from '../../utils/format';

// Fix Leaflet default marker icons
const createParkingIcon = (isSelected: boolean) =>
  new Icon({
    iconUrl: isSelected
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

interface ParkingMapProps {
  parkingList: ParkingLocation[];
  selectedId?: string | null;
  onSelectParking?: (parking: ParkingLocation) => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function ParkingMap({
  parkingList,
  selectedId,
  onSelectParking,
  userLocation,
  center = [19.0760, 72.8777], // Default: Mumbai
  zoom = 13,
}: ParkingMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  useEffect(() => {
    if (parkingList.length > 0) {
      const first = parkingList[0];
      setMapCenter([first.latitude, first.longitude]);
    }
  }, [parkingList]);

  useEffect(() => {
    if (selectedId) {
      const found = parkingList.find(p => p.id === selectedId);
      if (found) {
        setMapCenter([found.latitude, found.longitude]);
        setMapZoom(16);
      }
    }
  }, [selectedId, parkingList]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="h-full w-full rounded-xl"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={mapCenter} zoom={mapZoom} />

      {/* User location marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <div className="text-sm font-medium">📍 Your Location</div>
          </Popup>
        </Marker>
      )}

      {/* Parking markers */}
      {parkingList.map(parking => {
        const availability = formatAvailability(parking.availability_status);
        const isSelected = parking.id === selectedId;

        return (
          <Marker
            key={parking.id}
            position={[parking.latitude, parking.longitude]}
            icon={createParkingIcon(isSelected)}
            eventHandlers={{
              click: () => onSelectParking?.(parking),
            }}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{parking.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{parking.address}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    availability.color === 'green' ? 'bg-green-100 text-green-800' :
                    availability.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    availability.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {availability.label}
                  </span>
                  <span className="text-xs font-semibold text-primary-700">
                    {formatPrice(parking.price, parking.currency, parking.pricing_unit)}
                  </span>
                </div>
                <Link
                  to={`/parking/${parking.id}`}
                  className="block text-center text-xs bg-primary-600 text-white py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

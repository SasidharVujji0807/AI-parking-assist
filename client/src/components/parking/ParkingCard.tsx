import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Zap, Shield, ParkingSquare, Heart } from 'lucide-react';
import type { ParkingLocation } from '../../types';
import { formatPrice, formatDistance, formatAvailability, formatParkingType } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ParkingCardProps {
  parking: ParkingLocation;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ParkingCard({
  parking,
  isFavorite = false,
  onFavoriteToggle,
  isSelected = false,
  onClick,
}: ParkingCardProps) {
  const availability = formatAvailability(parking.availability_status);

  return (
    <div
      className={`card p-4 hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <ParkingSquare className="w-6 h-6 text-primary-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {parking.name}
              </h3>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{parking.city || parking.address}</span>
              </div>
            </div>

            {onFavoriteToggle && (
              <button
                onClick={(e) => { e.stopPropagation(); onFavoriteToggle(parking.id); }}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={availability.color}>{availability.label}</Badge>

            {parking.rating && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {parking.rating.toFixed(1)}
                <span className="text-gray-400">({parking.review_count})</span>
              </span>
            )}

            {parking.distance_km !== undefined && (
              <span className="text-xs text-gray-500">{formatDistance(parking.distance_km)}</span>
            )}
          </div>

          {/* Price and amenities */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-primary-700 font-semibold text-sm">
              {formatPrice(parking.price, parking.currency, parking.pricing_unit)}
            </span>

            <div className="flex items-center gap-2 text-gray-400">
              {parking.amenities.includes('ev_charging') && (
                <span title="EV Charging"><Zap className="w-3.5 h-3.5 text-green-500" /></span>
              )}
              {parking.amenities.includes('covered') && (
                <span title="Covered Parking">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </span>
              )}
              {(parking.amenities.includes('security') || parking.amenities.includes('cctv')) && (
                <span title="Security"><Shield className="w-3.5 h-3.5" /></span>
              )}
              {parking.is_24_7 && (
                <span title="24/7"><Clock className="w-3.5 h-3.5 text-blue-500" /></span>
              )}
            </div>
          </div>

          {/* View details */}
          <div className="mt-3">
            <Link
              to={`/parking/${parking.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary-600 text-xs font-medium hover:text-primary-700 transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

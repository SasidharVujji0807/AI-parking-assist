import { format, formatDistanceToNow } from 'date-fns';
import type { AvailabilityStatus, ParkingType, Amenity } from '../types';

export function formatPrice(price?: number | null, currency = 'INR', unit?: string | null): string {
  if (!price) return 'Price unavailable';
  const symbol = currency === 'INR' ? '₹' : currency;
  const formatted = `${symbol}${price.toFixed(0)}`;
  if (unit) return `${formatted}/${unit}`;
  return formatted;
}

export function formatDistance(km?: number): string {
  if (km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)}km away`;
}

export function formatAvailability(status: AvailabilityStatus): { label: string; color: 'green' | 'yellow' | 'red' | 'gray' } {
  switch (status) {
    case 'available': return { label: 'Available', color: 'green' };
    case 'limited': return { label: 'Limited', color: 'yellow' };
    case 'full': return { label: 'Full', color: 'red' };
    case 'closed': return { label: 'Closed', color: 'red' };
    case 'unknown': return { label: 'Status Unknown', color: 'gray' };
    default: return { label: 'Unknown', color: 'gray' };
  }
}

export function formatParkingType(type: ParkingType): string {
  const labels: Record<ParkingType, string> = {
    street: 'Street Parking',
    garage: 'Parking Garage',
    lot: 'Parking Lot',
    private: 'Private Parking',
    mall: 'Mall Parking',
    airport: 'Airport Parking',
    hospital: 'Hospital Parking',
    hotel: 'Hotel Parking',
    office: 'Office Parking',
    residential: 'Residential Parking',
    valet: 'Valet Parking',
    public: 'Public Parking',
  };
  return labels[type] || type;
}

export function formatAmenity(amenity: Amenity): string {
  const labels: Record<Amenity, string> = {
    ev_charging: 'EV Charging',
    security: 'Security',
    cctv: 'CCTV',
    covered: 'Covered',
    accessible: 'Accessible',
    restroom: 'Restroom',
    valet: 'Valet',
    lighting: 'Lighting',
    car_wash: 'Car Wash',
  };
  return labels[amenity] || amenity;
}

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatHours(opening?: string | null, closing?: string | null, is24h?: boolean): string {
  if (is24h) return 'Open 24/7';
  if (!opening || !closing) return 'Hours unavailable';
  return `${opening} – ${closing}`;
}

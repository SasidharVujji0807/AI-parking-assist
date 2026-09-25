import { useState } from 'react';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { SearchFilters, ParkingType, VehicleType, AvailabilityStatus } from '../../types';

interface ParkingFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  loading?: boolean;
}

export function ParkingFilters({ filters, onFiltersChange, onSearch, loading }: ParkingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update(key: keyof SearchFilters, value: unknown) {
    onFiltersChange({ ...filters, [key]: value || undefined });
  }

  function clearAll() {
    onFiltersChange({ query: filters.query });
  }

  const parkingTypeOptions = [
    { value: 'garage', label: 'Garage' },
    { value: 'lot', label: 'Parking Lot' },
    { value: 'street', label: 'Street Parking' },
    { value: 'mall', label: 'Mall Parking' },
    { value: 'public', label: 'Public Parking' },
    { value: 'private', label: 'Private Parking' },
    { value: 'airport', label: 'Airport' },
    { value: 'hospital', label: 'Hospital' },
  ];

  const vehicleTypeOptions = [
    { value: 'car', label: 'Car' },
    { value: 'suv', label: 'SUV' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'van', label: 'Van' },
    { value: 'ev', label: 'Electric Vehicle' },
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited' },
  ];

  const hasActiveFilters = filters.maxPrice || filters.parkingType || filters.vehicleType ||
    filters.availability || filters.evCharging || filters.covered ||
    filters.security || filters.accessible || filters.is24h;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by location, city, or area..."
            value={filters.query || ''}
            onChange={(e) => update('query', e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="secondary"
          icon={<SlidersHorizontal className="w-4 h-4" />}
          className="flex-shrink-0"
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-4 h-4 bg-primary-600 rounded-full text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        <Button onClick={onSearch} loading={loading} className="flex-shrink-0">
          Search
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select
              label="Parking Type"
              placeholder="Any type"
              value={filters.parkingType || ''}
              onChange={(e) => update('parkingType', e.target.value as ParkingType)}
              options={parkingTypeOptions}
            />

            <Select
              label="Vehicle Type"
              placeholder="Any vehicle"
              value={filters.vehicleType || ''}
              onChange={(e) => update('vehicleType', e.target.value as VehicleType)}
              options={vehicleTypeOptions}
            />

            <Select
              label="Availability"
              placeholder="Any availability"
              value={filters.availability || ''}
              onChange={(e) => update('availability', e.target.value as AvailabilityStatus)}
              options={availabilityOptions}
            />

            <Input
              label="Max Price (₹/hr)"
              type="number"
              placeholder="No limit"
              value={filters.maxPrice || ''}
              onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            />

            <Input
              label="Radius (km)"
              type="number"
              placeholder="10"
              value={filters.radius || ''}
              onChange={(e) => update('radius', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {/* Boolean filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'evCharging', label: '⚡ EV Charging' },
              { key: 'covered', label: '🏠 Covered' },
              { key: 'security', label: '🔒 Security' },
              { key: 'accessible', label: '♿ Accessible' },
              { key: 'is24h', label: '🕐 Open 24/7' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters[key as keyof SearchFilters]}
                  onChange={(e) => update(key as keyof SearchFilters, e.target.checked || undefined)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <X className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

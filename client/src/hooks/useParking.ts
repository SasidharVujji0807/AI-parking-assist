import { useState, useEffect, useCallback } from 'react';
import { parkingApi } from '../services/api';
import type { ParkingLocation, SearchFilters } from '../types';

export function useParking(filters: SearchFilters = {}) {
  const [parking, setParking] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (searchFilters: SearchFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | boolean> = {};
      if (searchFilters.lat) params.lat = searchFilters.lat;
      if (searchFilters.lng) params.lng = searchFilters.lng;
      if (searchFilters.radius) params.radius = searchFilters.radius;
      if (searchFilters.query) params.query = searchFilters.query;
      if (searchFilters.city) params.city = searchFilters.city;
      if (searchFilters.maxPrice) params.maxPrice = searchFilters.maxPrice;
      if (searchFilters.parkingType) params.parkingType = searchFilters.parkingType;
      if (searchFilters.vehicleType) params.vehicleType = searchFilters.vehicleType;
      if (searchFilters.availability) params.availability = searchFilters.availability;
      if (searchFilters.evCharging) params.evCharging = true;
      if (searchFilters.covered) params.covered = true;
      if (searchFilters.security) params.security = true;
      if (searchFilters.accessible) params.accessible = true;
      if (searchFilters.is24h) params.is24h = true;

      const result = await parkingApi.search(params);
      if (result.success) {
        setParking(result.data.parking as ParkingLocation[]);
        setTotal(result.data.total as number);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError('Failed to search parking locations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return { parking, loading, error, total, search };
}

export function useParkingDetail(id: string | undefined) {
  const [parking, setParking] = useState<ParkingLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    parkingApi.getById(id)
      .then(result => {
        if (result.success) setParking(result.data as ParkingLocation);
        else setError(result.error.message);
      })
      .catch(() => setError('Failed to load parking details'))
      .finally(() => setLoading(false));
  }, [id]);

  return { parking, loading, error };
}

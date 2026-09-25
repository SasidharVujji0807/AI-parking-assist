import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutList, Map as MapIcon, Locate } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { ParkingCard } from '../components/parking/ParkingCard';
import { ParkingMap } from '../components/parking/ParkingMap';
import { ParkingFilters } from '../components/parking/ParkingFilters';
import { ParkingCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useParking } from '../hooks/useParking';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { historyApi } from '../services/api';
import { getCurrentPosition } from '../utils/geo';
import type { ParkingLocation, SearchFilters } from '../types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('query') || '',
    city: searchParams.get('city') || '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'split'>('split');
  const [selectedParking, setSelectedParking] = useState<ParkingLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const { parking, loading, error, total, search } = useParking();
  const { isFavorite, toggleFavorite } = useFavorites();

  const doSearch = useCallback(async (searchFilters = filters) => {
    await search(searchFilters);

    // Save to history for authenticated users
    if (isAuthenticated) {
      historyApi.save({
        search_query: searchFilters.query || searchFilters.city,
        latitude: searchFilters.lat,
        longitude: searchFilters.lng,
        filters: searchFilters,
        result_count: total,
      });
    }
  }, [filters, isAuthenticated, search, total]);

  // Initial search on mount
  useEffect(() => {
    const city = searchParams.get('city');
    if (city) {
      const f = { ...filters, city };
      setFilters(f);
      doSearch(f);
    } else {
      doSearch();
    }
  }, []); // eslint-disable-line

  async function handleLocate() {
    setLocating(true);
    const pos = await getCurrentPosition();
    setLocating(false);
    if (pos) {
      setUserLocation(pos);
      const newFilters = { ...filters, lat: pos.lat, lng: pos.lng, radius: 5 };
      setFilters(newFilters);
      doSearch(newFilters);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex flex-col">
        {/* Search header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <ParkingFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={() => doSearch()}
              loading={loading}
            />

            {/* Actions bar */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-500">
                {!loading && (
                  <span>
                    {total > 0 ? `${total} parking locations found` : 'No results'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Locate className="w-4 h-4" />}
                  onClick={handleLocate}
                  loading={locating}
                >
                  Use My Location
                </Button>

                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="List view"
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      viewMode === 'split' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Split view"
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 h-[calc(100vh-240px)]">
              {/* List */}
              <div className="overflow-y-auto space-y-3 pr-1">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <ParkingCardSkeleton key={i} />)
                ) : parking.length === 0 ? (
                  <EmptyState
                    icon={MapIcon}
                    title="No parking found"
                    description="Try broadening your search or removing some filters."
                  />
                ) : (
                  parking.map(p => (
                    <ParkingCard
                      key={p.id}
                      parking={p}
                      isSelected={selectedParking?.id === p.id}
                      isFavorite={isFavorite(p.id)}
                      onFavoriteToggle={isAuthenticated ? toggleFavorite : undefined}
                      onClick={() => setSelectedParking(p)}
                    />
                  ))
                )}
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 sticky top-4">
                <ParkingMap
                  parkingList={parking}
                  selectedId={selectedParking?.id}
                  onSelectParking={setSelectedParking}
                  userLocation={userLocation}
                />
              </div>
            </div>
          ) : (
            /* List only */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <ParkingCardSkeleton key={i} />)
              ) : parking.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={MapIcon}
                    title="No parking found"
                    description="Try broadening your search or removing some filters."
                  />
                </div>
              ) : (
                parking.map(p => (
                  <ParkingCard
                    key={p.id}
                    parking={p}
                    isFavorite={isFavorite(p.id)}
                    onFavoriteToggle={isAuthenticated ? toggleFavorite : undefined}
                  />
                ))
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

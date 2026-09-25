import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MapPin, Navigation } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice, formatAvailability } from '../utils/format';
import { getGoogleMapsDirectionsUrl } from '../utils/geo';

export function FavoritesPage() {
  const { favorites, loading, toggleFavorite } = useFavorites();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" /> Saved Parking
          </h1>
          <span className="text-sm text-gray-500">{favorites.length} saved</span>
        </div>

        {loading ? (
          <LoadingState message="Loading your favorites..." />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved parking yet"
            description="Save parking locations you like for quick access later."
            action={<Link to="/search"><Button>Find Parking</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map(fav => {
              const parking = fav.parking_locations;
              if (!parking) return null;
              const avail = formatAvailability(parking.availability_status);
              return (
                <div key={fav.id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{parking.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{parking.city || parking.address}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(parking.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={avail.color}>{avail.label}</Badge>
                    <span className="text-xs font-semibold text-primary-700">
                      {formatPrice(parking.price, parking.currency, parking.pricing_unit)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/parking/${parking.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">View Details</Button>
                    </Link>
                    <a
                      href={getGoogleMapsDirectionsUrl(parking.latitude, parking.longitude, parking.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" icon={<Navigation className="w-3.5 h-3.5" />}>
                        Navigate
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

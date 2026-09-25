import { useState, useEffect } from 'react';
import { favoritesApi } from '../services/api';
import type { Favorite } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    favoritesApi.getAll()
      .then(result => {
        if (result.success) {
          const favs = result.data as Favorite[];
          setFavorites(favs);
          setFavoriteIds(new Set(favs.map((f: Favorite) => f.parking_id)));
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function toggleFavorite(parkingId: string): Promise<void> {
    if (favoriteIds.has(parkingId)) {
      await favoritesApi.remove(parkingId);
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(parkingId); return s; });
      setFavorites(prev => prev.filter(f => f.parking_id !== parkingId));
    } else {
      const result = await favoritesApi.add(parkingId);
      if (result.success) {
        const newFav = result.data as Favorite;
        setFavoriteIds(prev => new Set([...prev, parkingId]));
        setFavorites(prev => [newFav, ...prev]);
      }
    }
  }

  function isFavorite(parkingId: string): boolean {
    return favoriteIds.has(parkingId);
  }

  return { favorites, loading, favoriteIds, toggleFavorite, isFavorite };
}

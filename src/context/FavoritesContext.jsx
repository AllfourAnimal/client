import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchFavorites, toggleFavorite as toggleFavoriteApi } from '../api/favorites';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { accessToken } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const loadFavorites = useCallback(async () => {
    if (!accessToken) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const data = await fetchFavorites(accessToken);
      console.log('[Favorites] raw response:', data);

      // 배열 또는 Spring Page({ content: [...] }) 등 다양한 응답 구조 처리
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.content)) {
        items = data.content;
      } else if (data && Array.isArray(data.data)) {
        items = data.data;
      }

      // animalId / animal_id / id 등 다양한 필드명 처리
      const ids = items
        .map((item) => Number(item.animalId ?? item.animal_id ?? item.id))
        .filter((id) => !isNaN(id));

      console.log('[Favorites] parsed ids:', ids);
      setFavoriteIds(new Set(ids));
    } catch (err) {
      console.error('[Favorites] loadFavorites error:', err);
      setFavoriteIds(new Set());
    }
  }, [accessToken]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (animalId) => {
    if (!accessToken) return;
    const id = Number(animalId);

    // 낙관적 업데이트
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      await toggleFavoriteApi(accessToken, animalId);
    } catch (err) {
      console.error('[Favorites] toggleFavorite error:', err);
    } finally {
      await loadFavorites();
    }
  }, [accessToken, loadFavorites]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}

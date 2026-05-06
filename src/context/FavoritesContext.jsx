import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchFavorites, toggleFavorite as toggleFavoriteApi } from '../api/favorites';
import { useAnimals } from './AnimalContext';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

// sex/gender 관련 키를 동적으로 탐색
function extractSex(item) {
  // || 사용: 빈 문자열("")도 건너뜀. 확인된 필드명 animal_sex 우선
  return item.animal_sex || item.animlSex || item.animalSex|| null;
}

function toAnimalShape(item) {
  return {
    animalId: Number(item.animalId ?? item.animal_id ?? item.id),
    species: item.species ?? item.speices ?? '',
    animal_age: item.animalAge ?? item.animal_age ?? null,
    animal_sex: extractSex(item),
    adopted: item.adopted ?? false,
    thumbnailImageUrl: item.thumbnailImageUrl ?? null,
  };
}

export function FavoritesProvider({ children }) {
  const { accessToken } = useAuth();
  const { cacheAnimals } = useAnimals();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteAnimals, setFavoriteAnimals] = useState([]);

  const loadFavorites = useCallback(async () => {
    if (!accessToken) {
      setFavoriteIds(new Set());
      setFavoriteAnimals([]);
      return;
    }
    try {
      const data = await fetchFavorites(accessToken);
      console.log('[Favorites] raw response:', data);

      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.content)) {
        items = data.content;
      } else if (data && Array.isArray(data.data)) {
        items = data.data;
      }

      const ids = items
        .map((item) => Number(item.animalId ?? item.animal_id ?? item.id))
        .filter((id) => !isNaN(id));

      console.log('[Favorites] parsed ids:', ids);
      setFavoriteIds(new Set(ids));
      const shapedItems = items.map(toAnimalShape);
      cacheAnimals(shapedItems);
      // 함수형 업데이트로 기존 상태 참조 — 서버 응답에 animal_sex가 없을 때 낙관적 업데이트 값 보존
      setFavoriteAnimals((prev) =>
        shapedItems.map((shaped) => {
          if (!shaped.animal_sex) {
            const cached = prev.find((a) => a.animalId === shaped.animalId);
            if (cached?.animal_sex) shaped.animal_sex = cached.animal_sex;
          }
          return shaped;
        })
      );
    } catch (err) {
      console.error('[Favorites] loadFavorites error:', err);
      setFavoriteIds(new Set());
      setFavoriteAnimals([]);
    }
  }, [accessToken, cacheAnimals]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // animalId, animalData(animal 객체), isCurrentlyFavorited(현재 찜 여부)를 받아 낙관적 업데이트 수행
  const toggleFavorite = useCallback(async (animalId, animalData, isCurrentlyFavorited) => {
    if (!accessToken) return;
    const id = Number(animalId);
    const isRemoving = !!isCurrentlyFavorited;

    // favoriteIds 낙관적 업데이트
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isRemoving) next.delete(id);
      else next.add(id);
      return next;
    });

    // favoriteAnimals 낙관적 업데이트 — 카드 즉시 추가/제거
    setFavoriteAnimals((prev) => {
      if (isRemoving) {
        return prev.filter((a) => a.animalId !== id);
      }
      // 이미 목록에 있으면 중복 추가 방지
      if (prev.some((a) => a.animalId === id)) return prev;
      return [...prev, toAnimalShape(animalData ?? { animalId: id })];
    });
    if (animalData) cacheAnimals([animalData]);

    try {
      await toggleFavoriteApi(accessToken, animalId);
    } catch (err) {
      console.error('[Favorites] toggleFavorite error:', err);
    } finally {
      // 서버 데이터(thumbnailImageUrl 등)로 최종 보정
      await loadFavorites();
    }
  }, [accessToken, cacheAnimals, loadFavorites]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, favoriteAnimals, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}

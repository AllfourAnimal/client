import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchAnimals } from '../api/animals';
import { fetchFavorites, toggleFavorite as toggleFavoriteApi } from '../api/favorites';
import { useAnimals } from './AnimalContext';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);
const ANIMAL_LOOKUP_PAGE_SIZE = 100;
const ANIMAL_LOOKUP_MAX_PAGES = 30;

function getAnimalPayload(item) {
  return item?.data ?? item?.animal ?? item;
}

// sex/gender 관련 키를 동적으로 탐색
function extractSex(item) {
  // || 사용: 빈 문자열("")도 건너뜀. 확인된 필드명 animal_sex 우선
  return item.animal_sex || item.animlSex || item.animalSex|| null;
}

function toAnimalShape(item) {
  const source = getAnimalPayload(item);

  return {
    ...source,
    animalId: Number(source.animalId ?? source.animal_id ?? source.id),
    desertionNo: source.desertionNo ?? source.desertion_no ?? '',
    species: source.species ?? source.speices ?? '',
    animal_age: source.animalAge ?? source.animal_age ?? null,
    animal_sex: extractSex(source),
    adopted: source.adopted ?? false,
    thumbnailImageUrl: source.thumbnailImageUrl ?? source.thumbnail_image_url ?? source.imageUrls?.[0] ?? null,
  };
}

function getCollectionItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function hasMoreAnimalPages(data, items, page) {
  if (typeof data?.last === 'boolean') return !data.last;
  if (typeof data?.totalPages === 'number') return page + 1 < data.totalPages;
  return items.length === ANIMAL_LOOKUP_PAGE_SIZE;
}

export function FavoritesProvider({ children }) {
  const { accessToken } = useAuth();
  const { animalsById, cacheAnimals } = useAnimals();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteAnimals, setFavoriteAnimals] = useState([]);
  const animalsByIdRef = useRef(animalsById);
  const favoriteAnimalsRef = useRef(favoriteAnimals);

  const mergeWithCachedAnimal = useCallback((shaped, cached) => {
    const shapedPatch = Object.fromEntries(
      Object.entries(shaped).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );
    return {
      ...(cached ?? {}),
      ...shapedPatch,
      desertionNo: shaped.desertionNo || cached?.desertionNo || cached?.desertion_no || '',
      species: shaped.species || cached?.species || '',
      animal_age: shaped.animal_age ?? cached?.animal_age ?? cached?.animalAge ?? null,
      animal_sex: shaped.animal_sex || cached?.animal_sex || cached?.animalSex || cached?.animlSex || null,
      adopted: shaped.adopted ?? cached?.adopted ?? false,
      thumbnailImageUrl: shaped.thumbnailImageUrl || cached?.thumbnailImageUrl || null,
    };
  }, []);

  const enrichFromAnimalList = useCallback(async (animals) => {
    const missingIds = new Set(
      animals
        .filter((animal) => animal.animalId && !animal.desertionNo)
        .map((animal) => animal.animalId)
    );

    if (missingIds.size === 0) {
      return animals;
    }

    const foundById = new Map();
    let page = 0;
    let hasMore = true;

    while (missingIds.size > 0 && hasMore && page < ANIMAL_LOOKUP_MAX_PAGES) {
      const data = await fetchAnimals(accessToken, page, ANIMAL_LOOKUP_PAGE_SIZE);
      const items = getCollectionItems(data);

      items.forEach((item) => {
        const shaped = toAnimalShape(item);
        if (missingIds.has(shaped.animalId)) {
          foundById.set(shaped.animalId, shaped);
          missingIds.delete(shaped.animalId);
        }
      });

      hasMore = hasMoreAnimalPages(data, items, page);
      page += 1;
    }

    if (foundById.size === 0) {
      return animals;
    }

    return animals.map((animal) => (
      mergeWithCachedAnimal(animal, foundById.get(animal.animalId))
    ));
  }, [accessToken, mergeWithCachedAnimal]);

  useEffect(() => {
    animalsByIdRef.current = animalsById;
  }, [animalsById]);

  useEffect(() => {
    favoriteAnimalsRef.current = favoriteAnimals;
  }, [favoriteAnimals]);

  const loadFavorites = useCallback(async () => {
    if (!accessToken) {
      setFavoriteIds(new Set());
      setFavoriteAnimals([]);
      return;
    }
    try {
      const data = await fetchFavorites(accessToken);

      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.content)) {
        items = data.content;
      } else if (data && Array.isArray(data.data)) {
        items = data.data;
      }

      const shapedItems = items
        .map(toAnimalShape)
        .filter((animal) => !Number.isNaN(animal.animalId));
      const ids = shapedItems.map((animal) => animal.animalId);
      setFavoriteIds(new Set(ids));
      const mergedFavoriteAnimals = shapedItems.map((shaped) => {
        const cachedAnimal = animalsByIdRef.current[shaped.animalId];
        const cachedFavorite = favoriteAnimalsRef.current.find((a) => a.animalId === shaped.animalId);
        return mergeWithCachedAnimal(mergeWithCachedAnimal(shaped, cachedAnimal), cachedFavorite);
      });
      const enrichedFavoriteAnimals = await enrichFromAnimalList(mergedFavoriteAnimals);
      setFavoriteAnimals(enrichedFavoriteAnimals);
      cacheAnimals(enrichedFavoriteAnimals);
    } catch (err) {
      console.error('[Favorites] loadFavorites error:', err);
      setFavoriteIds(new Set());
      setFavoriteAnimals([]);
    }
  }, [accessToken, cacheAnimals, enrichFromAnimalList, mergeWithCachedAnimal]);

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
      return [...prev, mergeWithCachedAnimal(toAnimalShape(animalData ?? { animalId: id }), animalsByIdRef.current[id])];
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
  }, [accessToken, cacheAnimals, loadFavorites, mergeWithCachedAnimal]);

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

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnimalImages, fetchAnimals, getAiImage, searchAnimals } from '../api/animals';
import { useAuth } from './AuthContext';

const AnimalContext = createContext(null);

function extractAnimalId(item) {
  const id = item?.animalId ?? item?.animal_id ?? item?.id;
  return Number(id);
}

function normalizeAnimal(item) {
  if (!item) return null;
  const animalId = extractAnimalId(item);
  if (Number.isNaN(animalId)) return null;

  return {
    ...item,
    animalId,
    species: item.species ?? item.speices ?? '',
    animal_age: item.animalAge ?? item.animal_age ?? null,
    animal_sex: item.animal_sex ?? item.animalSex ?? item.animlSex ?? null,
    adopted: item.adopted ?? false,
    thumbnailImageUrl: item.thumbnailImageUrl ?? item.thumbnail_image_url ?? null,
  };
}

function normalizeAnimals(data) {
  const items = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
  return items.map(normalizeAnimal).filter(Boolean);
}

export function AnimalProvider({ children }) {
  const { accessToken } = useAuth();
  const [animalsById, setAnimalsById] = useState({});
  const [animalIds, setAnimalIds] = useState([]);
  const [imagesByAnimalId, setImagesByAnimalId] = useState({});
  const imagesByAnimalIdRef = useRef({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mergeAnimals = useCallback((animals, { replace = false } = {}) => {
    setAnimalsById((prev) => {
      const next = replace ? {} : { ...prev };
      animals.forEach((animal) => {
        next[animal.animalId] = {
          ...next[animal.animalId],
          ...animal,
        };
      });
      return next;
    });

    setAnimalIds((prev) => {
      const merged = replace ? [] : [...prev];
      animals.forEach((animal) => {
        if (!merged.includes(animal.animalId)) merged.push(animal.animalId);
      });
      return merged;
    });
  }, []);

  const loadAnimalImages = useCallback(async (animals) => {
    if (!accessToken) return;
    const ids = animals
      .map((animal) => Number(animal.animalId))
      .filter((animalId) => !Number.isNaN(animalId) && !(animalId in imagesByAnimalIdRef.current));

    if (ids.length === 0) return;

    const results = await Promise.allSettled(
      ids.map((animalId) => fetchAnimalImages(animalId, accessToken))
    );

    setImagesByAnimalId((prev) => {
      const next = {
        ...prev,
        ...Object.fromEntries(
          ids.map((animalId, index) => {
            const result = results[index];
            const imageUrl = result.status === 'fulfilled' ? getAiImage(result.value) : null;
            return [animalId, imageUrl];
          })
        ),
      };
      imagesByAnimalIdRef.current = next;
      return next;
    });
  }, [accessToken]);

  const loadAnimalsPage = useCallback(async (page = 0, size = 10, options = {}) => {
    if (!accessToken) return [];
    setLoading(true);
    setError('');

    try {
      const data = await fetchAnimals(accessToken, page, size);
      const animals = normalizeAnimals(data);
      mergeAnimals(animals, options);
      loadAnimalImages(animals);
      return animals;
    } catch (err) {
      setError('동물 목록을 불러오지 못했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, loadAnimalImages, mergeAnimals]);

  const cacheAnimals = useCallback((items) => {
    const animals = items.map(normalizeAnimal).filter(Boolean);
    mergeAnimals(animals);
    loadAnimalImages(animals);
  }, [loadAnimalImages, mergeAnimals]);

  const searchAnimalsWithCache = useCallback(async (filters) => {
    if (!accessToken) return [];
    setLoading(true);
    setError('');

    try {
      const data = await searchAnimals(accessToken, filters);
      const animals = normalizeAnimals(data);
      mergeAnimals(animals);
      loadAnimalImages(animals);
      return animals;
    } catch (err) {
      setError('검색 결과를 불러오지 못했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, loadAnimalImages, mergeAnimals]);

  const getAnimal = useCallback((animalId) => {
    return animalsById[Number(animalId)] ?? null;
  }, [animalsById]);

  const animals = useMemo(
    () => animalIds.map((animalId) => animalsById[animalId]).filter(Boolean),
    [animalIds, animalsById]
  );

  useEffect(() => {
    if (!accessToken) {
      setAnimalsById({});
      setAnimalIds([]);
      setImagesByAnimalId({});
      imagesByAnimalIdRef.current = {};
      setError('');
    }
  }, [accessToken]);

  const value = {
    animals,
    animalsById,
    imagesByAnimalId,
    loading,
    error,
    getAnimal,
    cacheAnimals,
    loadAnimalImages,
    loadAnimalsPage,
    searchAnimals: searchAnimalsWithCache,
  };

  return (
    <AnimalContext.Provider value={value}>
      {children}
    </AnimalContext.Provider>
  );
}

export function useAnimals() {
  const ctx = useContext(AnimalContext);
  if (!ctx) throw new Error('useAnimals must be used within AnimalProvider');
  return ctx;
}

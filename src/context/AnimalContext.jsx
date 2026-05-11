import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAnimalImages, fetchAnimals, getAiImage, getAllImages, searchAnimals } from '../api/animals';
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
    desertionNo: item.desertionNo ?? item.desertion_no ?? '',
    species: item.species ?? item.speices ?? '',
    animal_age: item.animalAge ?? item.animal_age ?? null,
    animal_sex: item.animal_sex ?? item.animalSex ?? item.animlSex ?? null,
    adopted: item.adopted ?? false,
    thumbnailImageUrl: item.thumbnailImageUrl ?? item.thumbnail_image_url ?? item.imageUrls?.[0] ?? null,
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
  const [allImagesByAnimalId, setAllImagesByAnimalId] = useState({});
  const imagesByAnimalIdRef = useRef({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 동물 데이터를 병합하여 상태에 저장하는 함수
  // replace: true 시 animalIds(순서 목록)만 초기화하고, animalsById(조회 캐시)는 항상 병합
  const mergeAnimals = useCallback((animals, { replace = false } = {}) => {
    setAnimalsById((prev) => {
      const next = { ...prev };
      animals.forEach((animal) => {
        const patch = Object.fromEntries(
          Object.entries(animal).filter(([, v]) => v !== null && v !== undefined && v !== '')
        );
        next[animal.animalId] = {
          ...next[animal.animalId],
          ...patch,
        };
      });
      return next;
    });

    // animalIds는 중복 없이 순서대로 관리 (replace 시 목록만 초기화)
    setAnimalIds((prev) => {
      const merged = replace ? [] : [...prev];
      animals.forEach((animal) => {
        if (!merged.includes(animal.animalId)) merged.push(animal.animalId);
      });
      return merged;
    });
  }, []);

  // 동물 이미지 데이터를 불러와 상태에 저장하는 함수
  const loadAnimalImages = useCallback(async (animals) => {
    if (!accessToken) return;
    const ids = animals
      .map((animal) => Number(animal.animalId))
      .filter((animalId) => !Number.isNaN(animalId) && !(animalId in imagesByAnimalIdRef.current));

    if (ids.length === 0) return;

    const results = await Promise.allSettled(
      ids.map((animalId) => fetchAnimalImages(animalId, accessToken))
    );

    const entries = ids.map((animalId, index) => {
      const result = results[index];
      const images = result.status === 'fulfilled' ? result.value : [];
      return { animalId, images };
    });

    setImagesByAnimalId((prev) => {
      const next = {
        ...prev,
        ...Object.fromEntries(entries.map(({ animalId, images }) => [animalId, getAiImage(images)])),
      };
      imagesByAnimalIdRef.current = next;
      return next;
    });

    setAllImagesByAnimalId((prev) => ({
      ...prev,
      ...Object.fromEntries(entries.map(({ animalId, images }) => [animalId, getAllImages(images)])),
    }));
  }, [accessToken]);

  // 동물 목록 페이지를 불러오는 함수
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

  // 동물 데이터를 캐싱하는 함수
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
      setAllImagesByAnimalId({});
      imagesByAnimalIdRef.current = {};
      setError('');
    }
  }, [accessToken]);

  const value = {
    animals,
    animalsById,
    imagesByAnimalId,
    allImagesByAnimalId,
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

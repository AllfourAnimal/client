import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { fetchAnimalById, fetchAnimalImages, fetchAnimals, getAiImage, getAllImages, searchAnimals } from '../api/animals';
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
    weight: item.weight ?? item.animalWeight ?? null,
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
        ...Object.fromEntries(entries.map(({ animalId, images }) => [animalId, getAiImage(images, animalId)])),
      };
      imagesByAnimalIdRef.current = next;
      return next;
    });

    setAllImagesByAnimalId((prev) => ({
      ...prev,
      ...Object.fromEntries(entries.map(({ animalId, images }) => [animalId, getAllImages(images, animalId)])),
    }));
  }, [accessToken]);

  // 동물 목록 페이지를 불러오는 함수
  const loadAnimalsPage = useCallback(async (page = 0, size = 10, options = {}) => {
    if (!accessToken) return [];
    const { signal, ...mergeOptions } = options;
    setLoading(true);
    setError('');

    try {
      const data = await fetchAnimals(accessToken, page, size, signal);
      const animals = normalizeAnimals(data);
      mergeAnimals(animals, mergeOptions);
      loadAnimalImages(animals);
      return animals;
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('동물 목록을 불러오지 못했습니다.');
      }
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

  // 단일 동물 전체 데이터 로드: 직접 조회 → 검색 → 페이지 스캔 순서로 시도
  // 각 단계에서 즉시 커밋하지 않고, 나이 데이터가 있는 가장 완전한 결과를 찾아 최종 커밋
  const loadAnimalById = useCallback(async (targetId) => {
    if (!accessToken || !targetId) return null;
    const numId = Number(targetId);
    if (Number.isNaN(numId)) return null;

    const matchId = (item) => Number(item?.animalId ?? item?.animal_id ?? item?.id) === numId;

    // 지금까지 찾은 가장 완전한 정규화 결과 (나이 있으면 완전 판단)
    let best = null;

    const consider = (raw) => {
      if (!raw || Array.isArray(raw)) return false;
      const normalized = normalizeAnimal(raw);
      if (!normalized || normalized.animalId !== numId) return false;
      if (!best || (normalized.animal_age != null && best.animal_age == null)) best = normalized;
      return normalized.animal_age != null;
    };

    const commitBest = () => {
      if (!best) return null;
      mergeAnimals([best]);
      loadAnimalImages([best]);
      return best;
    };

    // 1차: GET /api/animals/{id} 직접 조회 (응답 형태 무관하게 처리)
    try {
      const data = await fetchAnimalById(numId, accessToken);
      let rawData = data?.data ?? data?.animal ?? data;
      if (Array.isArray(rawData)) rawData = rawData.find(matchId) ?? rawData[0];
      else if (rawData?.content) rawData = Array.isArray(rawData.content) ? (rawData.content.find(matchId) ?? rawData.content[0]) : rawData;
      if (consider(rawData)) {
        console.log(`[loadAnimalById] direct OK (complete): ${numId}`);
        return commitBest();
      }
      if (best) console.log(`[loadAnimalById] direct OK (partial, no age): ${numId}`);
    } catch (err) {
      console.warn(`[loadAnimalById] direct failed (${err?.response?.status ?? err?.message})`);
    }

    // 2차: 검색 API
    try {
      const searchData = await searchAnimals(accessToken, { animalId: numId });
      const items = Array.isArray(searchData) ? searchData : searchData?.content ?? searchData?.data ?? [];
      if (consider(items.find(matchId))) {
        console.log(`[loadAnimalById] search OK (complete): ${numId}`);
        return commitBest();
      }
    } catch (err) {
      console.warn(`[loadAnimalById] search failed (${err?.message})`);
    }

    // 3차: 전체 페이지 스캔 (목록 API는 나이/체중 포함 전체 필드 반환)
    const PAGE_SIZE = 20;
    for (let page = 0; ; page++) {
      let data;
      try {
        data = await fetchAnimals(accessToken, page, PAGE_SIZE);
      } catch (err) {
        console.error(`[loadAnimalById] page ${page} failed:`, err?.message);
        break;
      }

      const rawItems = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      console.log(`[loadAnimalById] page ${page}: ${rawItems.length} items, looking for ${numId}`);

      if (consider(rawItems.find(matchId))) {
        console.log(`[loadAnimalById] found ${numId} on page ${page}`);
        break;
      }

      const isLast = rawItems.length === 0
        || data?.last === true
        || (typeof data?.totalPages === 'number' && page + 1 >= data.totalPages)
        || (data?.last === undefined && data?.totalPages === undefined && rawItems.length < PAGE_SIZE);
      if (isLast) {
        console.log(`[loadAnimalById] page scan ended at page ${page}`);
        break;
      }
    }

    if (best) {
      console.log(`[loadAnimalById] committing best result for ${numId}, age=${best.animal_age}`);
      return commitBest();
    }

    console.warn(`[loadAnimalById] ${numId} not found`);
    return null;
  }, [accessToken, loadAnimalImages, mergeAnimals]);

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
    loadAnimalById,
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

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adoptionInquiry, fetchMyAdoptions, submitAdoptionCertificate } from '../api/adoptions';
import { useAuth } from './AuthContext';
import { useAnimals } from './AnimalContext';

const AdoptionContext = createContext(null);

function getAnimalId(adoption) {
  return adoption?.animalId;
}

function toAnimalCacheItem(adoption) {
  const animalId = Number(getAnimalId(adoption));

  if (Number.isNaN(animalId)) return null;

  return {
    ...adoption,
    animalId,
    species: adoption.animalSpecies ?? adoption.species ?? '',
    animalType: adoption.animalType ?? '',
  };
}

export function AdoptionProvider({ children }) {
  const { accessToken } = useAuth();
  const { cacheAnimals } = useAnimals();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const adoptionAnimalIds = useMemo(() => new Set(
    adoptions
      .map(getAnimalId)
      .filter((id) => id !== undefined && id !== null && id !== '')
      .map((id) => String(id))
  ), [adoptions]);

  const loadAdoptions = useCallback(async () => {
    if (!accessToken) {
      setAdoptions([]);
      setError('');
      return [];
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchMyAdoptions(accessToken);
      const items = Array.isArray(data) ? data : [];
      const animals = items.map(toAnimalCacheItem).filter(Boolean);

      setAdoptions(items);
      cacheAnimals(animals);
      return items;
    } catch (err) {
      console.error('[Adoptions] loadAdoptions error:', err);
      setAdoptions([]);
      setError('입양 문의 목록을 불러오지 못했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [accessToken, cacheAnimals]);

  useEffect(() => {
    loadAdoptions();
  }, [loadAdoptions]);

  const registerAdoptionInquiry = useCallback(async (animalId) => {
    if (!accessToken || !animalId) return null;

    const data = await adoptionInquiry(accessToken, animalId);
    await loadAdoptions();
    return data;
  }, [accessToken, loadAdoptions]);

  const hasAdoptionForAnimal = useCallback((animalId) => {
    if (animalId === undefined || animalId === null || animalId === '') return false;
    return adoptionAnimalIds.has(String(animalId));
  }, [adoptionAnimalIds]);

  const getAdoptionForAnimal = useCallback((animalId) => {
    if (animalId === undefined || animalId === null || animalId === '') return null;
    return adoptions.find((adoption) => String(adoption.animalId) === String(animalId)) ?? null;
  }, [adoptions]);

  const submitCertificate = useCallback(async (adoptionId, image) => {
    if (!accessToken || !adoptionId || !image) return null;

    const data = await submitAdoptionCertificate(accessToken, adoptionId, image);
    await loadAdoptions();
    return data;
  }, [accessToken, loadAdoptions]);

  const value = useMemo(() => ({
    adoptions,
    loading,
    error,
    loadAdoptions,
    registerAdoptionInquiry,
    hasAdoptionForAnimal,
    getAdoptionForAnimal,
    submitCertificate,
  }), [adoptions, loading, error, loadAdoptions, registerAdoptionInquiry, hasAdoptionForAnimal, getAdoptionForAnimal, submitCertificate]);

  return (
    <AdoptionContext.Provider value={value}>
      {children}
    </AdoptionContext.Provider>
  );
}

export function useAdoptions() {
  const ctx = useContext(AdoptionContext);
  if (!ctx) throw new Error('useAdoptions must be used within AdoptionProvider');
  return ctx;
}

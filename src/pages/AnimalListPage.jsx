import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

function AnimalCardSkeleton() {
  return (
    <div className="isolate bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10">
      <div className="h-72 bg-surface-container-low rounded-t-3xl flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 animate-pulse">pets</span>
      </div>
      <div className="p-6 space-y-3">
        <div className="h-6 w-28 bg-surface-container-low rounded-full animate-pulse" />
        <div className="h-4 w-44 bg-surface-container-low rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function AnimalListPage() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { favoriteIds, favoriteAnimals, toggleFavorite } = useFavorites();
  const { imagesByAnimalId, loadAnimalsPage } = useAnimals();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;

    const loadAnimals = async () => {
      setLoading(true);
      setError('');
      try {
        const randomPage = Math.floor(Math.random() * 50);
        let data = await loadAnimalsPage(randomPage, 6, { replace: true, signal });
        if (cancelled) return;

        // 빈 페이지(범위 초과)인 경우 page 0으로 재시도
        if (data.length === 0) {
          data = await loadAnimalsPage(0, 6, { replace: true, signal });
          if (cancelled) return;
        }

        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setAnimals(shuffled.slice(0, 6));
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        if (!cancelled) setError('동물 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAnimals();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [loadAnimalsPage, accessToken]);


  return (
    <div className="bg-background text-on-background font-body">

      <Navbar />

      <main className="pt-20 min-h-screen">

        {/* Hero */}
        <header className="max-w-7xl mx-auto px-8 py-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4 font-headline">
            새로운 가족을 기다리는 친구들
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            모든 생명이 각자의 이야기를 담고 당신의 손길을 기다리고 있습니다.
          </p>
        </header>

        {/* 전체 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-24">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">전체 동물 목록</h2>
            <button
              onClick={() => navigate('/animals/all')}
              className="text-primary font-bold flex items-center gap-1 group transition-colors hover:text-primary/70"
            >
              전체 보기
              <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">chevron_right</span>
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <AnimalCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <p className="text-center text-error py-16">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {animals.map((animal) => (
                <AnimalCard
                  key={animal.animalId}
                  animal={animal}
                  imageSrc={imagesByAnimalId[animal.animalId]}
                  isFavorited={favoriteIds.has(Number(animal.animalId))}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

        {/* 찜한 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-24">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">찜한 동물 목록</h2>
            <button
              onClick={() => navigate('/animals/favorites')}
              className="text-primary font-bold flex items-center gap-1 group transition-colors hover:text-primary/70"
            >
              전체 보기
              <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">chevron_right</span>
            </button>
          </div>
          {favoriteAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favoriteAnimals.slice(0, 4).map((animal) => (
                <AnimalCard
                  key={animal.animalId}
                  animal={animal}
                  imageSrc={imagesByAnimalId[animal.animalId] ?? animal.thumbnailImageUrl}
                  isFavorited={favoriteIds.has(animal.animalId)}
                  onToggleFavorite={toggleFavorite}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">favorite_border</span>
              <p className="text-lg font-medium">아직 찜한 동물이 없어요.</p>
              <p className="text-sm mt-1">마음에 드는 친구의 하트를 눌러보세요!</p>
            </div>
          )}
        </section>

      </main>

      <AppFooter />
    </div>
  );
}

export default AnimalListPage;

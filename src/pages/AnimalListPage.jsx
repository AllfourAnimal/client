import { useState, useEffect } from 'react';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

function AnimalListPage({
  onNavigateHome,
  onNavigateAnimalDetails,
  onNavigateReviews,
  onNavigateProfile,
  onNavigateAnimalListAll,
  onNavigateFavoritesAll,
}) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { favoriteIds, favoriteAnimals, toggleFavorite } = useFavorites();
  const { imagesByAnimalId, loadAnimalsPage } = useAnimals();

  useEffect(() => {
    const loadAnimals = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await loadAnimalsPage(0, 6, { replace: true });
        setAnimals(data);
      } catch (err) {
        setError('동물 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadAnimals();
  }, [loadAnimalsPage]);


  return (
    <div className="bg-background text-on-background font-body">

      <Navbar
        activePage="animal-list"
        isCurrentPage
        onNavigateHome={onNavigateHome}
        onNavigateReviews={onNavigateReviews}
        onNavigateProfile={onNavigateProfile}
      />

      <main className="pt-24 min-h-screen">

        {/* Hero */}
        <header className="max-w-7xl mx-auto px-8 py-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-6 font-headline">
            새로운 가족을 기다리는 친구들
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            모든 생명의 각자의 이야기를 담고 당신의 손길을 기다리고 있습니다.
          </p>
        </header>

        {/* 전체 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">전체 동물 목록</h2>
            <button
              onClick={() => onNavigateAnimalListAll()}
              className="text-primary font-bold flex items-center gap-1 hover:underline"
            >
              전체 보기
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
          {loading ? (
            <p className="text-center text-on-surface-variant py-16">불러오는 중...</p>
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
                  onNavigateAnimalDetails={onNavigateAnimalDetails}
                />
              ))}
            </div>
          )}
        </section>

        {/* 찜한 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">찜한 동물 목록</h2>
            <button
              onClick={() => onNavigateFavoritesAll()}
              className="text-primary font-bold flex items-center gap-1 hover:underline"
            >
              전체 보기
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
          {favoriteAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favoriteAnimals.slice(0, 4).map((animal) => (
                <AnimalCard
                  key={animal.animalId}
                  animal={animal}
                  imageSrc={animal.thumbnailImageUrl}
                  isFavorited={favoriteIds.has(animal.animalId)}
                  onToggleFavorite={toggleFavorite}
                  onNavigateAnimalDetails={onNavigateAnimalDetails}
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

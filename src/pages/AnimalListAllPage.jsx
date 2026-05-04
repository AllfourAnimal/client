import { useState, useEffect } from 'react';
import { fetchAnimalImages } from '../api/animals';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

const PAGE_SIZE = 6;

function AnimalListAllPage({
  animals = [],
  onNavigateHome,
  onNavigateAnimalDetails,
  onNavigateReviews,
  onNavigateProfile,
  onNavigateAnimalList,
}) {
  const { accessToken } = useAuth();
  const [animalImages, setAnimalImages] = useState({});
  const [favorites, setFavorites] = useState({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (animals.length === 0) return;
    setFavorites(Object.fromEntries(animals.map((a) => [a.animalId, false])));
  }, [animals]);

  useEffect(() => {
    const toLoad = animals.slice(0, visibleCount).filter((a) => !(a.animalId in animalImages));
    if (toLoad.length === 0) return;

    Promise.allSettled(toLoad.map((a) => fetchAnimalImages(a.animalId, accessToken))).then((results) => {
      setAnimalImages((prev) => ({
        ...prev,
        ...Object.fromEntries(
          toLoad.map((a, i) => [a.animalId, results[i].status === 'fulfilled' ? results[i].value?.[0] ?? null : null])
        ),
      }));
    });
  }, [visibleCount, animals, accessToken]);

  const toggleFavorite = (id) => setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

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

        {/* Search & Filter */}
        <section className="max-w-7xl mx-auto px-8 mb-12">
          <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_8px_32px_rgba(9,29,46,0.04)] border border-outline-variant/10 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary-fixed transition-all text-on-surface"
                placeholder="동물 종류, 나이, 지역으로 검색해보세요"
                type="text"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto">
              <select className="bg-surface-container-low border-none rounded-2xl px-6 py-3 text-sm font-semibold text-on-secondary-container focus:ring-2 focus:ring-primary-fixed transition-all">
                <option>모든 동물</option>
                <option>강아지</option>
                <option>고양이</option>
                <option>기타</option>
              </select>
              <select className="bg-surface-container-low border-none rounded-2xl px-6 py-3 text-sm font-semibold text-on-secondary-container focus:ring-2 focus:ring-primary-fixed transition-all">
                <option>지역 전체</option>
                <option>서울</option>
                <option>경기</option>
              </select>
              <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold whitespace-nowrap hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">
                검색하기
              </button>
            </div>
          </div>
        </section>

        {/* 전체 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">전체 동물 목록</h2>
            <span className="text-on-surface-variant text-sm">{animals.length}마리</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {animals.slice(0, visibleCount).map((animal) => (
              <AnimalCard
                key={animal.animalId}
                animal={animal}
                imageSrc={animalImages[animal.animalId]}
                isFavorited={favorites[animal.animalId]}
                onToggleFavorite={toggleFavorite}
                onNavigateAnimalDetails={onNavigateAnimalDetails}
              />
            ))}
          </div>

          {visibleCount < animals.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="bg-surface-container-low text-primary font-bold px-12 py-3 rounded-2xl hover:bg-primary hover:text-white transition-colors border border-outline-variant/20"
              >
                더보기
              </button>
            </div>
          )}
        </section>

      </main>

      <AppFooter />

    </div>
  );
}

export default AnimalListAllPage;

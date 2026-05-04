import { useState, useEffect } from 'react';
import { fetchAnimals, fetchAnimalImages } from '../api/animals';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

function AnimalListPage({
  onNavigateHome,
  onNavigateAnimalDetails,
  onNavigateReviews,
  onNavigateProfile,
}) {
  const [animals, setAnimals] = useState([]);
  const [animalImages, setAnimalImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});
  const { accessToken } = useAuth();

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const data = await fetchAnimals(accessToken);
        setAnimals(data);
        setFavorites(Object.fromEntries(data.map((a) => [a.animalId, false]))); // 배열을 객체로 변환 후 초기 찜 상태 설정

        const displayed = data.slice(0, 6); // 상위 6개 동물만 이미지 로드
        const imageResults = await Promise.allSettled(
          displayed.map((a) => fetchAnimalImages(a.animalId, accessToken))
        );
        const imageMap = Object.fromEntries(
          displayed.map((a, i) => {
            const result = imageResults[i];
            const firstUrl = result.status === 'fulfilled' ? result.value?.[0] : null;
            return [a.animalId, firstUrl ?? null];
          })
        );
        setAnimalImages(imageMap);

      } catch (err) {
        setError('동물 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadAnimals();
  }, [accessToken]);

  const toggleFavorite = (id) =>
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  const likedAnimals = animals.filter((a) => favorites[a.animalId]);

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
        <header className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-6 font-headline">
            새로운 가족을 기다리는 친구들
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            수천 마리의 마음이 사랑으로 채워줄 따뜻한 가족을 찾습니다.<br />
            모든 생명의 각자의 이야기를 담고 당신의 손길을 기다리고 있습니다.
          </p>
        </header>

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
                <option>부산</option>
              </select>
              <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold whitespace-nowrap hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">
                검색하기
              </button>
            </div>
          </div>
        </section>

        {/* 전체 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">전체 동물 목록</h2>
            <button className="text-primary font-bold flex items-center gap-1 hover:underline">
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
              {animals.slice(0, 6).map((animal) => (
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
          )}
        </section>

        {/* 찜한 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-on-surface font-headline">찜한 동물 목록</h2>
            <button className="text-primary font-bold flex items-center gap-1 hover:underline">
              전체 보기
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
          {likedAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {likedAnimals.map((animal) => (
                <AnimalCard
                  key={animal.animalId}
                  animal={animal}
                  imageSrc={animalImages[animal.animalId]}
                  isFavorited={favorites[animal.animalId]}
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

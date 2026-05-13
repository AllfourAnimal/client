import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

function FavoritesAllPage() {
  const navigate = useNavigate();
  const { favoriteIds, favoriteAnimals, toggleFavorite } = useFavorites();
  const { imagesByAnimalId, searchAnimals } = useAnimals();

  const [keyword, setKeyword] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [careAddr, setCareAddr] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 표시할 동물: 검색 모드면 searchResults, 아니면 전체 favoriteAnimals
  const displayAnimals = isSearchMode ? searchResults : favoriteAnimals;

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (animalType) filters.animalType = animalType;
      if (careAddr) filters.careAddr = careAddr;

      const data = await searchAnimals(filters);

      // 검색 결과 중 찜한 동물만 추출, favoriteAnimals의 thumbnailImageUrl 등으로 보완
      const filtered = data
        .filter((a) => favoriteIds.has(Number(a.animalId)))
        .map((a) => {
          const cached = favoriteAnimals.find((f) => f.animalId === Number(a.animalId));
          return {
            animalId: Number(a.animalId),
            species: a.species ?? cached?.species ?? '',
            animal_age: a.animalAge ?? a.animal_age ?? cached?.animal_age ?? null,
            animal_sex: a.animal_sex ?? a.animalSex ?? a.animlSex ?? cached?.animal_sex ?? null,
            adopted: a.adopted ?? cached?.adopted ?? false,
            thumbnailImageUrl: imagesByAnimalId[a.animalId] ?? cached?.thumbnailImageUrl ?? null,
          };
        });

      setSearchResults(filtered);
      setIsSearchMode(true);
    } catch {
      setError('검색 결과를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setAnimalType('');
    setCareAddr('');
    setIsSearchMode(false);
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="bg-background text-on-background font-body">

      <Navbar />

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
                placeholder="종류, 특징, 장소로 검색해보세요"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto">
              <select
                className="bg-surface-container-low border-none rounded-2xl px-6 py-3 text-sm font-semibold text-on-secondary-container focus:ring-2 focus:ring-primary-fixed transition-all"
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
              >
                <option value="">모든 동물</option>
                <option value="DOG">강아지</option>
                <option value="CAT">고양이</option>
                <option value="ETC">기타</option>
              </select>
              <select
                className="bg-surface-container-low border-none rounded-2xl px-6 py-3 text-sm font-semibold text-on-secondary-container focus:ring-2 focus:ring-primary-fixed transition-all"
                value={careAddr}
                onChange={(e) => setCareAddr(e.target.value)}
              >
                <option value="">지역 전체</option>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
              </select>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold whitespace-nowrap hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                검색하기
              </button>
              {isSearchMode && (
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="bg-surface-container-low text-on-surface-variant px-6 py-3 rounded-2xl font-bold whitespace-nowrap hover:bg-error-container hover:text-on-error-container transition-colors border border-outline-variant/20 disabled:opacity-50"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 찜한 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-on-surface font-headline">
                {isSearchMode ? '검색 결과' : '찜한 동물 목록'}
              </h2>
              <span className="text-on-surface-variant text-sm">{displayAnimals.length}마리</span>
            </div>
            <button
              onClick={() => navigate('/animals')}
              className="text-primary font-bold flex items-center gap-1 group transition-colors hover:text-primary/70"
            >
              <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">chevron_left</span>
              목록 요약
            </button>
          </div>

          {error && <p className="text-center text-error py-8">{error}</p>}

          {!loading && displayAnimals.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">
                {isSearchMode ? 'search_off' : 'favorite_border'}
              </span>
              <p className="text-lg font-medium">
                {isSearchMode ? '검색 결과가 없어요.' : '아직 찜한 동물이 없어요.'}
              </p>
              <p className="text-sm mt-1">
                {isSearchMode ? '다른 조건으로 검색해보세요.' : '마음에 드는 친구의 하트를 눌러보세요!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayAnimals.map((animal) => (
                <AnimalCard
                  key={animal.animalId}
                  animal={animal}
                  imageSrc={imagesByAnimalId[animal.animalId] ?? animal.thumbnailImageUrl}
                  isFavorited={favoriteIds.has(animal.animalId)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      <AppFooter />

    </div>
  );
}

export default FavoritesAllPage;

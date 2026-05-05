import { useState, useEffect } from 'react';
import { fetchAnimals, fetchAnimalImages, searchAnimals } from '../api/animals';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

const PAGE_SIZE = 6;

function AnimalListAllPage({
  onNavigateHome,
  onNavigateAnimalDetails,
  onNavigateReviews,
  onNavigateProfile,
  onNavigateAnimalList,
}) {
  const { accessToken } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [animals, setAnimals] = useState([]);
  const [animalImages, setAnimalImages] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 검색 조건 상태
  const [keyword, setKeyword] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [careAddr, setCareAddr] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        const data = await fetchAnimals(accessToken, 0, PAGE_SIZE);
        setAnimals(data);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
        loadImages(data);
      } catch {
        setError('동물 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [accessToken]);

  const loadImages = async (newAnimals) => {
    const toLoad = newAnimals.filter((a) => !(a.animalId in animalImages));
    if (toLoad.length === 0) return;
    const results = await Promise.allSettled(toLoad.map((a) => fetchAnimalImages(a.animalId, accessToken)));
    setAnimalImages((prev) => ({
      ...prev,
      ...Object.fromEntries(
        toLoad.map((a, i) => [a.animalId, results[i].status === 'fulfilled' ? results[i].value?.[0] ?? null : null])
      ),
    }));
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchAnimals(accessToken, page, PAGE_SIZE);
      setAnimals((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage((prev) => prev + 1);
      loadImages(data);
    } catch {
      setError('추가 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (animalType) filters.animalType = animalType;
      if (careAddr) filters.careAddr = careAddr;

      const data = await searchAnimals(accessToken, filters);
      setAnimals(data);
      setIsSearchMode(true);
      setHasMore(false);
      loadImages(data);
    } catch {
      setError('검색 결과를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setKeyword('');
    setAnimalType('');
    setCareAddr('');
    setError('');
    setLoading(true);
    try {
      const data = await fetchAnimals(accessToken, 0, PAGE_SIZE);
      setAnimals(data);
      setIsSearchMode(false);
      setHasMore(data.length === PAGE_SIZE);
      setPage(1);
      loadImages(data);
    } catch {
      setError('동물 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* 동물 목록 */}
        <section className="max-w-7xl mx-auto px-8 pb-20">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-on-surface font-headline">
                {isSearchMode ? '검색 결과' : '전체 동물 목록'}
              </h2>
              {isSearchMode && (
                <span className="text-on-surface-variant text-sm">{animals.length}마리</span>
              )}
            </div>
            <button
              onClick={() => onNavigateAnimalList()}
              className="text-primary font-bold flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
              목록 요약
            </button>
          </div>

          {error && <p className="text-center text-error py-8">{error}</p>}

          {!loading && animals.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">search_off</span>
              <p className="text-lg font-medium">검색 결과가 없어요.</p>
              <p className="text-sm mt-1">다른 조건으로 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {animals.map((animal) => (
                <AnimalCard
                  key={animal.animalId}
                  animal={animal}
                  imageSrc={animalImages[animal.animalId]}
                  isFavorited={favoriteIds.has(Number(animal.animalId))}
                  onToggleFavorite={toggleFavorite}
                  onNavigateAnimalDetails={onNavigateAnimalDetails}
                />
              ))}
            </div>
          )}

          {/* 일반 모드에서만 더보기 표시 */}
          {!isSearchMode && hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-surface-container-low text-primary font-bold px-12 py-3 rounded-2xl hover:bg-primary hover:text-white transition-colors border border-outline-variant/20 disabled:opacity-50"
              >
                {loading ? '불러오는 중...' : '더보기'}
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

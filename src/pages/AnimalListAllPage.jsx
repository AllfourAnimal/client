import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

const PAGE_SIZE = 6;

function AnimatedSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="bg-surface-container-low rounded-2xl pl-6 pr-10 py-3 text-sm font-semibold text-on-secondary-container transition-all flex items-center whitespace-nowrap relative"
      >
        <span className="relative">
          <span className="invisible select-none pointer-events-none" aria-hidden="true">
            {options.reduce((a, b) => a.label.length >= b.label.length ? a : b).label}
          </span>
          <span className="absolute inset-0 flex items-center">{selected?.label}</span>
        </span>
        <span
          className={`material-symbols-outlined text-base absolute right-3 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        >
          expand_more
        </span>
      </button>
      <div
        className={`absolute top-full mt-1 left-0 min-w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden z-50 transition-all duration-200 ease-out origin-top ${
          open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => { onChange(option.value); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm font-semibold group ${
              value === option.value ? 'text-primary' : 'text-on-secondary-container'
            }`}
          >
            <span className="inline-block px-3 py-1 rounded-lg transition-colors group-hover:bg-primary-container/30">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AnimalListAllPage() {
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const {
    imagesByAnimalId,
    loadAnimalImages,
    loadAnimalsPage,
    searchAnimals,
  } = useAnimals();
  const [animals, setAnimals] = useState([]);
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
        const data = await loadAnimalsPage(0, PAGE_SIZE, { replace: true });
        setAnimals(data);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
      } catch {
        setError('동물 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [loadAnimalsPage]);

  // 더보기 버튼 클릭 시 다음 페이지를 불러오는 함수
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await loadAnimalsPage(page, PAGE_SIZE);
      setAnimals((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage((prev) => prev + 1);
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

      const data = await searchAnimals(filters);
      setAnimals(data);
      setIsSearchMode(true);
      setHasMore(false);
      loadAnimalImages(data);
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
      const data = await loadAnimalsPage(0, PAGE_SIZE, { replace: true });
      setAnimals(data);
      setIsSearchMode(false);
      setHasMore(data.length === PAGE_SIZE);
      setPage(1);
    } catch {
      setError('동물 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
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
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              <AnimatedSelect
                value={animalType}
                onChange={setAnimalType}
                options={[
                  { value: '', label: '모든 동물' },
                  { value: 'DOG', label: '강아지' },
                  { value: 'CAT', label: '고양이' },
                  { value: 'OTHER', label: '기타' },
                ]}
              />
              <AnimatedSelect
                value={careAddr}
                onChange={setCareAddr}
                options={[
                  { value: '', label: '지역 전체' },
                  { value: '서울', label: '서울' },
                  { value: '경기', label: '경기' },
                ]}
              />
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
              onClick={() => navigate('/animals')}
              className="text-primary font-bold flex items-center gap-1 group transition-colors hover:text-primary/70"
            >
              <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">chevron_left</span>
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
                  imageSrc={imagesByAnimalId[animal.animalId]}
                  isFavorited={favoriteIds.has(Number(animal.animalId))}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* 일반 모드에서만 더보기 표시 */}
          {!isSearchMode && (loading || hasMore) && (
            <div className="flex justify-center mt-12">
              {loading ? (
                <span className="relative inline-flex h-12 w-12 items-center justify-center text-primary" aria-label="데이터 로딩 중" role="status">
                  <span className="absolute h-12 w-12 animate-spin rounded-full border-4 border-current/20 border-t-current" />
                </span>
              ) : (
                <button
                  onClick={loadMore}
                  className="bg-surface-container-low text-primary font-bold px-12 py-3 rounded-2xl hover:bg-primary hover:text-white transition-colors border border-outline-variant/20"
                >
                  더보기
                </button>
              )}
            </div>
          )}
        </section>

      </main>

      <AppFooter />

    </div>
  );
}

export default AnimalListAllPage;

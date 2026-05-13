import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import AnimalCard from '../components/animals/AnimalCard';

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
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              <AnimatedSelect
                value={animalType}
                onChange={setAnimalType}
                options={[
                  { value: '', label: '모든 동물' },
                  { value: 'DOG', label: '강아지' },
                  { value: 'CAT', label: '고양이' },
                  { value: 'ETC', label: '기타' },
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

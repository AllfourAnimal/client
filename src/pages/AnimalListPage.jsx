import { useState, useEffect } from 'react';
import { fetchAnimals } from '../api/animals';

function HeartButton({ isFavorited, onToggle }) {
  return (
    <button
      className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      <span
        className={`material-symbols-outlined transition-colors ${
          isFavorited ? 'text-red-500' : 'text-on-surface-variant hover:text-red-500'
        }`}
        style={{
          fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        favorite
      </span>
    </button>
  );
}

function AnimalCard({ animal, isFavorited, onToggleFavorite, onNavigateAnimalDetails, compact = false }) {
  return (
    <div
      className="bg-surface-container-lowest rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
      onClick={() => onNavigateAnimalDetails(animal.name)}
    >
      <div className={`relative ${compact ? 'h-60' : 'h-72'} overflow-hidden`}>
        <img
          alt={`강아지 ${animal.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={animal.src}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
          {animal.status}
        </div>
        <HeartButton isFavorited={isFavorited} onToggle={() => onToggleFavorite(animal.name)} />
      </div>
      <div className="p-6">
        <h3 className={`font-bold text-on-surface mb-2 ${compact ? 'text-xl' : 'text-2xl'}`}>
          {animal.name}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {animal.tags.map((tag) => (
            <span
              key={tag}
              className={`bg-surface-container-low text-on-secondary-container text-xs font-semibold rounded-full ${
                compact ? 'px-2 py-1' : 'px-3 py-1'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        {!compact && (
          <p className="text-on-surface-variant text-sm leading-relaxed">{animal.description}</p>
        )}
      </div>
    </div>
  );
}

function AnimalListPage({
  onNavigateHome,
  onNavigateAnimalDetails,
  onNavigateReviews,
  onNavigateProfile,
}) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const data = await fetchAnimals();
        setAnimals(data);
        setFavorites(Object.fromEntries(data.map((a) => [a.name, false])));
      } catch (err) {
        setError('동물 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadAnimals();
  }, []);

  const toggleFavorite = (name) =>
    setFavorites((prev) => ({ ...prev, [name]: !prev[name] }));

  const likedAnimals = animals.filter((a) => favorites[a.name]);

  return (
    <div className="bg-background text-on-background font-body">

      {/* TopNavBar */}
      <header className="bg-[#f7f9ff] fixed top-0 w-full z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold text-[#091d2e] flex items-center gap-2">
            <button className="flex items-center gap-2" onClick={onNavigateHome}>
              <span
                className="material-symbols-outlined text-[#8e4e14]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                pets
              </span>
              All4Animal
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button
              className="text-[#534439] font-medium hover:text-[#8e4e14] transition-colors duration-300"
              onClick={onNavigateHome}
            >
              홈
            </button>
            <span className="text-[#8e4e14] font-bold border-b-2 border-[#8e4e14] pb-1 cursor-default">
              동물 목록
            </span>
            <button
              className="text-[#534439] font-medium hover:text-[#8e4e14] transition-colors duration-300"
              onClick={onNavigateReviews}
            >
              입양 후기
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="material-symbols-outlined text-[#534439] cursor-pointer p-2 rounded-full hover:bg-surface-container transition-all">
              notifications
            </span>
            <button
              className="flex items-center space-x-2 bg-surface-container-low px-4 py-2 rounded-full hover:scale-95 transition-all"
              onClick={onNavigateProfile}
            >
              <span className="material-symbols-outlined text-[#8e4e14]">account_circle</span>
              <span className="text-sm font-semibold">프로필</span>
            </button>
          </div>
        </nav>
      </header>

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
              {animals.map((animal) => (
                <AnimalCard
                  key={animal.name}
                  animal={animal}
                  isFavorited={favorites[animal.name]}
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
                  key={animal.name}
                  animal={animal}
                  isFavorited={favorites[animal.name]}
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

      {/* Footer */}
      <footer className="bg-[#091d2e] text-[#f4a261] mt-20 p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 max-w-screen-2xl mx-auto">
          <div className="space-y-4">
            <div className="text-[#f7f9ff] font-bold text-3xl font-headline">All4Animal</div>
            <p className="text-slate-400 text-sm max-w-xs">
              반려동물 입양을 혁신하는 All4Animal과 함께 새로운 가족을 만나보세요. 우리의 AI 매칭 시스템이 당신과 완벽한 반려동물을 연결해드립니다.
            </p>
          </div>
          {/* <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest mb-2">Company</span>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Terms of Service</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Privacy Policy</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Contact Us</a>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest mb-2">Community</span>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Instagram</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Community Forum</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Stories</a>
            </div>
          </div> */}
        </div>
      </footer>

    </div>
  );
}

export default AnimalListPage;

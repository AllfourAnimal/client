import { useState } from 'react';

const ALL_ANIMALS = [
  {
    name: '모치',
    status: '공고중',
    tags: ['1살', '골든리트리버', '암컷'],
    description: '에너지가 넘치고 사람을 정말 좋아하는 명랑한 친구예요. 마당이 있는 집이라면 더 행복할 거예요.',
    src: 'https://img1.daumcdn.net/thumb/R1280x0.fwebp/?fname=http://t1.daumcdn.net/brunch/service/user/6P0U/image/1OWftaQcOlM1040OyU83hKxBmgs',
    initialFav: true,
  },
  {
    name: '똘똘',
    status: '보호중',
    tags: ['2살', '비글', '암컷'],
    description: '산책을 정말 좋아하는 건강한 친구예요. 호기심이 많아서 매일 새로운 모험을 꿈꾼답니다.',
    src: 'https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/722/2d9606f443d27267e4d45b15e624e9ed_res.jpeg',
    initialFav: true,
  },
  {
    name: '메롱',
    status: '공고중',
    tags: ['4살', '말티즈', '암컷'],
    description: '기다림에 익숙한 차분한 성격의 친구예요. 다른 강아지들과도 아주 잘 지내는 사회성 좋은 아이예요.',
    src: 'https://mblogthumb-phinf.pstatic.net/MjAyMjExMDRfNTQg/MDAxNjY3NTM1MjUwMTM5.UbGKNsQspu-mN4M3husNKIkqrjxTZVqDz495I1sOHxYg.mQRYtPom0sUssuJaI2SpRBwyTgMMxm-267qxjZq4jGQg.JPEG.babion_1/4.jpg?type=w800',
    initialFav: true,
  },
  {
    name: '윙크',
    status: '임시보호',
    tags: ['5개월', '사모예드', '암컷'],
    description: '작은 발로 아장아장 걷는 모습이 사랑스러운 아기 강아지예요. 함께할 가족을 찾습니다.',
    src: 'https://img1.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202105/25/holapet/20210525051114398gyiz.jpg',
    initialFav: true,
  },
  {
    name: '공주',
    status: '보호중',
    tags: ['1살', '보더콜리', '암컷'],
    description: '매우 영리하고 학습 능력이 뛰어나요. 야외 달리기나 공놀이를 즐기는 활동적인 가족에게 어울립니다.',
    src: 'https://storage.enuri.info/pic_upload/knowbox2/202402/03494830920240229230d567a-153b-4806-8cc9-defc73434507.jpg',
    initialFav: false,
  },
  {
    name: '미르',
    status: '보호중',
    tags: ['3살', '시베리안허스키', '암컷'],
    description: '듬직한 외모와 달리 겁이 조금 있는 어른이에요. 인내심을 갖고 미르의 친구가 되어주실 분을 찾습니다.',
    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUiKpi2_VVeW92mGASbdYA3igF2sL8j8V0bw&s',
    initialFav: false,
  },
];

const STATS = [
  { label: '오늘의 구조', value: 12, sub: '따뜻한 보호소에서 시작한 친구들' },
  { label: '이달의 입양', value: 45, sub: '새로운 가족을 만난 기적' },
  { label: '기다리는 친구들', value: 128, sub: '당신의 따뜻한 손길을 기다립니다' },
];

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
  const [favorites, setFavorites] = useState(
    () => Object.fromEntries(ALL_ANIMALS.map((a) => [a.name, a.initialFav]))
  );

  const toggleFavorite = (name) =>
    setFavorites((prev) => ({ ...prev, [name]: !prev[name] }));

  const likedAnimals = ALL_ANIMALS.filter((a) => favorites[a.name]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ALL_ANIMALS.map((animal) => (
              <AnimalCard
                key={animal.name}
                animal={animal}
                isFavorited={favorites[animal.name]}
                onToggleFavorite={toggleFavorite}
                onNavigateAnimalDetails={onNavigateAnimalDetails}
              />
            ))}
          </div>
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

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container-high p-8 rounded-3xl transition-transform hover:-translate-y-1 border border-outline-variant/10"
              >
                <span className="text-tertiary font-bold text-sm mb-2 block">{stat.label}</span>
                <h4 className="text-4xl font-extrabold text-on-surface">{stat.value}</h4>
                <p className="text-on-surface-variant text-sm mt-2">{stat.sub}</p>
              </div>
            ))}
          </div>
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

import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';

const MATCH_CARDS = [
  {
    name: '모승',
    breed: 'Beagle • 2 years',
    match: 98,
    src: 'https://img1.daumcdn.net/thumb/R1280x0.fwebp/?fname=http://t1.daumcdn.net/brunch/service/user/6P0U/image/1OWftaQcOlM1040OyU83hKxBmgs',
    offset: false,
  },
  {
    name: '똘똘',
    breed: 'Corgi • 1 year',
    match: 94,
    src: 'https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/722/2d9606f443d27267e4d45b15e624e9ed_res.jpeg',
    offset: true,
  },
  {
    name: '공주',
    breed: 'Golden Retriever • 4 months',
    match: 91,
    src: 'https://storage.enuri.info/pic_upload/knowbox2/202402/03494830920240229230d567a-153b-4806-8cc9-defc73434507.jpg',
    offset: false,
  },
];

const SAVED_ANIMALS = [
  { name: '모승', src: 'https://img1.daumcdn.net/thumb/R1280x0.fwebp/?fname=http://t1.daumcdn.net/brunch/service/user/6P0U/image/1OWftaQcOlM1040OyU83hKxBmgs' },
  { name: '똘똘', src: 'https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/722/2d9606f443d27267e4d45b15e624e9ed_res.jpeg' },
  { name: '메롱', src: 'https://mblogthumb-phinf.pstatic.net/MjAyMjExMDRfNTQg/MDAxNjY3NTM1MjUwMTM5.UbGKNsQspu-mN4M3husNKIkqrjxTZVqDz495I1sOHxYg.mQRYtPom0sUssuJaI2SpRBwyTgMMxm-267qxjZq4jGQg.JPEG.babion_1/4.jpg?type=w800' },
  { name: '윙크', src: 'https://img1.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202105/25/holapet/20210525051114398gyiz.jpg' },
];

function HomePage({
  onNavigateAnimalList,
  onNavigatePreferences,
  onNavigateAnimalDetails,
  onNavigateProfile,
  onNavigateReviews,
}) {
  return (
    <div className="bg-surface text-on-surface font-body">

      <Navbar
        activePage="home"
        isCurrentPage
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviews}
        onNavigateProfile={onNavigateProfile}
      />

      <div className="flex pt-20">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] w-64 bg-[#edf4ff] rounded-r-[1.5rem] py-8 pl-4 sticky top-20">
          <div className="px-4 mb-10">
            <h3 className="text-xl font-bold text-on-surface font-headline">메뉴</h3>
          </div>
          <nav className="flex-1 space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 py-3 px-6 bg-white text-[#8e4e14] rounded-l-full shadow-sm transition-transform duration-200"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>dashboard</span>
              <span className="font-medium">개요</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 py-3 px-6 text-[#534439] hover:bg-white/50 hover:translate-x-1 rounded-l-full transition-all duration-200"
            >
              <span className="material-symbols-outlined">favorite</span>
              <span className="font-medium">나의 매칭 현황</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 py-3 px-6 text-[#534439] hover:bg-white/50 hover:translate-x-1 rounded-l-full transition-all duration-200"
            >
              <span className="material-symbols-outlined">bookmark</span>
              <span className="font-medium">찜한 동물</span>
            </a>
          </nav>
          <div className="px-4 mt-auto">
            <button
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:scale-95 transition-all shadow-lg shadow-primary/20"
              onClick={onNavigatePreferences}
            >
              설문 작성
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 lg:px-12 max-w-7xl mx-auto overflow-hidden">

          {/* Hero */}
          <section className="mb-12">
            <h1 className="text-5xl font-extrabold text-on-background mb-2 tracking-tight font-headline">
              환영해요 예비 입양자님!
            </h1>
            <p className="text-on-surface-variant text-lg">캐치프레이즈 적으면 좋을 듯</p>
          </section>

          {/* 전국 구조 현황 Bento */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="md:col-span-2 bg-surface-container-high rounded-[1.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-tertiary font-bold text-sm mb-2">전국</h3>
                <h2 className="text-4xl font-bold text-on-background mb-6">구조 현황</h2>
                <div className="flex items-end gap-2 text-primary">
                  <span className="text-6xl font-black">12.4k</span>
                  <span className="text-lg font-semibold mb-2">올해 구조된 생명</span>
                </div>
              </div>
              <div className="mt-8 h-32 flex items-end gap-1 relative z-10">
                <div className="w-full bg-primary-container h-1/2 rounded-t-lg group-hover:h-3/4 transition-all duration-500" />
                <div className="w-full bg-primary h-3/4 rounded-t-lg group-hover:h-1/2 transition-all duration-500" />
                <div className="w-full bg-primary-container h-2/3 rounded-t-lg group-hover:h-full transition-all duration-500" />
                <div className="w-full bg-primary h-1/2 rounded-t-lg group-hover:h-2/3 transition-all duration-500" />
                <div className="w-full bg-primary-container h-3/4 rounded-t-lg group-hover:h-1/2 transition-all duration-500" />
                <div className="w-full bg-primary h-full rounded-t-lg group-hover:h-3/4 transition-all duration-500" />
              </div>
              <div className="absolute -right-10 -bottom-10 text-[200px] text-primary/5 material-symbols-outlined rotate-12 select-none">
                analytics
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center">
                <span className="text-tertiary font-bold text-sm uppercase tracking-widest mb-1">
                  이번 달 입양 건수
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-on-surface">28</span>
                  <div className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    +12%
                  </div>
                </div>
              </div>
              <div className="bg-primary rounded-[1.5rem] p-6 text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-center">
                <span className="text-on-primary/70 font-bold text-sm uppercase tracking-widest mb-1">
                  봉사 활동 건수
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">42</span>
                  <span className="material-symbols-outlined text-4xl opacity-50">volunteer_activism</span>
                </div>
              </div>
            </div>
          </section>

          {/* Top Matches */}
          <section className="mb-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-on-background font-headline">Top Matches for You</h2>
                <p className="text-on-surface-variant">Personalized based on your lifestyle and preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MATCH_CARDS.map((card) => (
                <button
                  key={card.name}
                  className={`group cursor-pointer block text-left w-full${card.offset ? ' md:-mt-6' : ''}`}
                  onClick={() => onNavigateAnimalDetails(card.name)}
                >
                  <div className="relative mb-4 rounded-[1.5rem] overflow-hidden aspect-[4/5]">
                    <img
                      alt="pet photo"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={card.src}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold text-xs">
                      {card.match}% Match
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{card.name}</h3>
                      <p className="text-sm opacity-90">{card.breed}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 찜한 동물 Carousel */}
          <section className="mb-20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-2xl font-bold text-on-background font-headline">찜한 동물</h2>
                <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
              </div>
              <button
                className="text-primary font-bold flex items-center gap-2 hover:underline ml-4"
                onClick={onNavigateAnimalList}
              >
                전체 보기
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {SAVED_ANIMALS.map((animal) => (
                <button
                  key={animal.name}
                  className="flex-shrink-0 w-48 group block"
                  onClick={() => onNavigateAnimalDetails(animal.name)}
                >
                  <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 transition-transform group-hover:scale-105">
                    <img alt="animal" className="w-full h-full object-cover" src={animal.src} />
                  </div>
                  <p className="text-center font-bold text-on-surface">{animal.name}</p>
                </button>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-[60]">
        <button className="flex items-center gap-3 bg-primary text-on-primary px-6 py-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95 group">
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            smart_toy
          </span>
          <span className="font-bold">AI 펫봇 채팅</span>
        </button>
      </div>

      <AppFooter />

    </div>
  );
}

export default HomePage;

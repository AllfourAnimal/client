import { useState } from 'react';

const REVIEWS = [
  {
    id: 1,
    category: '강아지',
    certified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo9ik3k6gN_UhSmJreSlGSUI5VzWKvjp3CgOeibsIrq0XlBIG0HEp3b_Ys65TNAEDyavboCTBMu3eKNxxy3-onVt-8N1Idsrzn7H5Ju947cnt9HLa9II_K42DYxIgkeXfMEaN2zwbP8_j8V3RWqAFXYGTXW4qMXxvi_f3ygMEFbUdkcpQA1vXS2garPrJTLcOUOq-UxhqStj2dz64j3PyDT-njmNLC1F3AG6FX_z5I-KolzrFUaOMG-_67OQnhEqAnAGXFT86XDFRb',
    alt: '두 마리의 아기 고양이',
    author: '김정묵 님',
    date: 'Nov 20, 2026',
    title: '김정묵의 충견: 쭌준수',
    excerpt: '쭌준수는 정보기술관 지하 1층 남자화장실 5사로에서 발견되었습니다. 발견 당시 그의 모습은 매우 초췌하였으며 눈았습니다...',
  },
  {
    id: 2,
    category: '강아지',
    certified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF22IQDioBAIsal0IhSOXORtvv9Y818-9-TnE-CuA5tRKIbuaGtyL0VOl-hXCmnKThatYN82pOe5MUxowdWE9E9_Za4-93qKs3iS5RA9Sw-mVrUCRRBTHnNglyNMY08EgXfTLCsKpbfxoGBAo08M6MKIi3qVG2ULbypZca9WGa0KRTYqRR6CqahoEiOrESIQ8AzSNK3xuxx2qLop_F_Z2jAQP6jYos7P79S5V1QEbOX1WcpYMKU9VYkDZ4-ud19hUbkMibdblGqqyi',
    alt: '벤치에 앉아있는 테리어 믹스',
    author: 'Elena Rossi',
    date: 'Oct 08, 2024',
    title: '14살의 짖음: 벨라의 이야기',
    excerpt: '노령견 입양이 우리 가족에게 준 최고의 선물에 대해 공유합니다. 벨라는 우리 집에 평화와 지혜를 가져다주었습니다...',
  },
  {
    id: 3,
    category: '강아지',
    certified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbmzdYmtUgsFc7qPZ6d82JZTREf3i_BoLSJwZOQk5BbandjcIXzFlCpJQetS0TrPM0SiDXK7kRJ-6ld_4ziEyKKvEvwE0qdHI4Zj4uiJhWkY390DKgSYcm8n1F_-fOalJ0k38iHRCjwdf_hksXL9On_wSWQlfh_Oq0hLfrWJ8_uOQW6ufBVTieGzffZ623puIVO8Vo-m0f1XGOx1nnPrMBqG1t_OETglvCpInlmmoEThIHcYhD4BclmljDuHNWeoTxgwO3zKsDNY14',
    alt: '잠자는 그레이하운드',
    author: 'Sam Wilson',
    date: 'Sep 25, 2024',
    title: '트랙에서 소파로: 블루',
    excerpt: '은퇴한 경주견 그레이하운드의 적응기는 특별한 모험입니다. 블루는 이제 계단 오르는 법을 배우고 땅콩버터의 맛을 알게 되었습니다...',
  },
  {
    id: 4,
    category: '강아지',
    certified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPLldKx6LhZFOINhaus2eBEQxMsSdyZHN7_ibZpQ8UBch8KMlwJ3n-55aXxXFYkqYvjecIx_SKrYatTUb9MTCBlpckyat1lg1jEMwqR6FcE0ckj7e1vZ5CH_txtcGr7kWcoKgXjRN2cqgdaE528NxcEt_B-tITskudu7Hw0SdX2kcP2gG0LXYH-pY2fVo4keLwTeXeK4GxosA3RHPczcQWzS6pJs4qohePpbmGIGRwS_MFe90rd_r2GUOwIjtcHWDu8OWgCP0N_kns',
    alt: '함께 노는 개들',
    author: 'Julian King',
    date: 'Sep 18, 2024',
    title: '새로운 무리의 발견',
    excerpt: '구조된 유기견이 다섯 마리의 다른 동물들과 어떻게 가족이 되었는지, 조화롭고 활기찬 다둥이 가족의 이야기를 전합니다...',
  },
  {
    id: 5,
    category: '강아지',
    certified: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJyfFd92BD_R-KLs7b_zX7784zzxAIYu43k85sbjh4xzPZcLDAUPTPS3R_jJhmdwAuZUUWMEUKSdxPOr5IcLa6h3Ic3UH3RcbKM-PdlMwMPlT5W_MM4YYn0eL3f7dLsopjX34v7P2Pmy8CW1AWwtNC8W2OlEyJ0QiGYGtmKlyJeM6Tx6V5t2QW2cKGTStmuJuYaOM9e1xh5DRSsjVE53aPqWVQf0Sbmx5Rvet9tpixSXSCCFGV7s0xR4gMN8hSn8suXoTPlF6rLjPo',
    alt: '강아지 훈련 모습',
    author: 'Kim Min-su',
    date: 'Sep 10, 2024',
    title: '처음 데려온 날의 긍정 교육',
    excerpt: '새로운 환경에 낯설어하는 강아지를 위해 가장 먼저 해야 할 긍정 강화 교육법을 소개합니다. 기다림이 핵심입니다...',
  },
];

const FILTERS = ['전체', '강아지', '고양이', '입양 인증'];

function ReviewListPage({ onNavigateHome, onNavigateAnimalList, onNavigateProfile, onNavigateReviewDetails }) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = REVIEWS.filter((r) => {
    const matchesFilter =
      activeFilter === '전체' ||
      (activeFilter === '강아지' && r.category === '강아지') ||
      (activeFilter === '고양이' && r.category === '고양이') ||
      (activeFilter === '입양 인증' && r.certified);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.excerpt.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed inset-0 grain-overlay z-[40] pointer-events-none" />

      {/* TopNavBar */}
      <header className="bg-[#f7f9ff] fixed top-0 w-full z-50">
        <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold text-[#091d2e] flex items-center gap-2">
            <button className="flex items-center gap-2" onClick={onNavigateHome}>
              <span className="material-symbols-outlined text-[#8e4e14]" style={{ fontVariationSettings: '"FILL" 1' }}>
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
            <button
              className="text-[#534439] font-medium hover:text-[#8e4e14] transition-colors duration-300"
              onClick={onNavigateAnimalList}
            >
              동물 목록
            </button>
            <span className="text-[#8e4e14] font-bold border-b-2 border-[#8e4e14] pb-1 cursor-default">
              입양 후기
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <span className="material-symbols-outlined text-[#534439] cursor-pointer p-2 rounded-full hover:bg-surface-container transition-all">
                notifications
              </span>
            </div>
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

      <main className="max-w-screen-2xl mx-auto px-8 py-8 pt-24">
        {/* CTA */}
        <section className="mb-12">
          <div className="relative bg-primary-container/20 rounded-[2rem] p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-primary-container/30">
            <div className="relative z-10 text-center md:text-left">
              <h1 className="font-headline text-3xl font-extrabold text-primary mb-3">
                당신의 소중한 입양 이야기를 들려주세요
              </h1>
              <p className="text-on-surface-variant font-medium text-lg max-w-2xl">
                반려동물과의 만남, 그 특별한 순간을 이웃들과 공유하고 새로운 가족을 기다리는 아이들에게 희망을 전해주세요.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined">edit_square</span>
                후기 작성하기
              </button>
            </div>
            <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/4 opacity-10">
              <span
                className="material-symbols-outlined text-[200px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                pets
              </span>
            </div>
          </div>
        </section>

        {/* Filter + Search */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                    activeFilter === f
                      ? 'bg-primary text-white font-bold shadow-md'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-container/20 hover:text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-96">
              <input
                className="w-full bg-surface-container-lowest border-none rounded-full py-3.5 pl-6 pr-12 text-on-surface shadow-sm focus:ring-2 focus:ring-primary/30 transition-shadow"
                placeholder="품종이나 키워드로 검색하세요..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface shrink-0">최근 업로드 된 이야기</h2>
            <div className="h-[1px] flex-grow bg-surface-container-high" />
          </div>
        </section>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((review) => (
              <article
                key={review.id}
                className="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl group border border-surface-container"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    alt={review.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={review.image}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                    {review.certified ? '입양 인증' : '입양 미인증'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4 text-xs text-on-surface-variant font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      {review.author}
                    </span>
                    <span className="w-1 h-1 bg-outline-variant rounded-full" />
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {review.date}
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-3 text-on-surface group-hover:text-primary transition-colors">
                    {review.title}
                  </h3>
                  <p className="text-on-surface-variant line-clamp-2 mb-6 font-body text-sm">
                    {review.excerpt}
                  </p>
                  <button
                    className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm"
                    onClick={() => onNavigateReviewDetails && onNavigateReviewDetails(review.id)}
                  >
                    더 읽어보기{' '}
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-30">search_off</span>
            <p className="text-lg font-semibold">검색 결과가 없습니다.</p>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <button className="bg-surface-container-high text-primary font-bold px-12 py-3.5 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm">
            더 많은 이야기 보기
          </button>
        </div>
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

export default ReviewListPage;

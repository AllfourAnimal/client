import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import ReviewCard from '../components/reviews/ReviewCard';
import { REVIEWS } from '../data/reviewData';

const FILTERS = ['전체', '강아지', '고양이', '입양 인증'];

function ReviewListPage({ onNavigateHome, onNavigateAnimalList, onNavigateProfile, onNavigateReviewDetails, onNavigateReviewPost }) {
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

      <Navbar
        activePage="review-list"
        isCurrentPage
        onNavigateHome={onNavigateHome}
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateProfile={onNavigateProfile}
      />

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
              <button
                className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                onClick={onNavigateReviewPost}
              >
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
              <ReviewCard
                key={review.id}
                review={review}
                onNavigateReviewDetails={onNavigateReviewDetails}
              />
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

      <AppFooter />
    </div>
  );
}

export default ReviewListPage;

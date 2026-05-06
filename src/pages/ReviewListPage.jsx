import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import ReviewCard from '../components/reviews/ReviewCard';
import { fetchAdoptedReviews, fetchReviews, fetchReviewsByAnimalType } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const FILTERS = ['전체', '강아지', '고양이', '기타 축종', '입양 인증'];
const ANIMAL_TYPE_FILTERS = {
  강아지: 'DOG',
  고양이: 'CAT',
  '기타 축종': 'OTHER',
};
const PAGE_SIZE = 9;
const DEFAULT_REVIEW_IMAGE = '/all4animal-paw.svg';

function readReviewList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.reviews)) return data.reviews;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatDateOnly(value) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function normalizeReview(review) {
  const image =
    review.thumbnailImageUrl ||
    review.imageUrl ||
    review.image ||
    review.images?.[0] ||
    review.photoUrls?.[0] ||
    DEFAULT_REVIEW_IMAGE;

  const content = review.content || review.body || review.excerpt || '';

  return {
    id: review.reviewId ?? review.id,
    title: review.title || '제목 없는 후기',
    author: review.author || review.writer || review.nickname || review.memberName || review.username || '익명',
    date: formatDateOnly(review.createdAt || review.date || review.createdDate),
    excerpt: content.length > 90 ? `${content.slice(0, 90)}...` : content,
    category: review.category || review.animalType || review.petType || '',
    certified: Boolean(review.certified ?? review.adoptionCertified ?? review.isCertified ?? review.adopted),
    image,
    alt: review.title || '입양 후기 사진',
  };
}

function ReviewListPage({ onNavigateHome, onNavigateAnimalList, onNavigateProfile, onNavigateReviewDetails, onNavigateReviewPost }) {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadReviews = useCallback(async (nextPage = 0, append = false, filter = '전체') => {
    append ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      let data;
      if (ANIMAL_TYPE_FILTERS[filter]) {
        data = await fetchReviewsByAnimalType(ANIMAL_TYPE_FILTERS[filter]);
      } else if (filter === '입양 인증') {
        data = await fetchAdoptedReviews();
      } else {
        data = await fetchReviews(accessToken);
      }
      const list = readReviewList(data).map(normalizeReview).filter((r) => r.id !== undefined && r.id !== null);
      const nextHasMore = data?.hasNext ?? (typeof data?.last === 'boolean' ? !data.last : list.length === PAGE_SIZE);
      setReviews((prev) => (append ? [...prev, ...list] : list));
      setPage(nextPage);
      setHasMore(filter === '전체' && Boolean(nextHasMore));
    } catch (err) {
      setError('리뷰 목록을 불러오지 못했습니다.');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadReviews(0, false);
  }, [loadReviews]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    loadReviews(0, false, filter);
  };

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

        {/* Filter */}
        <section className="mb-12 space-y-6">
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterClick(f)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${activeFilter === f
                  ? 'bg-primary text-white font-bold shadow-md'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-container/20 hover:text-primary'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface shrink-0">최근 업로드 된 이야기</h2>
            <div className="h-[1px] flex-grow bg-surface-container-high" />
          </div>
        </section>

        {/* Cards */}
        {loading ? (
          <p className="text-center text-on-surface-variant py-24">리뷰를 불러오는 중...</p>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-30">error</span>
            <p className="text-lg font-semibold text-error">{error}</p>
            <button
              className="mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all"
              onClick={() => loadReviews(0, false, activeFilter)}
            >
              다시 불러오기
            </button>
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
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
            <p className="text-lg font-semibold">리뷰가 없습니다.</p>
          </div>
        )}

        {!loading && !error && activeFilter === '전체' && hasMore && (
          <div className="mt-16 flex justify-center">
            <button
              className="bg-surface-container-high text-primary font-bold px-12 py-3.5 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-50"
              disabled={loadingMore}
              onClick={() => loadReviews(page + 1, true, activeFilter)}
            >
              {loadingMore ? '불러오는 중...' : '더 많은 이야기 보기'}
            </button>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

export default ReviewListPage;

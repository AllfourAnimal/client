import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { fetchMe } from '../api/auth';
import { deleteReview, fetchReviewDetail } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REVIEW_IMAGE =
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80';

function getUserId(user) {
  return user?.userId ?? user?.id ?? user?.memberId ?? user?.data?.userId ?? user?.data?.id ?? null;
}

function getReviewAuthorId(review) {
  return review?.userId ?? review?.authorId ?? review?.writerId ?? review?.memberId ?? review?.user?.userId ?? review?.user?.id ?? review?.author?.userId ?? review?.author?.id ?? null;
}

function formatDateOnly(value) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function ReviewDetailsPage({ reviewId, onNavigateHome, onNavigateAnimalList, onNavigateReviewList, onNavigateProfile }) {
  const { accessToken } = useAuth();
  const [review, setReview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReview = async () => {
      if (!reviewId) {
        setError('조회할 리뷰를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const reviewData = await fetchReviewDetail(reviewId, accessToken);
        setReview(reviewData);
      } catch (err) {
        setError('리뷰 상세 정보를 불러오지 못했습니다.');
      }

      try {
        const meData = await fetchMe(accessToken);
        setCurrentUserId(getUserId(meData));
      } catch (err) {
        setCurrentUserId(null);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [accessToken, reviewId]);

  const handleDelete = async () => {
    if (!isMyReview || deleting) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const targetReviewId = review?.id || review?.reviewId || reviewId;
    if (!targetReviewId || deleting) return;

    setDeleting(true);
    setError('');
    try {
      await deleteReview(targetReviewId, accessToken);
      setShowDeleteModal(false);
      onNavigateReviewList();
    } catch (err) {
      setError('리뷰를 삭제하지 못했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const mainImage = review?.images?.[0] || DEFAULT_REVIEW_IMAGE;
  const sideImages = review?.images?.slice(1, 3) || [];
  const reviewAuthorId = getReviewAuthorId(review);
  const isMyReview = currentUserId != null && reviewAuthorId != null && String(currentUserId) === String(reviewAuthorId);
  const isAdoptedReview = Boolean(review?.is_adopted ?? review?.certified);

  return (
    <div className="bg-surface text-on-surface font-body">
      <Navbar
        activePage="review-list"
        onNavigateHome={onNavigateHome}
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviewList}
        onNavigateProfile={onNavigateProfile}
      />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
        {loading ? (
          <p className="text-center text-on-surface-variant py-24">리뷰를 불러오는 중...</p>
        ) : error && !review ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl mb-4 text-on-surface-variant opacity-30">error</span>
            <p className="text-lg font-semibold text-error">{error}</p>
            <button
              className="mt-6 bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-bold"
              onClick={onNavigateReviewList}
            >
              목록으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
              <div className="md:col-span-8 overflow-hidden rounded-2xl relative group">
                <img
                  className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={review.petName}
                  src={mainImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="md:col-span-4 flex flex-col gap-4">
                {[0, 1].map((index) => (
                  <div key={index} className="h-1/2 overflow-hidden rounded-2xl bg-surface-container-low">
                    <img
                      className="w-full h-full object-cover"
                      alt={`${review.petName} 사진 ${index + 1}`}
                      src={sideImages[index] || mainImage}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-2xl p-8 mb-12 shadow-[0_8px_32px_rgba(9,29,46,0.04)] flex flex-wrap justify-between items-center gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-on-surface-variant text-sm font-medium mb-1 text-center">이름</span>
                <span className="text-2xl font-extrabold text-primary">{review.petName}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-on-surface-variant text-sm font-medium mb-1 text-center">공고번호</span>
                <span className="text-lg font-bold text-on-surface">{review.desertion_no}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-on-surface-variant text-sm font-medium mb-1 text-center">구조 위치</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary text-sm">location_on</span>
                  <span className="text-lg font-bold text-on-surface">{review.happenPlace}</span>
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-on-surface-variant text-sm font-medium mb-1 text-center">입양 날짜</span>
                <span className="text-lg font-bold text-on-surface">{review.adoptedAt == null ? "-" : review.adoptedAt}</span>
              </div>
              {isAdoptedReview && (
                <div className="bg-primary-container/20 text-on-primary-container px-6 py-3 rounded-full font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">favorite</span>
                  입양 인증
                </div>
              )}
            </section>

            <article className="max-w-6xl mx-auto">
              <header className="mb-10 text-center max-w-4xl mx-auto">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-container/20 px-5 py-2 text-sm font-extrabold text-primary">
                  <span className="material-symbols-outlined text-lg">auto_stories</span>
                  입양 후기
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface mb-6 leading-tight font-headline">
                  {review.title}
                </h1>
                <div className="mx-auto h-1 w-24 rounded-full bg-primary-container" />
              </header>

              {error && <p className="text-center text-error mb-8">{error}</p>}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8 flex">
                  <div className="relative min-h-[420px] h-full w-full overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-[0_12px_40px_rgba(9,29,46,0.06)]">
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-primary-container" />
                    <div className="p-8 md:p-12">
                      <div className="mb-8 flex items-center gap-3 text-primary">
                        <span className="material-symbols-outlined text-3xl">format_quote</span>
                        <span className="text-sm font-extrabold tracking-wide uppercase">Adoption Story</span>
                      </div>
                      <div className="whitespace-pre-line text-lg md:text-xl leading-9 text-on-surface-variant">
                        {review.content}
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="lg:col-span-4 flex flex-col gap-5">
                  <div className="flex flex-1 flex-col rounded-2xl bg-surface-container-lowest border border-outline-variant/15 p-6 shadow-[0_12px_40px_rgba(9,29,46,0.05)]">
                    <h2 className="font-headline text-xl font-extrabold text-on-surface mb-5">정보</h2>
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
                        <dt className="text-sm font-semibold text-on-surface-variant">작성자</dt>
                        <dd className="font-bold text-on-surface text-right">{review.username || '익명'}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
                        <dt className="text-sm font-semibold text-on-surface-variant">작성일</dt>
                        <dd className="font-bold text-on-surface text-right">{formatDateOnly(review.createdAt) || '-'}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
                        <dt className="text-sm font-semibold text-on-surface-variant">종류</dt>
                        <dd className="font-bold text-on-surface text-right">{review.species || '-'}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-sm font-semibold text-on-surface-variant">구조 위치</dt>
                        <dd className="font-bold text-on-surface text-right">{review.happenPlace || '-'}</dd>
                      </div>
                    </dl>

                    <div className="mt-8 rounded-xl bg-primary-container/10 p-5 text-center">
                      <span className="material-symbols-outlined text-primary text-3xl mb-2">
                        {isAdoptedReview ? 'verified' : 'pets'}
                      </span>
                      <p className="font-extrabold text-on-surface">
                        {isAdoptedReview ? '입양 인증 후기' : '입양 미인증 후기'}
                      </p>
                    </div>
                  </div>

                  <button
                    className="w-full bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-secondary-container/80 transition-all active:scale-95 shadow-md"
                    onClick={onNavigateReviewList}
                  >
                    <span className="material-symbols-outlined">list</span>
                    목록으로 돌아가기
                  </button>
                  {isMyReview && (
                    <button
                      className="w-full border-2 border-error text-error px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-error-container hover:text-on-error-container transition-all disabled:opacity-50"
                      disabled={deleting}
                      onClick={handleDelete}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      {deleting ? '삭제 중...' : '리뷰 삭제'}
                    </button>
                  )}
                </aside>
              </div>
            </article>
          </>
        )}
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 text-center shadow-2xl border border-outline-variant/20">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-error-container text-error">
              <span className="material-symbols-outlined text-4xl">delete</span>
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-3">리뷰를 삭제하시겠습니까?</h2>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              삭제한 리뷰는 다시 복구할 수 없습니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 rounded-full bg-secondary-container px-6 py-3 font-bold text-on-secondary-container transition-all hover:bg-secondary-container/80 disabled:opacity-50"
                disabled={deleting}
                type="button"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                className="flex-1 rounded-full bg-error px-6 py-3 font-bold text-on-error transition-all hover:brightness-95 disabled:opacity-50"
                disabled={deleting}
                type="button"
                onClick={confirmDelete}
              >
                {deleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}

export default ReviewDetailsPage;

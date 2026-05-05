import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { deleteReview, fetchReviewDetail } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REVIEW_IMAGE =
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80';


function ReviewDetailsPage({ reviewId, onNavigateHome, onNavigateAnimalList, onNavigateReviewList, onNavigateProfile }) {
  const { accessToken } = useAuth();
  const [review, setReview] = useState(null);
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
        const data = await fetchReviewDetail(reviewId, accessToken);
        setReview(data);
      } catch (err) {
        setError('리뷰 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [accessToken, reviewId]);

  const handleDelete = async () => {
    if (deleting) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const targetReviewId = review?.id || reviewId;
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
  console.log(review)
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
                <span className="text-on-surface-variant text-sm font-medium mb-1 text-center">종류</span>
                <span className="text-2xl font-extrabold text-primary">{review.species}</span>
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
              {review.certified && (
                <div className="bg-primary-container/20 text-on-primary-container px-6 py-3 rounded-full font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">favorite</span>
                  입양 인증
                </div>
              )}
            </section>

            <article className="max-w-4xl mx-auto">
              <header className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight font-headline">
                  {review.title}
                </h1>
                <div className="flex items-center justify-center gap-4 text-on-surface-variant">
                  <span>작성자: {review.author}</span>
                  <span className="w-1 h-1 bg-outline-variant rounded-full" />
                  <span>{review.date}</span>
                </div>
              </header>

              {error && <p className="text-center text-error mb-8">{error}</p>}

              <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant whitespace-pre-line">
                {review.content}
              </div>

              <div className="mt-16 pt-12 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-secondary-container/80 transition-all active:scale-95 shadow-md"
                  onClick={onNavigateReviewList}
                >
                  <span className="material-symbols-outlined">list</span>
                  목록으로 돌아가기
                </button>
                <button
                  className="border-2 border-error text-error px-10 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-error-container hover:text-on-error-container transition-all disabled:opacity-50"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  <span className="material-symbols-outlined">delete</span>
                  {deleting ? '삭제 중...' : '리뷰 삭제'}
                </button>
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

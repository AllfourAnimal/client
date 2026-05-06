import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { fetchMe } from '../api/auth';
import { deleteReview, fetchReviewDetail, updateReview } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REVIEW_IMAGE = '/all4animal-paw.svg';
const MAX_REVIEW_IMAGES = 3;

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

function getReviewImages(review) {
  const images = review?.images || review?.imageUrls || review?.imageUrlList || review?.photoUrls || review?.image_url_list || [];
  const list = Array.isArray(images) ? images : [images];
  return list.filter(Boolean).slice(0, 3);
}

function fillGalleryImages(images) {
  return Array.from({ length: 3 }, (_, index) => images[index] || DEFAULT_REVIEW_IMAGE);
}

function ReviewDetailsPage({ reviewId, onNavigateHome, onNavigateAnimalList, onNavigateReviewList, onNavigateProfile }) {
  const { accessToken } = useAuth();
  const [review, setReview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    petName: '',
    content: '',
  });
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editNewImageFiles, setEditNewImageFiles] = useState([]);
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

  const handleOpenEdit = () => {
    if (!isMyReview || !review) return;
    setEditForm({
      title: review.title || '',
      petName: review.petName || '',
      content: review.content || '',
    });
    setEditExistingImages(getReviewImages(review));
    setEditNewImageFiles([]);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remainingSlots = MAX_REVIEW_IMAGES - editExistingImages.length - editNewImageFiles.length;
    if (remainingSlots <= 0) {
      setError(`사진은 최대 ${MAX_REVIEW_IMAGES}장까지만 등록할 수 있습니다.`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    setEditNewImageFiles((prev) => [...prev, ...filesToAdd]);
    setError(selectedFiles.length > remainingSlots ? `사진은 최대 ${MAX_REVIEW_IMAGES}장까지만 등록할 수 있습니다.` : '');
    e.target.value = '';
  };

  const removeExistingEditImage = (indexToRemove) => {
    setEditExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewEditImage = (indexToRemove) => {
    setEditNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const targetReviewId = review?.id || review?.reviewId || reviewId;
    if (!isMyReview || !targetReviewId || updating) return;

    if (!editForm.title.trim() || !editForm.petName.trim() || !editForm.content.trim()) {
      setError('제목, 이름, 내용을 모두 입력해 주세요.');
      return;
    }

    const payload = {
      title: editForm.title.trim(),
      petName: editForm.petName.trim(),
      content: editForm.content.trim(),
      imageUrls: editExistingImages,
      imageFiles: editNewImageFiles,
    };

    setUpdating(true);
    setError('');
    try {
      await updateReview(targetReviewId, accessToken, payload);
      const updatedReview = await fetchReviewDetail(targetReviewId, accessToken);
      setReview(updatedReview);
      setShowEditModal(false);
    } catch (err) {
      setError('리뷰를 수정하지 못했습니다.');
    } finally {
      setUpdating(false);
    }
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

  const reviewImages = getReviewImages(review);
  const galleryImages = fillGalleryImages(reviewImages);
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
            <section className="mb-12">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-headline text-2xl font-extrabold text-on-surface">사진</h2>
                <span className="rounded-full bg-surface-container-low px-4 py-1.5 text-sm font-bold text-on-surface-variant">
                  {reviewImages.length > 0 ? `${reviewImages.length}장` : '기본 이미지'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`${index === 0 ? 'md:col-span-8 md:row-span-2' : 'md:col-span-4'} overflow-hidden rounded-2xl bg-surface-container-low relative group`}
                  >
                    <img
                      className={`${index === 0 ? 'h-[520px]' : 'h-[252px]'} w-full object-cover transition-transform duration-500 group-hover:scale-105`}
                      alt={`${review.petName || '리뷰'} 사진 ${index + 1}`}
                      src={image}
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    )}
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
                <span className="text-lg font-bold text-on-surface">{review.adoptedAt == null ? "-" : formatDateOnly(review.adoptedAt)}</span>
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
                    <>
                      <button
                        className="w-full border-2 border-primary text-primary px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary-container/20 transition-all disabled:opacity-50"
                        disabled={updating}
                        onClick={handleOpenEdit}
                      >
                        <span className="material-symbols-outlined">edit</span>
                        리뷰 수정
                      </button>
                      <button
                        className="w-full border-2 border-error text-error px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-error-container hover:text-on-error-container transition-all disabled:opacity-50"
                        disabled={deleting}
                        onClick={handleDelete}
                      >
                        <span className="material-symbols-outlined">delete</span>
                        {deleting ? '삭제 중...' : '리뷰 삭제'}
                      </button>
                    </>
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

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
          <form
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant/20"
            onSubmit={handleUpdate}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-container/20 px-4 py-1.5 text-sm font-extrabold text-primary">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  리뷰 수정
                </div>
                <h2 className="text-2xl font-extrabold text-on-surface">후기 내용을 수정하세요</h2>
              </div>
              <button
                className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-low"
                disabled={updating}
                type="button"
                onClick={() => setShowEditModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary" htmlFor="edit-title">제목</label>
                <input
                  className="w-full rounded-xl bg-surface-container-low border-none px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary-fixed"
                  id="edit-title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleEditChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary" htmlFor="edit-pet-name">이름</label>
                <input
                  className="w-full rounded-xl bg-surface-container-low border-none px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary-fixed"
                  id="edit-pet-name"
                  name="petName"
                  type="text"
                  value={editForm.petName}
                  onChange={handleEditChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary" htmlFor="edit-content">내용</label>
                <textarea
                  className="w-full rounded-xl bg-surface-container-low border-none px-5 py-4 text-on-surface leading-relaxed focus:ring-2 focus:ring-primary-fixed resize-none"
                  id="edit-content"
                  name="content"
                  rows="8"
                  value={editForm.content}
                  onChange={handleEditChange}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-primary tracking-wide uppercase" htmlFor="edit-images">
                  사진 파일
                </label>

                {editExistingImages.length + editNewImageFiles.length < MAX_REVIEW_IMAGES ? (
                  <>
                    <label
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low p-8 text-center transition-all hover:border-primary/50 hover:bg-primary-container/10"
                      htmlFor="edit-images"
                    >
                      <span className="material-symbols-outlined text-4xl text-primary">add_photo_alternate</span>
                      <span className="font-bold text-on-surface">
                        {editExistingImages.length + editNewImageFiles.length > 0
                          ? `${editExistingImages.length + editNewImageFiles.length}장 선택됨`
                          : '업로드할 사진을 선택하세요'}
                      </span>
                      <span className="text-sm text-on-surface-variant">
                        JPG, PNG 등 이미지 파일을 최대 3장까지 첨부할 수 있습니다.
                      </span>
                    </label>
                    <input
                      accept="image/*"
                      className="hidden"
                      id="edit-images"
                      multiple
                      type="file"
                      onChange={handleEditImageChange}
                    />
                  </>
                ) : (
                  <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface-variant">
                    사진이 3장입니다. 새 사진을 추가하려면 기존 사진을 삭제해 주세요.
                  </p>
                )}

                {(editExistingImages.length > 0 || editNewImageFiles.length > 0) && (
                  <div className="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/10">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-on-surface">선택한 사진</p>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {editExistingImages.length + editNewImageFiles.length}/{MAX_REVIEW_IMAGES}
                      </span>
                    </div>

                    {editExistingImages.length > 0 && (
                      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {editExistingImages.map((imageUrl, index) => (
                          <div key={`${imageUrl}-${index}`} className="relative overflow-hidden rounded-xl bg-surface-container-low">
                            <img
                              className="h-28 w-full object-cover"
                              alt={`현재 리뷰 사진 ${index + 1}`}
                              src={imageUrl}
                            />
                            <button
                              className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white transition-all hover:bg-error"
                              title="현재 사진 삭제"
                              type="button"
                              onClick={() => removeExistingEditImage(index)}
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {editNewImageFiles.length > 0 && (
                      <ul className="space-y-2">
                        {editNewImageFiles.map((file, index) => (
                          <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm">
                            <span className="truncate text-on-surface-variant">{file.name}</span>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="font-bold text-primary">
                                {editExistingImages.length + index + 1}/{MAX_REVIEW_IMAGES}
                              </span>
                              <button
                                className="inline-flex size-7 items-center justify-center rounded-full text-error transition-all hover:bg-error-container"
                                title="새 사진 삭제"
                                type="button"
                                onClick={() => removeNewEditImage(index)}
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                className="rounded-full bg-secondary-container px-7 py-3 font-bold text-on-secondary-container transition-all hover:bg-secondary-container/80 disabled:opacity-50"
                disabled={updating}
                type="button"
                onClick={() => setShowEditModal(false)}
              >
                취소
              </button>
              <button
                className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary transition-all hover:bg-primary/90 disabled:opacity-50"
                disabled={updating}
                type="submit"
              >
                {updating ? '수정 중...' : '수정 저장'}
              </button>
            </div>
          </form>
        </div>
      )}

      <AppFooter />
    </div>
  );
}

export default ReviewDetailsPage;

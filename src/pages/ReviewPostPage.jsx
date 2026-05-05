import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { fetchMyAdoptions } from '../api/adoptions';
import { createReview } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const REVIEW_DRAFT_STATUSES = new Set([
  '입양 문의',
  '입양문의',
  '문의',
  'ADOPTION_INQUIRY',
  'INQUIRY',
  '입양 신청',
  '입양신청',
  '신청',
  'ADOPTION_APPLICATION',
  'APPLICATION',
  'APPLYING',
  'APPLIED',
]);

const ADOPTION_STATUS_LABELS = {
  INQUIRY: '입양문의',
  ADOPTION_INQUIRY: '입양문의',
  APPLIED: '입양신청',
  APPLICATION: '입양신청',
  APPLYING: '입양신청',
  ADOPTION_APPLICATION: '입양신청',
};

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function getAdoptionStatus(adoption) {
  return adoption.status || adoption.adoptionStatus || adoption.step || adoption.state || '';
}

function getAdoptionStatusLabel(adoption) {
  const status = getAdoptionStatus(adoption);
  return ADOPTION_STATUS_LABELS[status] || status || '입양 진행';
}

function getAnimalId(adoption) {
  return adoption.desertionNo || adoption.desertion_no || adoption.animalId || adoption.animal?.animalId || adoption.animal?.id || adoption.petId || adoption.id || '';
}

function getPetName(adoption) {
  return adoption.animalSpecies || adoption.petName || adoption.animalName || adoption.animal?.name || adoption.animal?.species || adoption.name || '';
}

function getAdoptionAddress(adoption) {
  return adoption.address || adoption.location || adoption.happenPlace || adoption.careAddr || adoption.careAddress || adoption.animal?.address || adoption.animal?.happenPlace || adoption.animal?.careAddr || '';
}

function ReviewPostPage({ onNavigateHome, onNavigateAnimalList, onNavigateAnimalDetails, onNavigateReviewList, onNavigateProfile }) {
  const { accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [petName, setPetName] = useState('');
  const [desertionNo, setDesertionNo] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [adoptionsLoading, setAdoptionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedAnimalId, setCopiedAnimalId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdoptions = async () => {
      if (!accessToken) return;
      setAdoptionsLoading(true);
      try {
        const data = await fetchMyAdoptions(accessToken);
        const reviewDrafts = unwrapList(data).filter((adoption) =>
          REVIEW_DRAFT_STATUSES.has(getAdoptionStatus(adoption))
        );
        setAdoptions(reviewDrafts);
      } catch (err) {
        setAdoptions([]);
      } finally {
        setAdoptionsLoading(false);
      }
    };

    loadAdoptions();
  }, [accessToken]);

  const handleSelectAdoption = (adoption) => {
    const selectedAnimalId = getAnimalId(adoption);

    if (selectedAnimalId && onNavigateAnimalDetails) {
      onNavigateAnimalDetails(String(selectedAnimalId));
    }
  };

  const handleCopyAnimalId = async (e, animalId) => {
    e.stopPropagation();
    if (!animalId) return;

    const text = String(animalId);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAnimalId(text);
      setTimeout(() => setCopiedAnimalId(''), 1500);
    } catch (err) {
      setError('동물 고유번호를 복사하지 못했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !petName.trim() || !desertionNo.trim() || !content.trim()) {
      setError('제목, 반려동물 이름, 동물 고유번호, 내용을 모두 입력해 주세요.');
      return;
    }

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('petName', petName.trim());
    payload.append('desertion_no', desertionNo.trim());
    payload.append('content', content.trim());
    if (imageFile) {
      payload.append('image', imageFile);
    }

    setSubmitting(true);
    setError('');
    try {
      await createReview(accessToken, payload);
      onNavigateReviewList();
    } catch (err) {
      setError('리뷰를 작성하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
      <Navbar
        activePage="review-list"
        onNavigateHome={onNavigateHome}
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviewList}
        onNavigateProfile={onNavigateProfile}
      />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 pt-24">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            입양 후기 작성
          </h1>
          <p className="text-on-surface-variant font-medium">
            당신의 인생 가족이 된 반려동물과의 따뜻한 이야기를 남겨주세요.
          </p>
        </div>

        {(adoptionsLoading || adoptions.length > 0) && (
          <section className="mb-10 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-on-surface font-headline">진행 중인 입양</h2>
                <p className="text-sm text-on-surface-variant mt-1">입양 문의와 입양 신청 중인 동물을 선택하면 상세 페이지로 이동합니다.</p>
              </div>
              <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
            </div>

            {adoptionsLoading ? (
              <p className="rounded-xl bg-surface-container-low px-5 py-4 text-sm font-semibold text-on-surface-variant">
                입양 진행 내역을 불러오는 중...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adoptions.map((adoption, index) => {
                  const statusLabel = getAdoptionStatusLabel(adoption);
                  const selectedAnimalId = getAnimalId(adoption);
                  const selectedPetName = getPetName(adoption) || '이름 정보 없음';
                  const address = getAdoptionAddress(adoption);
                  const reviewWritten = Boolean(adoption.reviewWritten);

                  return (
                    <div
                      key={adoption.adoptionId || adoption.applicationId || adoption.id || `${selectedAnimalId}-${index}`}
                      className="cursor-pointer text-left rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 transition-all hover:border-primary/40 hover:bg-primary-container/10 active:scale-[0.99]"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectAdoption(adoption)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectAdoption(adoption);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex rounded-full bg-primary-container/20 px-3 py-1 text-xs font-bold text-primary">
                            {statusLabel}
                          </span>
                          <span className={`ml-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            reviewWritten
                              ? 'bg-surface-container-high text-on-surface-variant'
                              : 'bg-tertiary-fixed/40 text-tertiary'
                          }`}>
                            {reviewWritten ? '리뷰 작성 완료' : '리뷰 작성 가능'}
                          </span>
                          <h3 className="mt-3 text-lg font-extrabold text-on-surface">{selectedPetName}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                            <span>동물 고유번호 {selectedAnimalId || '-'}</span>
                            {selectedAnimalId && (
                              <button
                                className="inline-flex size-7 items-center justify-center rounded-full text-primary transition-all hover:bg-primary-container/20"
                                title="동물 고유번호 복사"
                                type="button"
                                onClick={(e) => handleCopyAnimalId(e, selectedAnimalId)}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {copiedAnimalId === String(selectedAnimalId) ? 'check' : 'content_copy'}
                                </span>
                              </button>
                            )}
                            {copiedAnimalId === String(selectedAnimalId) && (
                              <span className="text-xs font-bold text-primary">복사됨</span>
                            )}
                          </div>
                          <p className="mt-2 flex items-start gap-1 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-base text-tertiary">location_on</span>
                            <span>{address || '주소 정보 없음'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="text-sm font-bold text-primary tracking-wide uppercase" htmlFor="story-title">
              제목
            </label>
            <input
              className="w-full bg-surface-container-lowest border-none rounded-2xl p-6 text-2xl font-semibold placeholder:text-outline focus:ring-2 focus:ring-primary-fixed transition-all outline-none"
              id="story-title"
              placeholder="후기의 제목을 입력하세요"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-primary tracking-wide uppercase" htmlFor="pet-name">
                입양한 반려동물 이름
              </label>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-fixed outline-none"
                id="pet-name"
                placeholder="예: 초코"
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-primary tracking-wide uppercase" htmlFor="animal-id">
                동물 고유번호
              </label>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-fixed outline-none"
                id="animal-id"
                placeholder="예: 12"
                type="text"
                value={desertionNo}
                onChange={(e) => setDesertionNo(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container-high">
            <textarea
              className="w-full p-8 text-lg border-none focus:ring-0 text-on-surface placeholder:text-outline bg-transparent resize-none leading-relaxed"
              id="story-content"
              placeholder="당신의 특별한 후기를 남겨주세요..!"
              rows="14"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-primary tracking-wide uppercase" htmlFor="review-image">
              사진 파일
            </label>
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest p-8 text-center transition-all hover:border-primary/50 hover:bg-primary-container/10"
              htmlFor="review-image"
            >
              <span className="material-symbols-outlined text-4xl text-primary">add_photo_alternate</span>
              <span className="font-bold text-on-surface">
                {imageFile ? imageFile.name : '업로드할 사진을 선택하세요'}
              </span>
              <span className="text-sm text-on-surface-variant">JPG, PNG 등 이미지 파일을 첨부할 수 있습니다.</span>
            </label>
            <input
              accept="image/*"
              className="hidden"
              id="review-image"
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {imageFile && (
              <button
                className="text-sm font-bold text-error hover:underline"
                type="button"
                onClick={() => setImageFile(null)}
              >
                선택한 사진 제거
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-5 bg-error-container rounded-2xl text-on-error-container font-semibold">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div className="flex items-start gap-4 p-5 bg-tertiary-fixed/30 rounded-2xl">
            <span className="material-symbols-outlined text-tertiary">info</span>
            <p className="text-sm text-on-tertiary-fixed-variant leading-relaxed">
              작성하신 스토리는 모든 사용자에게 공개됩니다. 반려동물과 가족의 개인 정보 보호를 위해 상세 주소나 연락처 노출을 자제해 주세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-surface-container-high">
            <button
              className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all"
              type="button"
              onClick={onNavigateReviewList}
            >
              취소
            </button>
            <button
              className="px-10 py-4 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              disabled={submitting}
              type="submit"
            >
              {submitting ? '작성 중...' : '후기 작성'}
            </button>
          </div>
        </form>
      </main>

      <footer className="w-full mt-auto rounded-t-2xl bg-[#edf4ff]">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="text-xl font-bold text-[#091d2e] mb-2 font-headline">All4Animal</div>
            <p className="text-sm text-[#534439]">© 2024 All4Animal. Every pet deserves a story.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#534439]">
            <button className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" type="button">Our Mission</button>
            <button className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" type="button">Success Stories</button>
            <button className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" type="button">Privacy Policy</button>
            <button className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" type="button">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ReviewPostPage;

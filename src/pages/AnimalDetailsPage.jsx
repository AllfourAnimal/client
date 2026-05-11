import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAdoptions } from '../context/AdoptionContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { getAnimalStory } from '../api/animals';
import { useAuth } from '../context/AuthContext';  // getAnimalStory 함수에서 토큰을 사용하기 위해 AuthContext에서 accessToken을 가져옵니다.
import { getAdoptionStatusLabel } from '../adoptionStatus';

const CURRENT_YEAR = new Date().getFullYear();
const HIGH_PERSONALITY_VALUES = new Set(['HIGH', 'VERY_HIGH']);
const PERSONALITY_FEATURES = [
  { key: 'people_friendly', label: '사람을 좋아함' },
  { key: 'active_playful', label: '밝고 활기참' },
  { key: 'calm_quiet', label: '차분하고 편안함' },
  { key: 'adaptable', label: '새로운 환경에 잘 적응' },
  { key: 'outdoor_activity', label: '운동과 활동을 좋아함' },
  { key: 'animal_friendly', label: '다른 동물과 잘 지냄' },
  { key: 'beginner_possible', label: '초보 보호자도 함께 가능' },
  { key: 'family_friendly', label: '가족과 함께 지내기 좋음' },
  { key: 'slow_bonding_ok', label: '기다려주면 다가옴' },
];

function getValue(animal, keys) {
  return keys.map((key) => animal?.[key]).find((value) => value !== undefined && value !== null && value !== '');
}

function getAgeLabel(value) {
  if (!value) return '';
  const year = Number(value);
  if (!Number.isNaN(year) && year > 1900) {
    const age = CURRENT_YEAR - year;
    return age >= 1 ? `${age}살` : '1살 미만';
  }
  return String(value);
}

function getSexLabel(sex) {
  if (!sex) return '';
  const value = String(sex).toUpperCase();
  if (value === 'MALE' || value === 'M') return '수컷';
  if (value === 'FEMALE' || value === 'F') return '암컷';
  return String(sex);
}

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPersonalityTags(animal) {
  return PERSONALITY_FEATURES
    .filter(({ key }) => HIGH_PERSONALITY_VALUES.has(String(animal?.[key] || '').toUpperCase()))
    .map(({ label }) => label);
}

function getStoryText(storyData) {
  if (!storyData) return '';
  if (typeof storyData === 'string') return storyData;
  return getValue(storyData, ['story', 'description', 'animalStory']) || '';  // 다양한 API 응답 형태에 대응하기 위해 여러 키를 시도해서 스토리 텍스트를 추출하는 방식, 아마 없어도 될 듯.
}

function getCertificateStatus(adoption) {
  if (!adoption) return 'idle';

  const status = String(adoption.status || '').toUpperCase();
  if (status === 'COMPLETED' || status === 'APPROVED') return 'approved';
  if (adoption.proofImageKey || adoption.proofImageUrl) return 'pending';
  if (['PENDING', 'SUBMITTED', 'REVIEWING', 'PROOF_SUBMITTED'].includes(status)) return 'pending';

  return 'idle';
}

function InfoPill({ icon, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-base font-semibold">
      <span className="material-symbols-outlined text-xl leading-none">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function QuickInfo({ icon, label, value, className = '', valueClassName = '' }) {
  return (
    <div className={`p-4 rounded-xl bg-surface-container flex flex-col items-center justify-center text-center min-h-[120px] ${className}`}>
      <span className="material-symbols-outlined text-primary text-3xl mb-2">{icon}</span>
      <span className="text-on-surface-variant text-sm font-medium">{label}</span>
      <span className={`text-on-surface font-bold text-lg min-h-7 ${valueClassName}`}>{value || ''}</span>
    </div>
  );
}

function ShelterInfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-4 rounded-xl bg-surface-container-low p-4">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-bold text-on-surface-variant">{label}</div>
        <div className="mt-1 break-words text-base font-extrabold text-on-surface">{value || '정보 없음'}</div>
      </div>
    </div>
  );
}

function AnimalDetailsPage({
  animalId,
  onNavigateHome,
  onNavigateAnimalList,
  onNavigateReviews,
  onNavigateProfile,
}) {
  const [animalStory, setAnimalStory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showAdoptionConfirmModal, setShowAdoptionConfirmModal] = useState(false);
  const [showNeedInquiryModal, setShowNeedInquiryModal] = useState(false);
  const [adoptionInquirySubmitting, setAdoptionInquirySubmitting] = useState(false);
  const [adoptionInquiryError, setAdoptionInquiryError] = useState('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateSubmitting, setCertificateSubmitting] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!animalId || !accessToken) {
      setAnimalStory(null);
      return;
    }

    const loadAnimalStory = async () => {
      try {
        const storyData = await getAnimalStory(animalId, accessToken);
        setAnimalStory(getStoryText(storyData));
      } catch (error) {
        console.error('동물 스토리 불러오기 실패:', error);
        setAnimalStory('');
      }
    };

    loadAnimalStory();
  }, [animalId, accessToken]);

  useEffect(() => {
    setCertificateFile(null);
    setCertificateError('');
    setCurrentImageIndex(0);
  }, [animalId]);

  const { getAnimal, imagesByAnimalId, allImagesByAnimalId } = useAnimals();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { getAdoptionForAnimal, hasAdoptionForAnimal, registerAdoptionInquiry, submitCertificate } = useAdoptions();
  const animal = getAnimal(animalId);

  // animal 원본 데이터를 상세 페이지에서 사용하기 편한 형태로 가공
  // 다양한 API 응답 형태에 대응하기 위해 여러 키를 시도해서 값을 추출하는 방식으로 구현
  // useMemo을 사용해서 animal 또는 story가 변경될 때만 재계산하도록 최적화
  const details = useMemo(() => {
    if (!animal) return null;

    const species = getValue(animal, ['species', 'speices']);
    const id = animal.animalId;
    const name = getValue(animal, ['name', 'animalName', 'animal_name']) || species || id;
    const age = getAgeLabel(getValue(animal, ['animal_age', 'animalAge', 'age']));
    const sex = getSexLabel(getValue(animal, ['animal_sex', 'animalSex', 'animlSex', 'sex', 'gender']));
    const isVaccinated = (animal.vaccinated ? '접종완료' : '미접종');
    const happenedPlace = getValue(animal, ['happenedPlace', 'happendPlace', 'happenPlace', 'happened_place', 'happen_place', 'careAddr', 'careAddress', 'address']);
    const careNm = getValue(animal, ['careNm', 'careName', 'care_nm', 'shelterName']);
    const careTel = getValue(animal, ['careTel', 'care_tel', 'shelterTel', 'tel']);
    const careAddr = getValue(animal, ['careAddr', 'careAddress', 'care_addr', 'shelterAddress', 'address']);
    const story = animalStory;
    const personality = getValue(animal, ['personality', 'character', 'temperament']); 
    const personalityTags = getPersonalityTags(animal);
    const healthNotes = toList(getValue(animal, ['healthNotes', 'health_notes', 'health', 'notice']));

    return {
      id,
      name,
      species,
      age,
      sex,
      personality,
      isVaccinated,
      happenedPlace,
      careNm,
      careTel,
      careAddr,
      story,
      personalityTags,
      healthNotes,
      weight: `${animal.weight}kg`,
      vaccination: getValue(animal, ['vaccination', 'vaccinationStatus', 'vaccination_status']),
    };
  }, [animal, animalStory]);

  const allImages = animal ? (allImagesByAnimalId[animal.animalId] ?? []) : [];
  const fallbackSrc = animal ? imagesByAnimalId[animal.animalId] ?? animal.thumbnailImageUrl : null;
  const imageSrc = allImages.length > 0 ? allImages[currentImageIndex]?.imageUrl ?? fallbackSrc : fallbackSrc;

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);
  const isFavorited = animal ? favoriteIds.has(Number(animal.animalId)) : false;
  const adoptionInquiryRegistered = animal
    ? hasAdoptionForAnimal(animal.animalId)
    : false;
  const currentAdoption = animal ? getAdoptionForAnimal(animal.animalId) : null;
  const adoptionStatus = getAdoptionStatusLabel(animal, currentAdoption);
  const certificateStatus = getCertificateStatus(currentAdoption);
  const certificateSubmitted = certificateStatus !== 'idle';
  const certificateApproved = certificateStatus === 'approved';

  const handleCertificateSubmit = async (event) => {
    event.preventDefault();
    if (!certificateFile || certificateSubmitted || certificateSubmitting || !currentAdoption?.adoptionId) return;

    setCertificateSubmitting(true);
    setCertificateError('');

    try {
      await submitCertificate(currentAdoption.adoptionId, certificateFile);
      setCertificateFile(null);
    } catch (error) {
      setCertificateError(error.response?.data?.message || '입양 인증 파일 제출에 실패했습니다.');
    } finally {
      setCertificateSubmitting(false);
    }
  };

  const handleAdoptionInquiryConfirm = async () => {
    if (!accessToken || !animal?.animalId || adoptionInquirySubmitting) return;

    setAdoptionInquirySubmitting(true);
    setAdoptionInquiryError('');

    try {
      await registerAdoptionInquiry(animal.animalId);
      setShowAdoptionConfirmModal(false);
      setShowAdoptionModal(true);
    } catch (error) {
      setAdoptionInquiryError(error.response?.data?.message || '입양 문의 등록에 실패했습니다.');
    } finally {
      setAdoptionInquirySubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container font-body">
      <Navbar
        activePage="animal-list"
        onNavigateHome={onNavigateHome}
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviews}
        onNavigateProfile={onNavigateProfile}
      />

      <main className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 pb-24">
          {!animal ? (
            <div className="text-center py-24">
              <p className="text-error mb-6">동물 정보를 찾을 수 없습니다.</p>
              <button
                type="button"
                onClick={onNavigateAnimalList}
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold"
              >
                목록으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <section className="relative h-[280px] md:h-[440px] w-full overflow-hidden rounded-2xl bg-surface-container-low flex items-center justify-center">
                  {imageSrc ? (
                    <img
                      alt={`${details.name || '동물'} 사진`}
                      className="w-full h-full object-cover"
                      src={imageSrc}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-8xl text-on-surface-variant opacity-20">pets</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent" />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full text-sm md:text-base font-bold text-primary shadow-md">
                    {adoptionStatus}
                  </div>
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        aria-label="이전 사진"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                      >
                        <span className="material-symbols-outlined text-xl leading-none">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        aria-label="다음 사진"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                      >
                        <span className="material-symbols-outlined text-xl leading-none">chevron_right</span>
                      </button>
                      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {allImages.map((img, idx) => (
                          <button
                            key={img.imageUrl}
                            type="button"
                            aria-label={`${idx + 1}번째 사진`}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 w-full px-12 pt-8 pb-10 text-white">
                    <div className="mb-6 flex flex-wrap items-end gap-6">
                      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">
                        {details.name}
                      </h1>
                      <div className="inline-flex items-center px-5 py-2 rounded-full bg-white text-black font-bold text-lg shadow-xl ring-4 ring-white/20">
                        99% 적합
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-wrap gap-4">
                        <InfoPill icon="cake" value={details.age} />
                        <InfoPill icon={details.sex === '수컷' ? 'male' : 'female'} value={details.sex} />
                        <InfoPill icon="auto_awesome" value={details.personality} />
                      </div>
                      {/* <div className="flex min-h-10">
                        {details.adoptType && (
                          <div className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-bold text-base shadow-lg">
                            {details.adoptType}
                          </div>
                        )}
                      </div> */}
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickInfo icon="vaccines" label="접종 상태" value={details.isVaccinated} />
                  <QuickInfo icon="monitor_weight" label="체중" value={details.weight} />
                  <QuickInfo
                    icon="location_on"
                    label="발견 장소"
                    value={details.happenedPlace}
                    className="col-span-2"
                    valueClassName="max-w-full whitespace-nowrap text-sm md:text-base lg:text-lg"
                  />
                </div>

                <section className="bg-surface-container-lowest px-10 pt-8 pb-8 rounded-xl shadow-sm border border-outline-variant/10 min-h-[220px]">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-headline">
                    <span className="w-1.5 h-8 bg-primary-container rounded-full" />
                    {details.name}의 이야기
                  </h2>
                  <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed font-body">
                    {details.story}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="px-6 pt-5 bg-surface-container-high rounded-xl min-h-[190px] md:col-span-2">
                    <h3 className="text-xl font-bold mb-4 text-tertiary font-headline">성격 키워드</h3>
                    <div className="flex flex-wrap gap-3">
                      {(details.personalityTags.length > 0
                        ? details.personalityTags
                        : ['아직 뚜렷한 성향은 없어요']
                      ).map((tag) => (
                        <span
                          key={tag}
                          className="px-4 py-2 bg-surface-container-lowest rounded-full text-on-surface font-semibold shadow-sm"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 관심 등록 버튼과 입양 문의 버튼을 포함한 사이드바 영역 */}
              <div className="lg:col-span-4">
                <div className="sticky top-20 space-y-6 lg:h-[440px]">
                  <div className="h-full bg-surface-container-lowest p-8 rounded-xl shadow-xl border border-outline-variant/10 flex flex-col justify-center">
                    <div className="mt-4 mb-8 text-center">
                      <div className="text-on-surface-variant text-m mb-2 font-bold">공고 번호</div>
                      <div className="text-4xl font-black text-primary">{animal.desertionNo}</div>
                    </div>
                    <div className="mt-4 space-y-5">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(animal.animalId, animal, isFavorited)}
                        className="w-full py-4 bg-secondary-container text-on-secondary-container rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: isFavorited ? '"FILL" 1' : '"FILL" 0' }}
                        >
                          favorite
                        </span>
                        {isFavorited ? '관심 목록에서 제거' : '관심 목록에 추가'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (adoptionInquiryRegistered) setShowAdoptionModal(true);
                          else setShowAdoptionConfirmModal(true);
                        }}
                        className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-95 transition-all ${
                          adoptionInquiryRegistered
                            ? 'bg-primary/80 text-on-primary'
                            : 'bg-primary text-on-primary'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          arrow_forward
                        </span>
                        {adoptionInquiryRegistered ? '문의 정보 보기' : '입양 문의하기'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (certificateApproved) return;
                          if (adoptionInquiryRegistered) setShowCertificateModal(true);
                          else setShowNeedInquiryModal(true);
                        }}
                        disabled={certificateApproved}
                        className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                          certificateApproved
                            ? 'bg-green-200 text-green-900 cursor-default'
                            : certificateSubmitted
                              ? 'bg-gray-300 text-gray-700 cursor-default opacity-60'
                              : 'bg-blue-100 text-black-200 hover:scale-95 transition-all'
                        }`}
                      >
                        {certificateStatus === 'idle' && (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                          >
                            arrow_forward
                          </span>
                        )}
                        {certificateApproved ? '입양 인증 완료' : certificateSubmitted ? '인증 대기 중' : '입양 인증하기'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 입양 문의 진행 확인 모달 */}
      {showAdoptionConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="adoption-confirm-title"
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant/20"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="adoption-confirm-title" className="font-headline text-2xl font-extrabold text-on-surface">
                입양 문의를 진행할까요?
              </h2>
              <button
                type="button"
                onClick={() => setShowAdoptionConfirmModal(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                aria-label="입양 문의 확인 팝업 닫기"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm leading-relaxed text-on-surface-variant">
              예를 누르면 이 동물이 로그인한 유저의 문의 동물로 등록되고, 보호소 문의 정보를 확인할 수 있습니다.
            </p>

            {adoptionInquiryError && (
              <div className="mt-5 rounded-xl bg-error-container p-4 text-sm font-semibold text-on-error-container">
                {adoptionInquiryError}
              </div>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdoptionConfirmModal(false)}
                disabled={adoptionInquirySubmitting}
                className="flex-1 rounded-full bg-surface-container py-3 font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={handleAdoptionInquiryConfirm}
                disabled={adoptionInquirySubmitting}
                className="flex-1 rounded-full bg-primary py-3 font-bold text-on-primary transition-all hover:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adoptionInquirySubmitting ? '등록 중' : '예'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 입양 인증 전 문의 필요 안내 모달 */}
      {showNeedInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="need-inquiry-title"
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant/20"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="need-inquiry-title" className="font-headline text-2xl font-extrabold text-on-surface">
                문의 등록이 필요합니다
              </h2>
              <button
                type="button"
                onClick={() => setShowNeedInquiryModal(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                aria-label="문의 필요 안내 팝업 닫기"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm leading-relaxed text-on-surface-variant">
              입양 인증은 먼저 입양 문의를 등록한 동물에 대해서만 진행할 수 있습니다.
              입양 문의를 먼저 등록한 뒤 인증 서류를 제출해 주세요.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowNeedInquiryModal(false)}
                className="flex-1 rounded-full bg-surface-container py-3 font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNeedInquiryModal(false);
                  setShowAdoptionConfirmModal(true);
                }}
                className="flex-1 rounded-full bg-primary py-3 font-bold text-on-primary transition-all hover:scale-95"
              >
                문의 등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 입양문의 모달 */}
      {showAdoptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="adoption-contact-title"
            className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant/20"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 id="adoption-contact-title" className="font-headline text-2xl font-extrabold text-on-surface">
                  보호소 정보
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAdoptionModal(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                aria-label="입양 문의 팝업 닫기"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <ShelterInfoRow icon="home_work" label="보호소 이름" value={details?.careNm} />
              <ShelterInfoRow icon="call" label="보호소 전화번호" value={details?.careTel} />
              <ShelterInfoRow icon="location_on" label="보호소 주소" value={details?.careAddr} />
            </div>

            <div className="mt-6 rounded-xl bg-primary-container/10 p-5 text-sm leading-relaxed text-on-surface-variant">
              <h3 className="mb-2 font-bold text-on-surface">입양 안내</h3>
              <p>
                보호소에 연락해 공고 번호와 동물 정보를 함께 전달해 주세요. 방문 전 입양 가능 여부,
                상담 가능 시간, 준비 서류를 확인하면 절차를 더 원활하게 진행할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 입양 인증 모달 */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="adoption-certificate-title"
            className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant/20"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="adoption-certificate-title" className="font-headline text-2xl font-extrabold text-on-surface">
                입양 인증하기
              </h2>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                aria-label="입양 인증 팝업 닫기"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCertificateSubmit}>
              <label
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  certificateSubmitted
                    ? 'cursor-not-allowed border-outline-variant/20 bg-surface-container text-on-surface-variant opacity-70'
                    : 'border-outline-variant/40 bg-surface-container-low hover:border-green-500/50 hover:bg-green-50'
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-green-700">
                  upload_file
                </span>
                <span className="font-bold text-on-surface">
                  {certificateFile
                    ? certificateFile.name
                    : certificateSubmitted
                      ? '제출된 인증 파일이 있습니다'
                      : '입양 증명서 사진 첨부'}
                </span>
                {!certificateSubmitted && (
                  <span className="text-sm text-on-surface-variant">
                    인증에 사용할 이미지 파일을 선택해 주세요.
                  </span>
                )}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  disabled={certificateSubmitted}
                  onChange={(event) => {
                    setCertificateError('');
                    setCertificateFile(event.target.files?.[0] ?? null);
                  }}
                />
              </label>

              {certificateSubmitted && (
                <div className="mt-5 rounded-xl bg-primary-container/15 p-4 text-sm font-semibold text-on-primary-container border border-primary-container/30">
                  제출이 접수되었습니다. 관리자가 인증 서류를 검토할 예정입니다.
                </div>
              )}

              {certificateError && (
                <div className="mt-5 rounded-xl bg-error-container p-4 text-sm font-semibold text-on-error-container">
                  {certificateError}
                </div>
              )}

              <button
                type="submit"
                disabled={!certificateFile || certificateSubmitted || certificateSubmitting}
                className={`mt-6 w-full rounded-full py-4 text-lg font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  certificateApproved
                    ? 'bg-green-200 text-green-900'
                    : certificateSubmitted
                      ? 'bg-gray-300 text-gray-700 cursor-default'
                      : 'bg-blue-100 text-black-200 hover:scale-95'
                }`}
              >
                {certificateApproved ? '입양 인증 완료' : certificateSubmitted ? '인증 대기 중' : certificateSubmitting ? '제출 중...' : '제출하기'}
              </button>
            </form>
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}

export default AnimalDetailsPage;

import { useEffect, useMemo, useState } from 'react';
import { useAnimals } from '../context/AnimalContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { getAnimalStory } from '../api/animals';
import { useAuth } from '../context/AuthContext';  // getAnimalStory 함수에서 토큰을 사용하기 위해 AuthContext에서 accessToken을 가져옵니다.

const CURRENT_YEAR = new Date().getFullYear();

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

function getStoryText(storyData) {
  if (!storyData) return '';
  if (typeof storyData === 'string') return storyData;
  return getValue(storyData, ['story', 'description', 'animalStory']) || '';  // 다양한 API 응답 형태에 대응하기 위해 여러 키를 시도해서 스토리 텍스트를 추출하는 방식, 아마 없어도 될 듯.
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

function QuickInfo({ icon, label, value }) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center min-h-[120px]">
      <span className="material-symbols-outlined text-primary text-3xl mb-2">{icon}</span>
      <span className="text-on-surface-variant text-sm font-medium">{label}</span>
      <span className="text-on-surface font-bold text-lg min-h-7">{value || ''}</span>
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

  const { getAnimal, imagesByAnimalId } = useAnimals();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const animal = getAnimal(animalId);

  // animal 원본 데이터를 상세 페이지에서 사용하기 편한 형태로 가공
  // 다양한 API 응답 형태에 대응하기 위해 여러 키를 시도해서 값을 추출하는 방식으로 구현
  // useMemo을 사용해서 animal 또는 story가 변경될 때만 재계산하도록 최적화
  const details = useMemo(() => {
    if (!animal) return null;

    const id = animal.animalId;
    const name = getValue(animal, ['name', 'animalName', 'animal_name']) || id;
    const species = getValue(animal, ['species', 'speices']);
    const age = getAgeLabel(getValue(animal, ['animal_age', 'animalAge', 'age']));
    const sex = getSexLabel(getValue(animal, ['animal_sex', 'animalSex', 'animlSex', 'sex', 'gender']));
    const personality = getValue(animal, ['personality', 'character', 'temperament']);
    const adoptStatus = getValue(animal, ['adoptStatus', 'adopt_status', 'status']) || (animal.adopted ? '입양완료' : '보호중');
    const adoptType = getValue(animal, ['adoptType', 'adopt_type']);
    const story = animalStory;
    const personalityTags = toList(getValue(animal, ['personalityTags', 'personality_tags', 'tags']));
    const healthNotes = toList(getValue(animal, ['healthNotes', 'health_notes', 'health', 'notice']));

    return {
      id,
      name,
      species,
      age,
      sex,
      personality,
      adoptStatus,
      adoptType,
      story,
      personalityTags,
      healthNotes,
      weight: getValue(animal, ['weight', 'animalWeight', 'animal_weight']),
      vaccination: getValue(animal, ['vaccination', 'vaccinationStatus', 'vaccination_status']),
      tempFosterNote: getValue(animal, ['tempFosterNote', 'temp_foster_note']),
    };
  }, [animal, animalStory]);

  const imageSrc = animal ? imagesByAnimalId[animal.animalId] ?? animal.thumbnailImageUrl : null;
  const isFavorited = animal ? favoriteIds.has(Number(animal.animalId)) : false;

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
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                    <div className="inline-block px-5 py-2.5 rounded-full bg-white text-black font-extrabold text-lg mb-6 shadow-xl ring-4 ring-white/20">
                      {details.adoptStatus}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-headline">
                      {details.name}
                    </h1>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-wrap gap-4">
                        <InfoPill icon="pets" value={details.species} />
                        <InfoPill icon="cake" value={details.age} />
                        <InfoPill icon="male" value={details.sex} />
                        <InfoPill icon="auto_awesome" value={details.personality} />
                      </div>
                      <div className="flex min-h-10">
                        {details.adoptType && (
                          <div className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-bold text-base shadow-lg">
                            {details.adoptType}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickInfo icon="calendar_today" label="나이" value={details.age} />
                  <QuickInfo icon="female" label="성별" value={details.sex} />
                  <QuickInfo icon="vaccines" label="접종 상태" value={details.vaccination} />
                  <QuickInfo icon="monitor_weight" label="체중" value={details.weight} />
                </div>

                <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm border border-outline-variant/10 min-h-[220px]">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-headline">
                    <span className="w-1.5 h-8 bg-primary-container rounded-full" />
                    {details.name}의 이야기
                  </h2>
                  <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed font-body">
                    {details.story}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-surface-container-high rounded-xl min-h-[190px]">
                    <h3 className="text-xl font-bold mb-4 text-on-surface font-headline">성격 키워드</h3>
                    <div className="flex flex-wrap gap-3">
                      {details.personalityTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-4 py-2 bg-surface-container-lowest rounded-full text-on-surface font-semibold shadow-sm"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 bg-tertiary-container/20 rounded-xl border border-tertiary-container/30 min-h-[190px]">
                    <h3 className="text-xl font-bold mb-4 text-tertiary font-headline">건강 및 주의사항</h3>
                    <ul className="space-y-3">
                      {details.healthNotes.map((note) => (
                        <li key={note} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
                          <span className="text-on-surface-variant text-sm">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-40 space-y-6">
                  <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xl border border-outline-variant/10">
                    <div className="mb-8 text-center">
                      <div className="text-on-surface-variant text-sm mb-2 font-medium">입양 희망번호</div>
                      <div className="text-4xl font-black text-primary">#{details.id}</div>
                    </div>
                    <div className="space-y-4">
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
                      <button className="w-full py-4 bg-primary text-on-primary rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-95 transition-all">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          arrow_forward
                        </span>
                        입양 진행
                      </button>
                    </div>
                    <p className="mt-6 text-xs text-center text-on-surface-variant leading-relaxed">
                      입양 절차는 상담, 서류 검토, 대면 면담 순으로 진행됩니다.<br />
                      모든 반려동물은 신중한 결정이 필요합니다.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-[#fff5eb] border border-[#f4a261]/20 flex gap-4 min-h-[108px]">
                    <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface text-sm">임시 보호 가능</div>
                      <p className="text-xs text-on-surface-variant mt-1">{details.tempFosterNote || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default AnimalDetailsPage;

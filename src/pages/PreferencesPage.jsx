import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { savePreferences } from '../api/preferences';

const ANIMAL_TYPES = [
  { value: 'DOG', label: '강아지', desc: '충성스럽고 활기찬 친구', icon: 'cruelty_free' },
  { value: 'CAT', label: '고양이', desc: '우아하고 독립적인 친구', icon: 'pets' },
  { value: 'ANY', label: '상관없음', desc: '모든 동물을 사랑해요', icon: 'all_inclusive' },
];

const SIZES = [
  { value: 'SMALL', label: '소형' },
  { value: 'MEDIUM', label: '중형' },
  { value: 'LARGE', label: '대형' },
  { value: 'ANY', label: '상관없음' },
];

const GENDERS = [
  { value: 'M', label: '수컷', icon: 'male', color: 'text-blue-500' },
  { value: 'F', label: '암컷', icon: 'female', color: 'text-rose-400' },
  { value: 'ANY', label: '상관없음', icon: 'balance', color: 'text-on-surface-variant' },
];

const AGES = [
  { value: 'YOUNG', label: '어린 개체', icon: 'child_care' },
  { value: 'ADULT', label: '성체', icon: 'pets' },
  { value: 'OLD', label: '노령 개체', icon: 'elderly_woman' },
  { value: 'ANY', label: '상관없음', icon: 'all_inclusive' },
];

const PERSONALITIES = [
  '사람을 좋아함',
  '밝고 활기참',
  '차분하고 편안함',
  '새로운 환경에 적응 잘',
  '운동과 활동을 좋아함',
  '다른 동물과 잘 지냄',
  '반려동물 경험이 없는 보호자도 함께할 수 있음',
  '가족과 함께 지내기 좋음',
  '기다려주면 다가옴',
];

function SurveySection({ number, title, badge, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
          {number}
        </span>
        <h2 className="text-2xl font-bold font-headline">
          {title}
          {badge && <span className="text-primary text-sm font-normal ml-2">{badge}</span>}
        </h2>
      </div>
      {children}
    </section>
  );
}

function PreferencesPage({ onNavigateHome }) {
  const { accessToken, markSurveyComplete } = useAuth();
  const [animalType, setAnimalType] = useState('DOG');
  const [size, setSize] = useState('SMALL');
  const [gender, setGender] = useState('M');
  const [age, setAge] = useState('YOUNG');
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePersonality = (p) => {
    setPersonalities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await savePreferences(accessToken, { animalType, size, gender, age, personalities });
      markSurveyComplete();
      onNavigateHome();
    } catch {
      setError('선호 정보 저장에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    markSurveyComplete();
    onNavigateHome();
  };

  const radioClass = (selected) =>
    `ring-2 transition-all ${selected ? 'ring-primary bg-surface-container-lowest' : 'ring-transparent'}`;

  return (
    <div className="bg-surface-bright text-on-background font-body selection:bg-primary-container selection:text-on-primary-container">
      <main className="pt-16 pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          <header className="text-center mb-16 relative">
            <div
              className="absolute -top-12 -left-12 w-64 h-64 bg-primary-fixed opacity-20 blur-3xl z-0"
              style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
            />
            <div className="relative z-10">
              <h1 className="text-5xl md:text-[3.5rem] font-extrabold tracking-tight text-on-background mb-6 leading-tight font-headline">
                나에게 꼭 맞는 <span className="text-primary">가족 찾기</span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-medium">
                당신이 선호하는 반려동물의 특징을 알려주세요.<br className="hidden md:block" />
                정교한 알고리즘을 통해 최고의 인연을 추천해 드립니다.
              </p>
            </div>
          </header>

          <form className="space-y-12" onSubmit={handleSubmit}>

            {/* Section 1: 동물 종류 */}
            <SurveySection number="1" title="동물 종류" badge="(필수)">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ANIMAL_TYPES.map(({ value, label, desc, icon }) => (
                  <label
                    key={value}
                    className={`group relative flex flex-col p-6 rounded-[1.5rem] bg-surface-container-low cursor-pointer hover:bg-surface-container hover:-translate-y-1 ${radioClass(animalType === value)}`}
                  >
                    <input className="sr-only" type="radio" name="animal_type" value={value} checked={animalType === value} onChange={() => setAnimalType(value)} />
                    <span className="material-symbols-outlined text-4xl mb-4 text-primary">{icon}</span>
                    <span className="text-lg font-bold">{label}</span>
                    <span className="text-sm text-on-surface-variant mt-1">{desc}</span>
                  </label>
                ))}
              </div>
            </SurveySection>

            {/* Section 2: 동물 크기 */}
            <SurveySection number="2" title="동물 크기" badge="(필수)">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SIZES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-4 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container ${radioClass(size === value)}`}
                  >
                    <input className="sr-only" type="radio" name="size" value={value} checked={size === value} onChange={() => setSize(value)} />
                    <span className="font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </SurveySection>

            {/* Section 3 & 4: 성별 + 나이 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <SurveySection number="3" title="동물 성별">
                <div className="flex flex-col gap-3">
                  {GENDERS.map(({ value, label, icon, color }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-surface-container-low cursor-pointer ${radioClass(gender === value)}`}
                    >
                      <input className="sr-only" type="radio" name="gender" value={value} checked={gender === value} onChange={() => setGender(value)} />
                      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                      <span className="font-bold">{label}</span>
                    </label>
                  ))}
                </div>
              </SurveySection>

              <SurveySection number="4" title="동물 나이">
                <div className="flex flex-col gap-3">
                  {AGES.map(({ value, label, icon }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-4 p-4 rounded-xl bg-surface-container-low cursor-pointer ${radioClass(age === value)}`}
                    >
                      <input className="sr-only" type="radio" name="age" value={value} checked={age === value} onChange={() => setAge(value)} />
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                      <span className="font-bold">{label}</span>
                    </label>
                  ))}
                </div>
              </SurveySection>
            </div>

            {/* Section 5: 성격 */}
            <SurveySection number="5" title="동물 성격" badge="(다중 선택 가능)">
              <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10">
                <div className="flex flex-wrap gap-3">
                  {PERSONALITIES.map((p) => {
                    const selected = personalities.includes(p);
                    return (
                      <label
                        key={p}
                        className={`inline-flex items-center px-5 py-2.5 rounded-full cursor-pointer transition-all border font-medium text-sm ${
                          selected
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:bg-primary-fixed hover:text-on-primary-fixed-variant'
                        }`}
                      >
                        <input className="sr-only" type="checkbox" checked={selected} onChange={() => togglePersonality(p)} />
                        {p}
                      </label>
                    );
                  })}
                </div>
              </div>
            </SurveySection>

            {error && <p className="text-center text-error text-sm">{error}</p>}

            <div className="pt-8 text-center flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-12 py-6 rounded-full bg-primary text-on-primary text-xl font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 gap-3 group disabled:opacity-50 disabled:scale-100"
              >
                <span>{loading ? '저장 중...' : '설문 완료하기'}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors"
              >
                건너뛰기
              </button>
              <p className="text-on-surface-variant text-sm font-medium">데이터 분석을 위해 약 10초 정도 소요될 수 있습니다.</p>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export default PreferencesPage;

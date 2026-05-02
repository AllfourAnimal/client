import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { ANIMAL_DETAILS, DEFAULT_ANIMAL_NAME } from '../data/animalDetails';

function AnimalDetailsPage({
  animalName,
  onNavigateHome,
  onNavigateAnimalList,
  onNavigateReviews,
  onNavigateProfile,
}) {
  const name = (animalName && ANIMAL_DETAILS[animalName]) ? animalName : DEFAULT_ANIMAL_NAME;
  const animal = ANIMAL_DETAILS[name];

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container font-body">

      <Navbar
        activePage="animal-list"
        onNavigateHome={onNavigateHome}
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviews}
        onNavigateProfile={onNavigateProfile}
      />

      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* 좌측 컬럼 */}
            <div className="lg:col-span-8 space-y-8">

              {/* Hero */}
              <section className="relative h-[280px] md:h-[440px] w-full overflow-hidden rounded-xl">
                <img
                  alt={`${name} 사진`}
                  className="w-full h-full object-cover"
                  src={animal.src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                  <div className="inline-block px-5 py-2.5 rounded-full bg-white text-black font-extrabold text-lg mb-6 shadow-xl ring-4 ring-white/20 animate-pulse">
                    {animal.matchPercent}% Match
                  </div>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-headline">
                    {name}
                  </h1>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-base font-semibold">
                        <span className="material-symbols-outlined text-xl leading-none">pets</span>
                        <span>{animal.breed}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-base font-semibold">
                        <span className="material-symbols-outlined text-xl leading-none">cake</span>
                        <span>{animal.age}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-base font-semibold">
                        <span className="material-symbols-outlined text-xl leading-none">female</span>
                        <span>{animal.gender}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-base font-semibold">
                        <span className="material-symbols-outlined text-xl leading-none">auto_awesome</span>
                        <span>{animal.personality}</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-bold text-base shadow-lg">
                        {animal.adoptType}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Info Bento */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {animal.quickInfo.map((info) => (
                  <div
                    key={info.label}
                    className="p-4 rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center"
                  >
                    <span className="material-symbols-outlined text-primary text-3xl mb-2">{info.icon}</span>
                    <span className="text-on-surface-variant text-sm font-medium">{info.label}</span>
                    <span className="text-on-surface font-bold text-lg">{info.value}</span>
                  </div>
                ))}
              </div>

              {/* 이야기 */}
              <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm border border-outline-variant/10">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-headline">
                  <span className="w-1.5 h-8 bg-primary-container rounded-full" />
                  {name}의 이야기
                </h2>
                <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                  {animal.story.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>

              {/* 성격 & 건강 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-surface-container-high rounded-xl">
                  <h3 className="text-xl font-bold mb-4 text-on-surface font-headline">성격 키워드</h3>
                  <div className="flex flex-wrap gap-3">
                    {animal.personalityTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-surface-container-lowest rounded-full text-on-surface font-semibold shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-8 bg-tertiary-container/20 rounded-xl border border-tertiary-container/30">
                  <h3 className="text-xl font-bold mb-4 text-tertiary font-headline">건강 및 주의사항</h3>
                  <ul className="space-y-3">
                    {animal.healthNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-tertiary text-lg">{note.icon}</span>
                        <span className="text-on-surface-variant text-sm">{note.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* 우측 컬럼 - Sticky */}
            <div className="lg:col-span-4">
              <div className="sticky top-40 space-y-6">

                {/* Action Card */}
                <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xl border border-outline-variant/10">
                  <div className="mb-8 text-center">
                    <div className="text-on-surface-variant text-sm mb-2 font-medium">동물 고유번호</div>
                    <div className="text-4xl font-black text-primary">{animal.code}</div>
                  </div>
                  <div className="space-y-4">
                    <button className="w-full py-4 bg-secondary-container text-on-secondary-container rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        favorite
                      </span>
                      관심 목록에 추가
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

                {/* 임시 보호 안내 */}
                <div className="p-6 rounded-xl bg-[#fff5eb] border border-[#f4a261]/20 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface text-sm">임시 보호 가능</div>
                    <p className="text-xs text-on-surface-variant mt-1">{animal.tempFosterNote}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <AppFooter />

    </div>
  );
}

export default AnimalDetailsPage;

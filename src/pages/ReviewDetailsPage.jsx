import Navbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/AppFooter';
import { REVIEW_DETAILS } from '../data/reviewData';

const DEFAULT_ID = 1;

function ReviewDetailsPage({ reviewId, onNavigateHome, onNavigateAnimalList, onNavigateReviewList, onNavigateProfile }) {
  const id = reviewId && REVIEW_DETAILS[reviewId] ? reviewId : DEFAULT_ID;
  const r = REVIEW_DETAILS[id];

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
        {/* Hero Image Gallery */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
          <div className="md:col-span-8 overflow-hidden rounded-2xl relative group">
            <img
              className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
              alt={r.petName}
              src={r.heroMain}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="h-1/2 overflow-hidden rounded-2xl">
              <img className="w-full h-full object-cover" alt={`${r.petName} 사진 1`} src={r.heroSide1} />
            </div>
            <div className="h-1/2 overflow-hidden rounded-2xl">
              <img className="w-full h-full object-cover" alt={`${r.petName} 사진 2`} src={r.heroSide2} />
            </div>
          </div>
        </section>

        {/* Quick Info Bar */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 mb-12 shadow-[0_8px_32px_rgba(9,29,46,0.04)] flex flex-wrap justify-between items-center gap-6">
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-sm font-medium mb-1">이름</span>
            <span className="text-2xl font-extrabold text-primary">{r.petName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-sm font-medium mb-1">공고번호</span>
            <span className="text-lg font-bold text-on-surface">{r.noticeNumber}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-sm font-medium mb-1">구조 위치</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-tertiary text-sm">location_on</span>
              <span className="text-lg font-bold text-on-surface">{r.rescueLocation}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-sm font-medium mb-1">입양 날짜</span>
            <span className="text-lg font-bold text-on-surface">{r.adoptionDate}</span>
          </div>
          <div className="hidden lg:block">
            <div className="bg-primary-container/20 text-on-primary-container px-6 py-3 rounded-full font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">favorite</span>
              입양 완료
            </div>
          </div>
        </section>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight font-headline">
              {r.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-on-surface-variant">
              <span>작성자: {r.author}</span>
              <span className="w-1 h-1 bg-outline-variant rounded-full" />
              <span>{r.date}</span>
            </div>
          </header>

          <div className="space-y-8 text-lg leading-relaxed text-on-surface-variant">
            <p>{r.para1}</p>

            <div className="relative py-8">
              <div className="absolute left-0 top-0 w-2 h-full bg-primary-container rounded-full" />
              <blockquote className="pl-8 italic text-2xl font-medium text-on-surface">
                "{r.blockquote}"
              </blockquote>
            </div>

            <p>{r.para2}</p>

            {/* Inline Image */}
            <div className="relative py-12">
              <div className="bg-surface-container-low rounded-2xl p-10 flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 -mt-20 md:-ml-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                  <img className="w-full h-80 object-cover" alt={r.inlineCaption} src={r.inlineImage} />
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-on-surface mb-4 font-headline">{r.inlineCaption}</h3>
                  <p className="text-base">{r.inlineBody}</p>
                </div>
              </div>
            </div>

            <p>{r.para3}</p>
          </div>

          {/* Back button */}
          <div className="mt-16 pt-12 border-t border-outline-variant/15 flex justify-center">
            <button
              className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-secondary-container/80 transition-all active:scale-95 shadow-md"
              onClick={onNavigateReviewList}
            >
              <span className="material-symbols-outlined">list</span>
              목록으로 돌아가기
            </button>
          </div>
        </article>
      </main>

      <AppFooter />
    </div>
  );
}

export default ReviewDetailsPage;

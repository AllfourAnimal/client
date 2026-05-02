import { useState, Fragment } from 'react';
import Navbar from '../components/layout/Navbar';

const COMPANION_PET = {
  name: 'Louie',
  breed: 'Beagle • Oct 2023',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5C6I8s9srU0ToETCSbFRrv6f3mYUgZ45qwONPlD4BWRnC1vYXyLz75pDAgo2ckFVrduhZ72Nb796CEjPADhDPeVva-uYciyU24j_53ZRtqSSsz-C2aKbroJuK2NdSXCxmjZ_DyktK4v5ytRlPmIa0AhGc9s-BixxYWK4Y6ZwII1F5lZ96gp_3TpM9OL116AHgGFL59y4J3-V03olSuArw3U3WGPDHiMp6VnydzNA6TylGquflbe1PlATOsnR5flQOHVBBquyC3xPh',
};

const INITIAL_PHOTOS = [
  {
    id: 1,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByuhI8JIl5uxGxEbvCIAx6DYsfwuuo7mUY0FTaYVxNEeFqxekR_SUNlZL5DXymQo4vFXfTXlkIotwHKsuWvMa25SV_pwN79NpZ9TbdXJbdOFSP-SRmocQOwGg27lb0tmUPt63hpvm9ZDK7tPE-I_lETn07qNOErBXJS-F8BbHUvI98UnTdagbRkcl6PeDf9k8BSmK0RLFlAApNdiuIZRsqifadslAmN7a6wxKIeml5fmC1QFO31Z46MR2wzIfDtZbIvzwyo_kBOm6G',
    alt: '공원에서 달리는 강아지',
  },
  {
    id: 2,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoT2FaAyC4H-NXoZ2apGHUjlZUIGCUnHw7E-AQye3-VXqwQRPBDw3Jh6dXBanN3S2jKIGpeXx3B0b-OAjUeASYqFKMGjC-Lxo2_vkhsTcDa3Z7pLwVWlf5yYfwv1mZ-GCrdWldwlZaUWW5ElzcTz3YIfyI8bkUkU0u1vwYqmMCqOUpz95MHuQGEPibT35Kcs9OmxpLAIQVpFACBrwMvuAZ6LYARBCJV56zc90z4A1oOrCkdcrwsGGsUcOB1PW9teZZtqCSUSz55YC2',
    alt: '낮잠 자는 강아지',
  },
];

const TOOLBAR_GROUPS = [
  ['format_bold', 'format_italic', 'format_underlined'],
  ['format_list_bulleted', 'format_list_numbered', 'format_quote'],
  ['link', 'mood'],
];

function ReviewPostPage({ onNavigateHome, onNavigateAnimalList, onNavigateReviewList, onNavigateProfile }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);

  const removePhoto = (id) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigateReviewList();
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
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            입양 후기 작성
          </h1>
          <p className="text-on-surface-variant font-medium">
            당신의 인생 가족이 된 반려동물과의 따뜻한 이야기를 남겨주세요.
          </p>
        </div>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* 제목 */}
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

          {/* Companion Pet + Image Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Companion Pet */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-primary tracking-wide uppercase">입양한 반려동물</h3>
              <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                    <img
                      alt={COMPANION_PET.name}
                      className="w-full h-full object-cover"
                      src={COMPANION_PET.image}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-on-surface">{COMPANION_PET.name}</h4>
                    <p className="text-sm text-on-surface-variant">{COMPANION_PET.breed}</p>
                    <button
                      className="mt-2 text-sm font-bold text-tertiary flex items-center gap-1 hover:underline"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      Change Pet
                    </button>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <span
                    className="material-symbols-outlined text-8xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    pets
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-sm font-bold text-primary tracking-wide uppercase">사진 업로드</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 md:col-span-1 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center p-6 bg-surface-container-lowest hover:bg-surface-bright transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-4xl text-primary mb-2 group-hover:scale-110 transition-transform">
                    add_a_photo
                  </span>
                  <p className="text-xs font-bold text-on-surface-variant text-center">
                    사진을 추가하려면 클릭하세요
                  </p>
                </div>
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden relative group shadow-sm">
                    <img alt={photo.alt} className="w-full h-full object-cover" src={photo.src} />
                    <button
                      className="absolute top-2 right-2 bg-inverse-surface/80 text-inverse-on-surface p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container-high">
            <div className="flex flex-wrap gap-1 p-3 bg-surface-container-low border-b border-surface-container-high">
              {TOOLBAR_GROUPS.map((group, gi) => (
                <Fragment key={gi}>
                  {gi > 0 && <div className="w-px h-6 bg-outline-variant mx-1 self-center" />}
                  {group.map((icon) => (
                    <button
                      key={icon}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </Fragment>
              ))}
            </div>
            <textarea
              className="w-full p-8 text-lg border-none focus:ring-0 text-on-surface placeholder:text-outline bg-transparent resize-none leading-relaxed"
              id="story-content"
              placeholder="당신의 특별한 후기를 남겨주세요..!"
              rows="12"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Guidelines */}
          <div className="flex items-start gap-4 p-5 bg-tertiary-fixed/30 rounded-2xl">
            <span className="material-symbols-outlined text-tertiary">info</span>
            <p className="text-sm text-on-tertiary-fixed-variant leading-relaxed">
              <strong className="block mb-1">Community Guidelines Notice</strong>
              작성하신 스토리는 모든 사용자에게 공개됩니다. 반려동물과 가족의 개인 정보 보호를 위해 상세 주소나 연락처 노출을 자제해 주세요. 건강하고 따뜻한 입양 문화 정착을 위해 욕설이나 비방은 금지됩니다.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-surface-container-high">
            <button
              className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all"
              type="button"
              onClick={onNavigateReviewList}
            >
              임시 저장
            </button>
            <button
              className="px-10 py-4 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              type="submit"
            >
              후기 작성
            </button>
          </div>
        </form>
      </main>

      {/* ReviewPostPage 전용 라이트 푸터 */}
      <footer className="w-full mt-auto rounded-t-2xl bg-[#edf4ff]">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="text-xl font-bold text-[#091d2e] mb-2 font-headline">All4Animal</div>
            <p className="text-sm text-[#534439]">© 2024 All4Animal. Every pet deserves a story.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#534439]">
            <a className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" href="#">Our Mission</a>
            <a className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" href="#">Success Stories</a>
            <a className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" href="#">Privacy Policy</a>
            <a className="hover:underline decoration-[#f4a261] underline-offset-4 transition-all" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ReviewPostPage;

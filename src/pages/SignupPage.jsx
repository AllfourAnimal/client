import { useState } from 'react';

function SignupPage({ onNavigateLogin }) {
  const [form, setForm] = useState({
    loginId: '',
    name: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    birthYear: '',
    address: '',
    housingType: '',
    emptyHours: '',
    isExperience: 'yes',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    // TODO: 회원가입 API 연동
  };

  const birthYears = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 15 - i);

  return (
    <div className="bg-surface font-body text-on-surface flex flex-col min-h-screen">

      {/* 본문 */}
      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-on-surface/5 border border-outline-variant/10">

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold font-display text-on-surface mb-2">All4Animal</h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* 아이디 / 이름 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">아이디</label>
                  <input
                    name="loginId"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    value={form.loginId}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">이름</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="성함을 입력하세요"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all"
                  />
                </div>
              </div>

              {/* 비밀번호 / 비밀번호 확인 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">비밀번호</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">비밀번호 확인</label>
                  <input
                    name="passwordConfirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all"
                  />
                </div>
              </div>

              {/* 전화번호 / 출생 연도 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">전화번호</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="01012345678"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">출생 연도</label>
                  <select
                    name="birthYear"
                    value={form.birthYear}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all appearance-none"
                  >
                    <option value="">출생 연도 선택</option>
                    {birthYears.map((year) => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 주소지 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1">주소지</label>
                <div className="relative">
                  <input
                    name="address"
                    type="text"
                    placeholder="OO도 OO시 OO구 OO동"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all"
                  />
                </div>
              </div>

              {/* 주거 형태 / 하루 외출 시간 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">주거 형태</label>
                  <select
                    name="housingType"
                    value={form.housingType}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all appearance-none"
                  >
                    <option value="">주거 형태 선택</option>
                    <option value="APARTMENT_VILLA">아파트/빌라</option>
                    <option value="DETACHED_HOUSE">단독주택</option>
                    <option value="HOUSE_WITH_YARD">마당이 있는 집</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant ml-1">하루 평균 집을 비우는 시간</label>
                  <div className="relative">
                    <input
                      name="emptyHours"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.emptyHours}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl px-5 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright transition-all pr-12"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                      시간
                    </span>
                  </div>
                </div>
              </div>

              {/* 반려동물 사육 경험 */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-on-surface-variant ml-1">반려동물 사육 경험 여부</label>
                <div className="flex p-1 bg-surface-container-low rounded-xl gap-1">
                  {[{ value: 'yes', label: '네, 있습니다' }, { value: 'no', label: '아니오, 없습니다' }].map(({ value, label }) => (
                    <label key={value} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="isExperience"
                        value={value}
                        checked={form.isExperience === value}
                        onChange={handleChange}
                        className="peer hidden"
                      />
                      <div className="w-full text-center py-3 rounded-lg font-bold text-on-surface-variant peer-checked:bg-primary peer-checked:text-on-primary transition-all duration-300">
                        {label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-5 rounded-full text-xl font-bold font-display shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              >
                회원가입
              </button>

              <div className="text-center mt-6">
                <p className="text-on-surface-variant text-sm">
                  이미 계정이 있으신가요?{' '}
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="text-primary font-bold hover:underline ml-2"
                  >
                    로그인하기
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#091d2e] text-[#f4a261] mt-20 p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 max-w-screen-2xl mx-auto">
          <div className="space-y-4">
            <div className="text-[#f7f9ff] font-bold text-3xl font-headline">All4Animal</div>
            <p className="text-slate-400 text-sm max-w-xs">
              반려동물 입양을 혁신하는 All4Animal과 함께 새로운 가족을 만나보세요. 우리의 AI 매칭 시스템이 당신과 완벽한 반려동물을 연결해드립니다.
            </p>
          </div>
          {/* <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest mb-2">Company</span>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Terms of Service</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Privacy Policy</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Contact Us</a>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-white text-sm font-bold uppercase tracking-widest mb-2">Community</span>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Instagram</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Community Forum</a>
              <a className="text-slate-400 text-xs hover:text-[#f4a261] transition-colors" href="#">Stories</a>
            </div>
          </div> */}
        </div>
      </footer>

    </div>
  );
}

export default SignupPage;

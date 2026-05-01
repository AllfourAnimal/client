import { useState } from 'react';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

function LoginPage({ onNavigateHome, onNavigatePreferences, onNavigateSignup }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser({ loginId: id, password });
      login(data.accessToken);  // 로그인 성공 시 context에 토큰 저장
      if (onNavigatePreferences) onNavigatePreferences(); 
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      <div className="layout-container flex h-full grow flex-col items-center justify-center p-6 sm:p-6">
        <div className="w-full max-w-[480px] flex flex-col gap-4">

          {/* 홈 네비게이션 */}
          <div className="flex items-center">
            <button
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200"
              onClick={onNavigateHome}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-semibold uppercase tracking-wider">홈으로</span>
            </button>
          </div>

          {/* 로그인 카드 */}
          <div className="bg-surface-container-lowest rounded-xl p-8 sm:p-12 shadow-[0_8px_32px_rgba(9,29,46,0.04)] border border-outline-variant/15 flex flex-col gap-8">

            {/* 브랜드/헤더 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-14 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span
                  className="material-symbols-outlined text-white text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  pets
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-on-surface font-headline text-3xl font-extrabold tracking-tight">
                  환영합니다!
                </h1>
                <p className="text-on-surface-variant text-base leading-relaxed max-w-[280px] mx-auto">
                  All4Animal에 로그인하여<br />인생의 동반자를 만나보세요.
                </p>
              </div>
            </div>

            {/* 폼 */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface/80 ml-1">
                  아이디
                </label>
                <input
                  type="id"
                  placeholder="all4animal"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright h-14 px-5 text-on-surface placeholder:text-outline transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-semibold text-on-surface/80">
                    비밀번호
                  </label>
                  <a
                    href="#"
                    className="text-xs font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-tight"
                  >
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary-fixed focus:bg-surface-bright h-14 px-5 text-on-surface placeholder:text-outline transition-all duration-300"
                />
              </div>

              {error && (
                <p className="text-sm text-error text-center -mt-2">{error}</p>
              )}

              <div className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold h-14 rounded-full transition-all duration-300 transform active:scale-[0.98] shadow-md shadow-primary/10"
                >
                  로그인
                </button>
                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="text-on-surface-variant text-sm">처음이신가요?</span>
                  <button
                    type="button"
                    onClick={onNavigateSignup}
                    className="text-primary font-bold text-sm hover:underline underline-offset-4 decoration-2"
                  >
                    계정 생성
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 푸터 */}
          {/* <div className="flex justify-center items-center gap-6 text-outline">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2024 All4Animal
            </span>
            <div className="size-1 rounded-full bg-outline-variant/50" />
            <a
              href="#"
              className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-on-surface transition-colors"
            >
              Privacy
            </a>
            <div className="size-1 rounded-full bg-outline-variant/50" />
            <a
              href="#"
              className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-on-surface transition-colors"
            >
              Support
            </a>
          </div> */}

        </div>
      </div>
    </div>
  );
}

export default LoginPage;

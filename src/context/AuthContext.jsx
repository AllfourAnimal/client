import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  // 액세스 토큰을 메모리에만 보관하여 보안 강화
  const [accessToken, setAccessToken] = useState(null);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(
    () => localStorage.getItem('survey_completed') === 'true'
  );

  const login = (token) => setAccessToken(token);
  const logout = () => {
    setAccessToken(null);
    setHasCompletedSurvey(false);
    localStorage.removeItem('survey_completed');
  };
  const isLoggedIn = () => accessToken !== null;
  const markSurveyComplete = () => {  // 설문 완료 상태를 업데이트하고 로컬 스토리지에 저장
    setHasCompletedSurvey(true);
    localStorage.setItem('survey_completed', 'true');
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, isLoggedIn, hasCompletedSurvey, markSurveyComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

// useContext(AuthContext) 를 안전하게 쓰기 위한 wrapper 함수
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx; // contex에 접근 가능한지 검사 후 context 객체 그대로 반환
}

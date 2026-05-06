import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const getSurveyCompletedKey = (loginId) => `survey_completed_${loginId}`;


export function AuthProvider({ children }) {
  // 액세스 토큰을 메모리에만 보관하여 보안 강화
  const [accessToken, setAccessToken] = useState(null);
  const [currentLoginId, setCurrentLoginId] = useState(null);
  const [completedSurvey, setCompletedSurvey] = useState(false);

  const login = (token, loginId) => {
    const nextCompletedSurvey = localStorage.getItem(getSurveyCompletedKey(loginId)) === 'true';
    setAccessToken(token);
    setCurrentLoginId(loginId);
    setCompletedSurvey(nextCompletedSurvey);
    return nextCompletedSurvey;
  };
  const logout = () => {
    setAccessToken(null);
    setCurrentLoginId(null);
    setCompletedSurvey(false);
  };
  const isLoggedIn = () => accessToken !== null;
  const markSurveyComplete = () => {  // 설문 완료 상태를 업데이트하고 로컬 스토리지에 저장
    setCompletedSurvey(true);
    if (currentLoginId) {
      localStorage.setItem(getSurveyCompletedKey(currentLoginId), 'true');
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, isLoggedIn, completedSurvey, hasCompletedSurvey: completedSurvey, markSurveyComplete }}>
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

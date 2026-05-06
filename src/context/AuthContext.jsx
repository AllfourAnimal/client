import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = 'access_token';
const LOGIN_ID_KEY = 'login_id';
const USERNAME_KEY = 'username';
const getSurveyCompletedKey = (loginId) => `survey_completed_${loginId}`;

const getSessionValue = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSessionValue = (key, value) => {
  if (value == null) return;

  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Session storage can be unavailable in restricted browser modes.
  }
};

const removeSessionValue = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Session storage can be unavailable in restricted browser modes.
  }
};

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => getSessionValue(ACCESS_TOKEN_KEY)
  );
  const [currentLoginId, setCurrentLoginId] = useState(
    () => getSessionValue(LOGIN_ID_KEY)
  );
  const [username, setUsername] = useState(
    () => getSessionValue(USERNAME_KEY)
  );
  const [completedSurvey, setCompletedSurvey] = useState(() => {
    const savedLoginId = getSessionValue(LOGIN_ID_KEY);
    return savedLoginId
      ? localStorage.getItem(getSurveyCompletedKey(savedLoginId)) === 'true'
      : false;
  });

  const login = (token, loginId, nextUsername) => {
    const nextCompletedSurvey = localStorage.getItem(getSurveyCompletedKey(loginId)) === 'true';

    setSessionValue(ACCESS_TOKEN_KEY, token);
    setSessionValue(LOGIN_ID_KEY, loginId);
    setSessionValue(USERNAME_KEY, nextUsername);
    setAccessToken(token);
    setCurrentLoginId(loginId);
    setUsername(nextUsername);
    setCompletedSurvey(nextCompletedSurvey);

    return nextCompletedSurvey;
  };

  const logout = () => {
    removeSessionValue(ACCESS_TOKEN_KEY);
    removeSessionValue(LOGIN_ID_KEY);
    removeSessionValue(USERNAME_KEY);
    setAccessToken(null);
    setCurrentLoginId(null);
    setUsername(null);
    setCompletedSurvey(false);
  };

  const isLoggedIn = () => Boolean(accessToken);

  const markSurveyComplete = () => {
    setCompletedSurvey(true);
    if (currentLoginId) {
      localStorage.setItem(getSurveyCompletedKey(currentLoginId), 'true');
    }
  };

  
  return (  // 로그인 상태와 관련된 값과 함수를 context로 제공
    <AuthContext.Provider
      value={{
        accessToken,
        login,
        logout,
        isLoggedIn,
        username,
        completedSurvey,
        hasCompletedSurvey: completedSurvey,
        markSurveyComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

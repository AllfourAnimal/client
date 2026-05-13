import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import PreferencesPage from './pages/PreferencesPage';
import AnimalListPage from './pages/AnimalListPage';
import AnimalListAllPage from './pages/AnimalListAllPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';
import FavoritesAllPage from './pages/FavoritesAllPage';
import ReviewListPage from './pages/ReviewListPage';
import ReviewPostPage from './pages/ReviewPostPage';
import ReviewDetailsPage from './pages/ReviewDetailsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={isLoggedIn() ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={isLoggedIn() ? <Navigate to="/" replace /> : <SignupPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
        <Route path="/animals" element={<ProtectedRoute><AnimalListPage /></ProtectedRoute>} />
        <Route path="/animals/all" element={<ProtectedRoute><AnimalListAllPage /></ProtectedRoute>} />
        <Route path="/animals/favorites" element={<ProtectedRoute><FavoritesAllPage /></ProtectedRoute>} />
        <Route path="/animals/:id" element={<ProtectedRoute><AnimalDetailsPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><ReviewListPage /></ProtectedRoute>} />
        <Route path="/reviews/write" element={<ProtectedRoute><ReviewPostPage /></ProtectedRoute>} />
        <Route path="/reviews/:id" element={<ProtectedRoute><ReviewDetailsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isLoggedIn() ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default App;

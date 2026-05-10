import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import PreferencesPage from './pages/PreferencesPage';
import AnimalListPage from './pages/AnimalListPage';
import AnimalListAllPage from './pages/AnimalListAllPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';
import ReviewListPage from './pages/ReviewListPage';
import ReviewDetailsPage from './pages/ReviewDetailsPage';
import ReviewPostPage from './pages/ReviewPostPage';
import FavoritesAllPage from './pages/FavoritesAllPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { isLoggedIn } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => (isLoggedIn() ? 'home' : 'login'));
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const navigate = (page) => setCurrentPage(page);

  const navigateToAnimal = (animalId) => {
    setSelectedAnimalId(animalId ?? null);
    setCurrentPage('animal-details');
  };

  const navigateToReview = (id) => {
    setSelectedReview(id ?? null);
    setCurrentPage('review-details');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPage, selectedAnimalId, selectedReview]);

  if (currentPage === 'signup') {
    return <SignupPage onNavigateLogin={() => navigate('login')} />;
  }

  if (currentPage === 'login' || !isLoggedIn()) {
    return (
      <LoginPage
        onNavigateHome={() => navigate('home')}
        onNavigatePreferences={(completedSurvey) => navigate(completedSurvey ? 'home' : 'preferences')}
        onNavigateSignup={() => navigate('signup')}
      />
    );
  }

  if (currentPage === 'preferences') {
    return <PreferencesPage onNavigateHome={() => navigate('home')} />;
  }

  if (currentPage === 'profile') {
    return (
      <ProfilePage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigateReviews={() => navigate('review-list')}
        onNavigatePreferences={() => navigate('preferences')}
        onNavigateProfile={() => navigate('profile')}
      />
    );
  }

  if (currentPage === 'home') {
    return (
      <HomePage
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigatePreferences={() => navigate('preferences')}
        onNavigateAnimalDetails={navigateToAnimal}
        onNavigateProfile={() => navigate('profile')}
        onNavigateReviews={() => navigate('review-list')}
      />
    );
  }

  if (currentPage === 'animal-list') {
    return (
      <AnimalListPage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalDetails={navigateToAnimal}
        onNavigateReviews={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
        onNavigateAnimalListAll={() => navigate('animal-list-all')}
        onNavigateFavoritesAll={() => navigate('favorites-all')}
      />
    );
  }

  if (currentPage === 'favorites-all') {
    return (
      <FavoritesAllPage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalDetails={navigateToAnimal}
        onNavigateReviews={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
        onNavigateAnimalList={() => navigate('animal-list')}
      />
    );
  }

  if (currentPage === 'animal-list-all') {
    return (
      <AnimalListAllPage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalDetails={navigateToAnimal}
        onNavigateReviews={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
        onNavigateAnimalList={() => navigate('animal-list')}
      />
    );
  }

  if (currentPage === 'review-list') {
    return (
      <ReviewListPage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigateProfile={() => navigate('profile')}
        onNavigateReviewDetails={navigateToReview}
        onNavigateReviewPost={() => navigate('review-post')}
      />
    );
  }

  if (currentPage === 'review-post') {
    return (
      <ReviewPostPage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigateAnimalDetails={navigateToAnimal}
        onNavigateReviewList={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
      />
    );
  }

  if (currentPage === 'review-details') {
    return (
      <ReviewDetailsPage
        reviewId={selectedReview}
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigateReviewList={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
      />
    );
  }

  if (currentPage === 'animal-details') {
    return (
      <AnimalDetailsPage
        animalId={selectedAnimalId}
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigateReviews={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
      />
    );
  }

  return null;
}

export default App;

import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AnimalListPage from './pages/AnimalListPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';
import ReviewListPage from './pages/ReviewListPage';
import ReviewDetailsPage from './pages/ReviewDetailsPage';
import ReviewPostPage from './pages/ReviewPostPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const navigate = (page) => setCurrentPage(page);

  const navigateToAnimal = (name) => {
    setSelectedAnimal(typeof name === 'string' ? name : null);
    setCurrentPage('animal-details');
  };

  const navigateToReview = (id) => {
    setSelectedReview(id ?? null);
    setCurrentPage('review-details');
  };

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
        animalName={selectedAnimal}
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigateReviews={() => navigate('review-list')}
        onNavigateProfile={() => navigate('profile')}
      />
    );
  }

  return (
    <LoginPage
      onNavigateHome={() => navigate('home')}
      onNavigatePreferences={() => navigate('preferences')}
      onNavigateSignup={() => navigate('signup')}
    />
  );
}

export default App;

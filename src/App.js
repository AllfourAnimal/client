import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AnimalListPage from './pages/AnimalListPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const navigate = (page) => setCurrentPage(page);

  if (currentPage === 'home') {
    return (
      <HomePage
        onNavigateAnimalList={() => navigate('animal-list')}
        onNavigatePreferences={() => navigate('preferences')}
        onNavigateAnimalDetails={() => navigate('animal-details')}
        onNavigateProfile={() => navigate('profile')}
        onNavigateReviews={() => navigate('review-list')}
      />
    );
  }

  if (currentPage === 'animal-list') {
    return (
      <AnimalListPage
        onNavigateHome={() => navigate('home')}
        onNavigateAnimalDetails={() => navigate('animal-details')}
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

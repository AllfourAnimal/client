import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

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

  return (
    <LoginPage
      onNavigateHome={() => navigate('home')}
      onNavigatePreferences={() => navigate('preferences')}
      onNavigateSignup={() => navigate('signup')}
    />
  );
}

export default App;

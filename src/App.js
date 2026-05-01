import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AnimalListPage from './pages/AnimalListPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const navigate = (page) => setCurrentPage(page);

  const navigateToAnimal = (name) => {
    setSelectedAnimal(typeof name === 'string' ? name : null);
    setCurrentPage('animal-details');
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

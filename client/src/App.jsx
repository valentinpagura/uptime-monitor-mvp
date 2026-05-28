import { useContext, useState } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('welcome');

  // Si está logueado → Dashboard
  if (user) {
    return <DashboardPage />;
  }

  // Si no está logueado → Welcome o LoginPage
  if (currentPage === 'login') {
    return <LoginPage onBackClick={() => setCurrentPage('welcome')} />;
  }

  return (
    <WelcomePage
      onLoginClick={() => setCurrentPage('login')}
      onRegisterClick={() => setCurrentPage('login')} // Ambos van a LoginPage (hay toggle)
    />
  );
}

export default App;
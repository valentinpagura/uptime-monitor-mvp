import { useContext, useState } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('welcome');

  if (user) {
    return <DashboardPage />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onLoginClick={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onRegisterClick={() => setCurrentPage('register')} />;
  }

  return (
    <WelcomePage
      onLoginClick={() => setCurrentPage('login')}
      onRegisterClick={() => setCurrentPage('register')}
    />
  );
}

export default App;
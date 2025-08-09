import React from 'react';
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  const handleLogin = (credentials: { username: string; password: string }) => {
    // In a real application, you would validate credentials against a backend
    // For demo purposes, accept any non-empty credentials
    if (credentials.username && credentials.password) {
      setUser({ username: credentials.username });
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
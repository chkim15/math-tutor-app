import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import MathProblem from './components/MathProblem';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main className="main-content">
          <MathProblem />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;

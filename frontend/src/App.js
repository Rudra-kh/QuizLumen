import React, { useState } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import Registration from './components/Registration';
import QuizInterface from './components/QuizInterface';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import QuizCreator from './components/QuizCreator';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [view, setView] = useState('quiz'); // 'quiz' or 'create'

  return (
    <div className="App">
      <header className="App-header">
        <h1>Decentralized Quiz dApp</h1>
        <WalletConnect />
      </header>

      <main>
        {/* View Toggle Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setView('quiz')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: view === 'quiz' ? '#DCA278' : '#EBECCC',
              color: view === 'quiz' ? 'white' : '#666',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            📝 Take Quiz
          </button>
          <button
            onClick={() => setView('create')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: view === 'create' ? '#DCA278' : '#EBECCC',
              color: view === 'create' ? 'white' : '#666',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            🎨 Create Quiz
          </button>
        </div>

        <AdminPanel />
        
        {view === 'create' ? (
          <QuizCreator />
        ) : (
          <>
            {!isRegistered ? (
              <Registration onRegistered={setIsRegistered} />
            ) : (
              <QuizInterface />
            )}
          </>
        )}

        <Leaderboard />
      </main>
    </div>
  );
}

export default App;

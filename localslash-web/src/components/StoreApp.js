import React from 'react';

const StoreApp = ({ setCurrentScreen }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Store App</h1>
        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>Coming soon...</p>
        <button 
          onClick={() => setCurrentScreen('welcome')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default StoreApp;
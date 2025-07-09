import React from 'react';
import { User, Store } from 'lucide-react';

const WelcomeScreen = ({ setUserType, setCurrentScreen }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '4rem 1.5rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
          LocalSlash
        </h1>
        <p style={{ color: '#bfdbfe', fontSize: '1.125rem' }}>
          Connect local stores with nearby customers
        </p>
      </div>

      <div style={{
        flex: 1,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '32rem',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>🏪💙👥</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Welcome to LocalSlash
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.125rem', lineHeight: '1.75' }}>
            Whether you're looking for great deals or want to promote your business, we've got you covered!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            style={{
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onClick={() => {
              setUserType('customer');
              setCurrentScreen('customerApp');
            }}
            onMouseOver={(e) => e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
          >
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <User size={32} style={{ color: '#2563eb' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              I'm a Customer
            </h3>
            <p style={{ color: '#4b5563' }}>Find amazing deals near me</p>
          </button>

          <button
            style={{
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onClick={() => {
              setUserType('store');
              setCurrentScreen('storeApp');
            }}
            onMouseOver={(e) => e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
          >
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Store size={32} style={{ color: '#2563eb' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              I'm a Store Owner
            </h3>
            <p style={{ color: '#4b5563' }}>Promote my business & deals</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
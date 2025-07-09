import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import CustomerApp from './components/CustomerApp';
import StoreApp from './components/StoreApp';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userType, setUserType] = useState('');

  const screenProps = {
    currentScreen,
    setCurrentScreen,
    userType,
    setUserType
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen {...screenProps} />;
      case 'customerApp':
        return <CustomerApp {...screenProps} />;
      case 'storeApp':
        return <StoreApp {...screenProps} />;
      default:
        return <WelcomeScreen {...screenProps} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;
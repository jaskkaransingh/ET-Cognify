import { useState, useEffect } from 'react';
import './App.css';
import Debate from './components/Debate';
import { AnimatePresence } from 'framer-motion';
import Loading from './components/Loading';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <div className="app-container">
      <AnimatePresence>
        {isLoading && <Loading />}
      </AnimatePresence>
      
      {!isLoading && <Debate />}
    </div>
  );
}

export default App;

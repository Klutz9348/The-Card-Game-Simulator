import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logos">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="app__logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="app__logo react" alt="React logo" />
          </a>
        </div>
        <h1>The Card Game Simulator</h1>
        <p className="app__tagline">Project scaffold powered by Vite + React + TypeScript</p>
      </header>
    </div>
  );
}

export default App;

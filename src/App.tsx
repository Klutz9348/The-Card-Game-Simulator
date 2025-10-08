import { useEffect } from 'react';
import './App.css';
import { seedExampleState } from './examples/BoardExample';
import { useBoardStore } from './state/useBoardStore';
import { Board } from './ui/Board';

const App = () => {
  const initialize = useBoardStore((state) => state.actions.ensureExampleState);

  useEffect(() => {
    initialize(seedExampleState);
  }, [initialize]);

  return <Board />;
};

export default App;

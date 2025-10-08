import { useEffect } from 'react';
import { Board } from './ui/Board';
import { useGameStore } from './state/useGameStore';
import { seedExampleState } from './examples/BoardExample';

const App = () => {
  const initialize = useGameStore((state) => state.actions.ensureExampleState);

  useEffect(() => {
    initialize(seedExampleState);
  }, [initialize]);

  return <Board />;
};

export default App;

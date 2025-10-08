# The Card Game Simulator

A lightweight React + Vite playground that demonstrates a draggable card table powered by Zustand, dnd-kit and framer-motion.

## Getting started

1. Install dependencies (internet access is required):
   ```bash
   npm install
   ```
2. Run the development playground:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` to interact with the example board. Double-click a card to flip it and drag it between the table and the hand zone.

## Project structure

- `src/state` – Zustand store and shared TypeScript models.
- `src/lib/Table.ts` – snapping helpers used by the board.
- `src/ui` – presentation components that wrap dnd-kit and framer-motion.
- `src/examples/BoardExample.tsx` – demo data that seeds the store during development.

The UI components are written in TypeScript with explicit props so they can be embedded in Storybook or any React host application.

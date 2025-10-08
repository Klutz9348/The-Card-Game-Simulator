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
This project uses [Vite](https://vitejs.dev/) to provide a fast development environment for building a React + TypeScript application.

## Available Scripts

- `npm install` – install dependencies.
- `npm run dev` – start the development server.
- `npm run build` – type-check and build the app for production.
- `npm run preview` – locally preview the production build.
- `npm run lint` – run ESLint over the source code.

## Project Structure

```
.
├── public/           # Static assets served as-is
├── src/              # Application source
├── index.html        # Entry HTML file
├── vite.config.ts    # Vite configuration with @ alias to src/
└── tsconfig*.json    # TypeScript project references and compiler options
```

The React entry point is defined in `src/main.tsx`, which renders the root `App` component. Styles are applied globally from `src/index.css` and component-specific styles live alongside their components.

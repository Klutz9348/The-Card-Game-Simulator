# The Card Game Simulator

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

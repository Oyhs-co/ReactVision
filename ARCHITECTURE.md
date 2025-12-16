# ReactiVision Architecture

This document provides a detailed overview of the ReactiVision application's architecture, technical stack, and development guidelines.

## 1. Project Overview

ReactiVision is a web-based application designed to measure human reaction time with high precision. It offers features like user data collection, device calibration, reaction time tests, and AI-powered analysis of the results. The application is built with a modern technology stack, ensuring a responsive and user-friendly experience.

## 2. Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
- **State Management:** React Hooks (`useState`, `useCallback`, `useEffect`) and [Zustand](https://zustand-demo.pmnd.rs/) for `useCalibrationGate`.
- **Database:** [Supabase](https://supabase.io/) (PostgreSQL)
- **AI:** [Google Gemini](https://gemini.google.com/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Deployment:** Docker, Railway

## 3. Project Structure

The project follows a standard Next.js App Router structure:

```
/src
|-- /app          # Main application pages and layouts
|-- /components   # Reusable React components
|-- /hooks        # Custom React hooks for shared logic
|-- /lib          # Core logic, utilities, and Supabase client
|-- /ai           # AI-related flows and logic
|-- /types        # TypeScript type definitions
```

- **`app/`**: Contains the main page of the application (`page.tsx`) and global styles.
- **`components/`**: Houses all the React components, such as `UserForm`, `Calibration`, `ReactionTest`, and `Results`.
- **`hooks/`**: Includes custom hooks like `useReactionTest` and `useCalibrationGate` to encapsulate and reuse stateful logic.
- **`lib/`**: Contains utility functions, Supabase API calls (`supabase/api.ts`), and the Supabase client configuration.
- **`ai/`**: Manages the AI-powered analysis flows, using Genkit to interact with the Google Gemini API.

## 4. State Management

The application primarily uses React's built-in hooks for state management. For more complex global state, such as the calibration status, it uses Zustand, a small and fast state management library.

- **Local State:** Managed with `useState` and `useReducer` within individual components.
- **Shared Logic:** Encapsulated in custom hooks (e.g., `useReactionTest`).
- **Global State:** The calibration status (`calibrated`, `deviceLatency`, `calibratedMedian`) is managed globally via the `useCalibrationGate` hook, which is powered by Zustand.

## 5. Data Flow

1.  **User Input:** The user provides their data through the `UserForm` component, which is saved to the local storage.
2.  **Calibration:** The `Calibration` component uses the `useReactionTest` hook to measure the user's baseline reaction time and saves the calibration data to the global state.
3.  **Reaction Test:** The `ReactionTest` component also uses the `useReactionTest` hook to conduct the reaction time test.
4.  **Results:** The test results are saved to the Supabase database via the `insertTest` and `insertAttempts` functions in `lib/supabase/api.ts`.
5.  **AI Analysis:** The `Results` component can trigger an AI analysis of the test results by calling the `getAiAnalysis` function, which fetches the analysis from the Supabase database.

## 6. UI Components

The UI is built with a combination of custom components and components from the Shadcn/UI library.

- **`UserForm`**: A collapsible form for collecting user data.
- **`Calibration`**: An interactive component for calibrating the user's reaction time.
- **`ReactionTest`**: The main component for conducting the reaction time test.
- **`Results`**: A table-based component for displaying the test results, with an integrated AI analysis section.

## 7. AI Integration

The AI analysis feature is powered by Google Gemini and managed through Genkit. When a user requests an analysis, the application sends the test data to a Genkit flow, which then interacts with the Gemini API to generate a detailed analysis of the user's performance. The analysis is then saved to the Supabase database and displayed in the `Results` component.

## 8. Development Guidelines

- **Code Style:** Follow the existing code style and formatting, which is enforced by ESLint and Prettier.
- **Component Design:** Components should be small, reusable, and focused on a single responsibility.
- **State Management:** Use local state whenever possible. For shared state, consider creating a custom hook. For global state, use the `useCalibrationGate` store or create a new one if necessary.
- **API Calls:** All Supabase API calls should be placed in `lib/supabase/api.ts`.
- **Documentation:** Keep the in-code documentation (JSDoc) up to date with any changes.

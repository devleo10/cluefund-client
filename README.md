# Cluefund - Smart Mutual Fund Tracker (Client)

[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646cff)](https://vitejs.dev/)

A modern, responsive web application for tracking mutual funds in real-time. This repository contains the frontend code for the Cluefund application.

## Features

- **User Authentication**: Secure login and registration system
- **Mutual Fund Search**: Search and explore thousands of mutual funds
- **Real-time Fund Tracking**: Track fund performance with real-time data
- **Portfolio Management**: Save and organize your mutual fund investments
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React**: Frontend library for building the user interface
- **TypeScript**: For type-safe code
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Next-generation frontend tooling
- **Lucide Icons**: Beautiful, consistent icon set
- **React Router**: Declarative routing for React applications
- **Context API**: State management for global application state

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cluefund.git
   cd cluefund/client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the client directory with the following variables:
   ```
   VITE_BASE_URL=http://your-backend-auth-server/api
   VITE_MF_API_URL=https://api.mfapi.in/mf
   VITE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and visit `http://localhost:5173`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_BASE_URL | Backend API URL | http://localhost:5678/api |
| VITE_MF_API_URL | Mutual Fund API URL | https://api.mfapi.in/mf |
| VITE_ENV | Environment (development/production) | development |

## Project Structure

```
client/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── context/       # React Context providers
│   ├── pages/         # Application pages
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── .env               # Environment variables
├── index.html         # HTML entry point
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Key Components

### Authentication System

The app uses JWT-based authentication with tokens stored in cookies and localStorage for persistence. The `AuthContext` manages user authentication state across the application.

### Fund Data

Mutual fund data is fetched from an external API and displayed in a user-friendly format. The `FundCard` component is used to display fund information in various parts of the application.

### Toast Notifications

The app includes a custom toast notification system through the `ToastContext` that provides feedback to users after important actions.

## Deployment

The client can be built for production using:

```bash
npm run build
# or
yarn build
```

This generates a `dist` directory with optimized static files that can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [MF API](https://www.mfapi.in/) for providing mutual fund data
- [Lucide Icons](https://lucide.dev/) for the beautiful icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Vite](https://vitejs.dev/) for the frontend tooling

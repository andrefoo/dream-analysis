# Dream Analysis Application

A mobile and web application that uses AI to analyze dreams. This project consists of a React Native frontend and a Python-based Flask backend.

## Project Structure

- `src/` - React Native components and services
- `src/services/` - API services for dream analysis
- `server.py` - Flask server with built-in dream analysis functionality

## Prerequisites

- Node.js and npm for the frontend
- Python 3.9+ for the backend
- Expo CLI for React Native development

## Setup

### Backend Setup

1. Install the required Python dependencies:

```bash
pip install flask flask-cors
```

2. Start the Flask server:

```bash
python server.py
```

The backend API will be available at http://localhost:5000.

### Frontend Setup

1. Install Expo CLI globally (if not already installed):

```bash
npm install -g expo-cli
```

2. Install the project dependencies:

```bash
npm install
```

3. Update the API URL in `src/services/dreamAnalysisService.ts` if running on a device or emulator.

4. Start the Expo development server:

```bash
npm start
```

5. Follow the instructions to run on a device, emulator, or web browser.

## How It Works

1. User enters their dream and selects a mood on the frontend
2. The React Native app sends this information to the Flask backend
3. The backend processes the dream using predefined responses and symbols
4. Responses are personalized based on dream content and mood
5. The analysis is returned to the frontend and displayed to the user

## Features

- Beautiful, animated UI with mood-based theming
- Analysis of dream content with symbolism interpretation
- Responsive design that works on mobile and web
- Offline mode with mock data when the server is unavailable

## License

MIT

## Supabase Integration Instructions

To integrate the app with Supabase for dream storage:

1. Create a Supabase account at [supabase.com](https://supabase.com) if you don't have one
2. Create a new project in Supabase
3. In your Supabase project, create a new table called `dreams` with the following structure:

```sql
create table dreams (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  dream_text text not null,
  mood text not null,
  analysis text not null,
  symbols jsonb not null,
  user_id text not null
);
```

4. Update your Supabase URL and anon key in the `src/services/env.ts` file:

```typescript
export const SUPABASE_URL = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

You can find your Supabase URL and anon key in the Supabase dashboard under Settings > API.

## Features
- Record and analyze your dreams
- Save your dreams to a cloud database
- View dream patterns and insights
- Personalized dream interpretations

## Getting Started

[Original README content continues here...]

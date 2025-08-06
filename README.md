# Solvio - [Code:You](https://code-you.org/) Capstone Project

## About

Solvio is a personal finance management application built with React and Supabase. Designed with a mobile first approach and a Bento Style UI, it helps users track their income, expenses, and overall financial health through an intuitive dashboard with visual analytics and charts. The app goal is to automatize to the maximum the process of entering data by the user without the need of linking the app to their bank account. Solvio allows the user to upload a .CSV file provided by their bank institution with their statements. Using different functions depending on the format of the file, it processes the data and returns a standarized format to be stored in the database. Each bank has a different .CSV format, the app currently supports Capital One credit and debit statements, but it is designed to be easily extended to support other banks, that is one of the objetives for future versions. Solvio integrates with Google Gemini API to categorize the transactions automatically, it also allows the user to do it manually.

## Features

- Analyze data that is stored in arrays, objects, and sets, and get relevant information from it to use in the app.
- Visualize data in a user friendly way, using charts and tables.
- Calculate and display data based on current date.
- Interact with a PostgreSQL database on Supabase to store and retrieve information.
- Implement modern interactive UI features (tables, data sorting, charts).
- Project developed using React.

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL database, authentication)
- **AI Integration**: Google Gemini API (2.5 Flash model)
- **CSV Processing**: PapaParse to process .csv files getting an array of objects

## Getting Started

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) account and project.

### Step 1: Clone the Repository

### Step 2: Install Dependencies (Listed in package.json)

```bash
npm install
```

### Step 3: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy the following credentials:
   - Project URL
   - Anon (public) key

### Step 4: Set Up Google Gemini API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Gemini API
4. Create a new API key
Note: Gemini API has a generous free tier, so you can use it for free

### Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

Add the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 6: Set Up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of the database/schema.sql file from the project, then run the script to create the tables.

### Step 7: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Sign In / Providers.
2. Configure your authentication providers, I used email but you can use other providers.

### Step 8: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
Solvio/
├── database/                
│   ├── schema.sql          # Database tables and initial data
├── public/                 # Static assets (layout.png)
├── src/
│   ├── components/         # React components
│   │   ├── accounts/       # Account management components
│   │   ├── home/           # Dashboard and charts components
│   │   └── navbar/         # Navigation components
│   ├── context/            # React context for state management
│   ├── supabase/           # Supabase client configuration
│   └── assets/             # Images and other assets (logo.png)
├── package.json            # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## Special thanks to [Code:You](https://code-you.org/) for this learning experience and all the support throughout the course.

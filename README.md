# Calendar Application

A simple calendar application built with Vue 3, TypeScript, and Pinia for state management. Made as a developer challenge

## Features

### Core Functionality
- **Monthly Calendar View**: Display calendar grid with current month and year
- **Navigation Controls**: Navigate between months with previous/next buttons
- **Month/Year Picker**: Quick selection of any month and year via custom datepicker
- **Today Navigation**: Instant return to current date

### Reminder Management
- **Create Reminders**: Add reminders for any day with time, description, city, and color 
- **Edit Reminders**: Modify existing reminders
- **Delete Reminders**: Remove individual reminders or all reminders for a specific day
- **Reminder Limit**: Maximum of 3 visible reminders per day with overflow handling
- **Color Coding**: Visual organization with customizable reminder colors

### Weather Integration
- **Automatic Weather Fetching**: Weather data retrieved when creating/editing reminders
- **City-based Forecasts**: Weather information based on specified city location up to 16 days in advance
- **Weather Display**: Temperature and weather condition icons shown with reminders

## Technology Stack

### Frontend Framework
- **Vue 3**: JavaScript framework with Composition API and script setup
- **TypeScript**: For Type-safe development
- **Vite**: Fast build tool and development server

### State Management
- **Pinia**: State management for Vue 3

### External APIs
- **Open-Meteo Geocoding API**: Convert city names to coordinates
- **Open-Meteo Forecast API**: Retrieve weather forecast data

### Development Tools
- **Vitest**: Unit testing framework
- **Prettier**: Code formatting
- **vue-tsc**: TypeScript type checking for Vue


## Installation

### Prerequisites
- Node.js (version 16 or higher recommended)
- npm or yarn package manager

### Setup
Clone the repository:
   ```bash
   git clone <https://github.com/lukeiayf/calendar-app.git>
   cd calendar-app
   ```

Install dependencies
  ```bash
   npm install
   ```
Run dev server
  ```bash
    npm run dev
  ```

Run tests
  ```bash
    npm run test
  ```
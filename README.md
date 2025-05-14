# MindMatters – Offline-First Mental Health Journal & SOS App

## Overview
MindMatters is an offline-first, privacy-focused mental health journal designed to help users log their moods and thoughts daily, track mood trends, and provide immediate support during crises. The app is particularly beneficial for individuals in rural areas or developing regions with inconsistent internet access.

## Features
- **Mood & Journal Entry Logging**: Users can log their daily moods and thoughts.
- **Mood Trend Graph**: Visualizations of mood trends over time to help identify patterns and triggers.
- **Guided Breathing/Meditation Exercises**: A collection of exercises to promote mental wellness.
- **Panic Button with SMS Trigger**: A feature that sends a prewritten SMS to trusted contacts in case of distress.
- **Local Data Persistence**: All data is stored locally and synced with a backend service when internet access is available.

## Tech Stack
- **Frontend**: Progressive Web App (PWA) using JavaScript, HTML, and CSS (or React).
- **Local Storage**: IndexedDB or localStorage for offline functionality.
- **Sync**: Optional lightweight backend with Firebase or Supabase for data syncing.
- **SMS SOS**: Utilizes Twilio or device-native SMS links for emergency outreach.
- **Charts**: Chart.js for visualizing mood trends.

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/Phantasm0009/mindmatters-app.git
   ```
2. Navigate to the project directory:
   ```
   cd mindmatters-app
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

## Usage
- Open the app in your browser.
- Log your mood and thoughts daily.
- Access breathing exercises and emergency contacts.
- Use the panic button feature when in distress.

## Contribution
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Inspired by the need for accessible mental health resources.
- Thanks to the open-source community for their invaluable contributions.
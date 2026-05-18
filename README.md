# Analyst's Dugout 🏏

An AI-powered cricket second-screen experience. An autonomous agent watches ball-by-ball live data, detects tactically significant moments, and generates Gemini-powered insight cards.

## 🏗 Project Structure

- `agent/`: Node.js backend that polls cricket data and generates AI insights. Deployed to **Google Cloud Run**.
- `frontend/`: React + Vite PWA for the fan experience. Deployed to **Firebase Hosting**.

## 🚀 Deployment

### Backend (Cloud Run)
1. Build and push the container:
   ```bash
   gcloud builds submit ./agent --tag [IMAGE_URL]
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy cricket-agent --image [IMAGE_URL] --set-env-vars="..."
   ```

### Frontend (Firebase Hosting)
1. Build the React app:
   ```bash
   cd frontend && npm install && npm run build
   ```
2. Deploy:
   ```bash
   npx firebase-tools deploy --only hosting --project [PROJECT_ID]
   ```

## 🛠 Tech Stack
- **AI**: Gemini 1.5 Flash
- **Data**: CricketData.org API
- **Database**: Firebase Firestore & Realtime Database
- **Hosting**: Google Cloud Run & Firebase Hosting

# 🎓 CourseAI — AI-Powered Course Builder

Generate full structured courses on any topic using Gemini AI.

## Project Structure

```
fs_proj/
├── backend/     → Node.js + Express API
└── frontend/    → React + Vite app
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
# Add your Gemini API key to .env
echo "GEMINI_API_KEY=your_key_here" >> .env
npm install
npm run dev     # runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # runs on http://localhost:5173
```

### 3. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or use a cloud URI in `backend/.env`:
```
MONGODB_URI=mongodb+srv://...
```

## Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/courses/generate` | Generate a new course |
| GET    | `/api/courses` | List all courses |
| GET    | `/api/courses/:id` | Get course by ID |
| GET    | `/api/courses/:courseId/lessons/:lessonId/stream` | Stream lesson content (SSE) |
| DELETE | `/api/courses/:id` | Delete a course |

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, react-markdown, react-hot-toast, Lucide React  
**Backend:** Node.js, Express, Mongoose (MongoDB), @google/genai (Gemini)

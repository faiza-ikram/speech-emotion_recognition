# Speech Emotion Recognition

A full-stack AI-powered speech emotion recognition application for Final Year Project.

> **Live Demo:** Frontend on [Vercel](https://vercel.com) · Backend on [Hugging Face Spaces](https://huggingface.co/spaces)

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.10+, SQLAlchemy, SQLite |
| **AI Model** | TensorFlow/Keras CNN trained on RAVDESS/SAVEE datasets |
| **Auth** | JWT (PyJWT + passlib/bcrypt), Google OAuth |
| **Deployment** | Vercel (frontend) + Hugging Face Spaces (backend) |

---

## 📁 Project Structure

```
speech-emotion-recognition/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── auth.py              # JWT auth routes
│   ├── predict.py           # Emotion prediction + feature extraction
│   ├── recordings.py        # Recording history CRUD
│   ├── models.py            # SQLAlchemy ORM models
│   ├── database.py          # DB engine + session
│   ├── best_model.keras     # Trained Keras model ⚠️ required
│   ├── scaler.pkl           # Feature scaler
│   ├── encoder.pkl          # Label encoder
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── app/                 # Next.js App Router pages
    │   ├── page.tsx         # Landing page
    │   ├── signup/          # Sign up
    │   ├── signin/          # Sign in
    │   ├── dashboard/       # Dashboard
    │   ├── record/          # Voice recording
    │   └── upload/          # Audio upload
    ├── components/          # Reusable components
    ├── context/             # Auth context
    └── lib/                 # API client
```

---

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- `best_model.keras`, `scaler.pkl`, `encoder.pkl` in `backend/`

### 1. Backend

```powershell
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
Copy-Item .env.example .env
# Edit SECRET_KEY in .env

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

### 2. Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Copy env file (already pre-configured for local dev)
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id  # Optional, for Google Sign-In

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🤖 AI Model

The model is a CNN trained to recognize 7 emotions from voice:

| Emotion | Description |
|---|---|
| 😊 Happy | Joy, elation |
| 😢 Sad | Sorrow, grief |
| 😠 Angry | Rage, frustration |
| 😨 Fear | Anxiety, terror |
| 🤢 Disgust | Revulsion |
| 😌 Calm | Relaxed, serene |
| 😐 Neutral | No strong emotion |

### Feature Extraction (162 features)
- Zero Crossing Rate (1)
- Chroma STFT (12)
- MFCC (20)
- RMS Energy (1)
- Mel Spectrogram (128)

### Retraining the Model

Open `emotional-classification.ipynb` in the root of the original SER project. Key training steps:

```python
# Data loading (RAVDESS / SAVEE datasets)
# Feature extraction using librosa
# CNN model with Conv1D layers
# Train with EarlyStopping + ReduceLROnPlateau
# Save artifacts:
model.save("best_model.keras")
pickle.dump(scaler, open("scaler.pkl", "wb"))
pickle.dump(encoder, open("encoder.pkl", "wb"))
```

---

## 🔐 Google Sign-In Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or select existing)
3. Configure OAuth consent screen (External, add your email)
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins: `http://localhost:3000` (and your production URL)
6. Add authorized redirect URIs if required
7. Copy the Client ID to:
   - **Backend** `.env`: `GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com`
   - **Frontend** `.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com`

---

## ☁️ Deployment

### Backend — Hugging Face Spaces (Free)

1. Create a new Space at [huggingface.co/spaces](https://huggingface.co/spaces)
   - SDK: **Docker**, Visibility: **Public**
2. Upload all files from `backend/` including model artifacts
3. Your API URL: `https://YOUR_USERNAME-anti-gravity-backend.hf.space`

### Frontend — Vercel (Free)

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Settings:
   - **Framework:** Next.js
   - **Root Directory:** `frontend`
   - **Environment Variable:** `NEXT_PUBLIC_API_URL` = your HF Space URL
4. Deploy ✅

---

## 🔐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login, get JWT token |
| `POST` | `/auth/google` | ❌ | Sign in with Google (ID token) |
| `GET` | `/auth/me` | ✅ | Get current user |
| `POST` | `/predict?source=recorded` | ✅ | Analyze audio emotion |
| `GET` | `/recordings` | ✅ | List user's recordings |
| `GET` | `/recordings/stats` | ✅ | Dashboard stats |
| `DELETE` | `/recordings/{id}` | ✅ | Delete a recording |

---

## 👤 Author

**Speech Emotion Recognition** — Final Year Project  
Built with ❤️ using FastAPI, Next.js, and TensorFlow

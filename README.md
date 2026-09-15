# NoteTube 📚

> **Turn videos into knowledge.**

NoteTube is an AI-powered web application that transforms YouTube educational videos into structured study material — summaries, detailed notes, key concepts, flashcards, a quiz, and PDF/Markdown exports.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 AI Summary | Concise, informative summary of the video |
| 📝 Detailed Notes | Structured notes organised by topic |
| 💡 Key Concepts | Concepts with explanations and examples |
| ✅ Important Points | Bullet-point revision list |
| 🃏 Flashcards | Interactive flip-card revision tool |
| ❓ AI Quiz | MCQ quiz with explanations and score |
| 📄 PDF Export | Professional study document download |
| 🗒️ Markdown Export | Raw `.md` file for any Markdown editor |
| 🌙 Dark Mode | Light/dark mode with persistence |
| 🕘 Recent Notes | Local browser history (localStorage) |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- Framer Motion
- Lucide React
- React Router
- Axios

**Backend**
- Python 3.11+
- FastAPI + Uvicorn
- Pydantic v2
- Groq API (Llama 3.3 70B)
- youtube-transcript-api
- yt-dlp (metadata)
- ReportLab (PDF)

---

## 🏗️ Architecture

```
Frontend (React)  ──axios──▶  FastAPI Backend
                                    │
                          ┌─────────┴──────────┐
                      youtube.py          ai.py
                   (transcript)        (Groq LLM)
                          │                 │
                   transcript.py       pdf.py
                  (clean+chunk)       (export)
```

**Processing pipeline:**
```
YouTube URL
  → Extract Video ID
  → Fetch Metadata (yt-dlp)
  → Get Transcript (youtube-transcript-api)
  → Clean + Chunk Transcript
  → AI Processing (Groq Llama 3.3 70B)
  → Return Structured JSON
  → Display in React UI
```

---

## 📁 Project Structure

```
NoteTube/
├── backend/
│   ├── app/
│   │   ├── core/config.py        # Settings (env vars)
│   │   ├── schemas/video.py      # Pydantic models
│   │   ├── services/
│   │   │   ├── youtube.py        # Video ID + transcript
│   │   │   ├── transcript.py     # Clean + chunk
│   │   │   ├── ai.py             # Groq LLM integration
│   │   │   └── pdf.py            # ReportLab PDF
│   │   ├── routes/video.py       # API endpoints
│   │   └── main.py               # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/           # Reusable UI components
    │   │   └── tabs/             # Tab content components
    │   ├── pages/                # Home, Results, About
    │   ├── services/api.js       # Axios client
    │   ├── hooks/                # useTheme, useLocalNotes
    │   └── utils/                # youtube.js, markdown.js
    └── package.json
```

---

## ⚡ Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key — get one free at [console.groq.com](https://console.groq.com)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### Frontend

```bash
cd frontend
npm install
```

---

## 🔑 Environment Variables

Create `backend/.env` (copy from `.env.example`):

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=4096
GROQ_TEMPERATURE=0.3
CHUNK_WORD_LIMIT=3000
MAX_TRANSCRIPT_WORDS=60000
```

**Never commit `.env` to version control.**

---

## 🚀 Running Locally

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
uvicorn app.main:app --reload
# → http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | App info |
| `POST` | `/api/videos/validate` | Validate YouTube URL |
| `POST` | `/api/videos/process` | Full pipeline (transcript + AI) |
| `POST` | `/api/videos/export/pdf` | Generate PDF download |
| `GET` | `/docs` | Interactive Swagger UI |

**Request example:**
```json
POST /api/videos/process
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

---

## 🔮 How It Works

1. **Paste URL** — Enter any YouTube lecture URL with captions
2. **Extract Transcript** — `youtube-transcript-api` fetches available captions
3. **Clean + Chunk** — Transcript is cleaned and split into manageable segments
4. **AI Processing** — Groq's Llama 3.3 70B generates structured study material
5. **View & Export** — Browse tabs, take the quiz, download PDF or Markdown

---

## 🗺️ Future Improvements

- [ ] Version 3: Database persistence (PostgreSQL)
- [ ] Version 4: User accounts (optional)
- [ ] Version 5: Cloud notes sync
- [ ] Version 6: Multiple AI providers (OpenAI, Gemini)
- [ ] Batch processing (multiple URLs)
- [ ] Custom note templates
- [ ] Language support

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

*Built with ❤️ using React, FastAPI, and Groq.*

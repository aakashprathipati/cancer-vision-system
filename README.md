# Cancer Vision System (Dr.Visio)

An advanced, full-stack medical application for the AI-assisted detection and analysis of cancer from diagnostic imagery. **Dr.Visio** provides a three-panel diagnostic interface combining real-time image analysis, detailed diagnostic reporting, and live AI summaries using the Gemini Vision API.

## Features

- **Three-Panel Diagnostic Interface**: 
  - **Image Viewer**: Displays the medical imagery for examination.
  - **Diagnostic Report**: Shows detailed metrics and analysis results.
  - **AI Live Summary**: Uses advanced Vision APIs (e.g. Groq / Llama) to generate real-time clinical insights and highlights.
- **Deep Learning AI Engine**: 
  - Multi-class cancer detection trained on real medical datasets.
  - Advanced CNN architectures with custom loss functions and preprocessing.
- **Robust Backend**:
  - Django and Django REST Framework for secure API endpoints.
  - PostgreSQL integration for persistent patient and diagnostic records management.
  - Administrative interface for managing clinical data.
- **Dynamic Frontend**:
  - React (Vite) application styled for a premium, clean, medical aesthetic.
  - State-driven UI updates for dynamic interaction during analysis.
- **Dockerized Development**:
  - `docker-compose.yml` for seamless, synchronized local development of backend and frontend.

## Project Structure

- `frontend/` - React application (Vite, React Router, TailwindCSS/Custom CSS).
- `backend/` - Django project containing:
  - `api/` - Patient and diagnostic models, serializers, and views.
  - `ai_engine/` - Model definitions, inference scripts, dataset loading, and training pipelines.
  - `smartvision_api/` - Core Django settings and routing.

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended for full-stack deployment)
- Python 3.9+
- Node.js 18+

### Setup and Running (Docker Compose)

The easiest way to run the entire platform is via Docker Compose:

```bash
docker-compose up --build
```

### Local Development Setup

#### Backend (Django)

1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Apply migrations: `python manage.py migrate`
6. Run the server: `python manage.py runserver`

#### Frontend (React)

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

#### Environment Variables

Create a `.env` file in the `frontend/` directory with the following structure:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## AI Engine

The system uses a custom deep learning pipeline (`backend/ai_engine/`) to process real diagnostic datasets. The `train.py` script facilitates the training of models on multi-class datasets. Inference is integrated into the Django views to provide real-time diagnostic metrics alongside the LLM Vision API insights.

## License

This project is licensed under the MIT License.

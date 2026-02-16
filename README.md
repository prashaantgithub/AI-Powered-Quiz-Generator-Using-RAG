# AI-Powered Adaptive Quiz Generator (HNRS Project)

![Status](https://img.shields.io/badge/status-complete-green)
![Technology](https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20Ollama-blue)

This project is an advanced, offline-first quiz generation system designed for the HNRS curriculum. It leverages a local Large Language Model (LLM) to transform academic documents into high-quality, proctored assessments with persistent history tracking.

---

## ✨ Key Features

-   ✅ **100% Offline AI:** Runs entirely on your local machine using **Ollama**, ensuring data privacy and zero API costs.
-   ✅ **Content-Driven Generation:** Questions are generated strictly from the uploaded document's content, preventing hallucination.
-   ✅ **Multi-Format Support:** Ingests `PDF`, `DOCX`, `PPTX`, and `TXT` files for maximum flexibility.
-   ✅ **Intelligent Question Filtering:** A robust guardrail system prevents repetitive questions and filters out irrelevant metadata.
-   ✅ **Difficulty Bucketing:** Supports `Easy`, `Medium`, and `Hard` questions with both mixed and custom modes.
-   ✅ **Strict Proctoring Mode:** Enforces a secure exam environment by monitoring for tab switching, window blurring, and exiting fullscreen.
-   ✅ **Persistent History:** Automatically saves every attempt with an AI-generated title, detailed scorecards, and performance charts.
-   ✅ **PDF Report Generation:** Exports a comprehensive, tamper-proof PDF report for every completed session.

---

## 🛠️ Technology Stack

| Category  | Technology                                                                                                  |
| :-------- | :---------------------------------------------------------------------------------------------------------- |
| Frontend  | **React.js** (Vite), **TailwindCSS**, **Chart.js**                                                          |
| Backend   | **Python**, **FastAPI**                                                                                     |
| AI Layer  | **LlamaIndex** (for RAG), **Ollama** (for local LLM hosting)                                                  |
| AI Models | `llama3.2:1b` (for generation), `BAAI/bge-small-en-v1.5` (for embeddings)                                   |
| Database  | **SQLite** (via SQLAlchemy)                                                                                 |
| Reporting | **ReportLab** (for PDF generation)                                                                          |

---
## ⚙️ System Architecture Pipeline

The system follows a robust, end-to-end pipeline for processing and generation:
User Upload (PDF, DOCX...)
↓
File Hashing & Storage
↓
Text Extraction & Semantic Indexing (LlamaIndex)
↓
Pre-Quiz Configuration
↓
AI-Powered Titling (Ollama)
↓
One-by-One Question Generation (RAG)
• Context Retrieval & Randomization
• Prompt Engineering & Deduplication
• JSON Repair & Validation
↓
Secure Quiz Environment (Fullscreen & Proctoring)
↓
Submission & Evaluation
↓
Performance Dashboard (Charts & Tables)
↓
History Storage (SQLite)
↓
PDF Report Generation
code
Code
---

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites

-   **Python 3.10+**
-   **Node.js 18+**
-   **Ollama:** Download and install from [ollama.com](https://ollama.com/download).

### 2. AI Model Setup

Open a terminal and pull the required local LLM. This only needs to be done once.
```bash
ollama pull llama3.2:1b
3. Backend Setup
code
Bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
4. Frontend Setup
code
Bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
▶️ How to Run the Application
Start the AI Service: Make sure the Ollama application is running in the background. (Check for the llama icon in your system tray).
Run the Backend: In your backend terminal (with the virtual environment activated):
code
Bash
python -m app.main
The API will be available at http://localhost:8000.
Run the Frontend: In your frontend terminal:
code
Bash
npm run dev

## ⚙️ System Architecture Pipeline

The system follows a robust, end-to-end pipeline for processing and generation:

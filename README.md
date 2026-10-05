# ⚡ OpsPilot AI — Intelligent IT Operations & Support Agent

OpsPilot AI is an AI-powered IT Operations and Support Agent designed to assist users with common IT issues, retrieve relevant troubleshooting information from a knowledge base, and manage IT support tickets through a centralized support workflow.

The project combines Artificial Intelligence, Retrieval-Augmented Generation (RAG), FastAPI, PostgreSQL, and a web-based frontend to create a practical IT support automation system.

---

## 🚀 Project Overview

OpsPilot AI provides an intelligent support interface where users can:

- Ask IT-related questions
- Receive knowledge-base-driven troubleshooting guidance
- Create support tickets
- Automatically categorize IT issues
- Automatically determine issue severity
- View existing support tickets
- Track ticket status
- Update ticket status

The system demonstrates how AI, document retrieval, APIs, and database technologies can be integrated into a practical IT support application.

---

## ✨ Key Features

### 🤖 AI IT Support

Users can describe their IT problem in natural language and receive an AI-generated support response based on the available IT support knowledge base.

Example:
> My VPN is not connecting.

---

### 🔎 Retrieval-Augmented Generation (RAG)

OpsPilot uses a RAG-based architecture to retrieve relevant information from the IT support knowledge base before generating an AI response.

### RAG Process
1. Receive the user's question
2. Generate an embedding for the question
3. Perform vector similarity search
4. Retrieve relevant documents
5. Build the knowledge context
6. Send the context and question to the AI model
7. Generate a structured support response

---

### 📚 IT Support Knowledge Base

The project includes troubleshooting documentation for:
- Email troubleshooting
- Incident management
- Network troubleshooting
- Password reset
- Software installation
- VPN troubleshooting

Knowledge-base files are stored in:
```text
data/knowledge_base/
```

### 🎫 Automated Support Ticket Management

Users can create support tickets for IT issues. Each ticket contains:
- Ticket ID
- Issue description
- Category
- Severity
- Status

Example:
```text
Ticket ID: OPS-A12B34CD
Category: Network
Severity: High
Status: Open
```

### 🏷️ Automatic Issue Categorization

OpsPilot analyzes the user's issue and assigns an appropriate category.

Supported categories:
- IT Support
- Network
- Software
- Security
- Hardware

Example:
> "My VPN is not connecting" $\rightarrow$ **Category: Network**

---

### 🚨 Automatic Severity Detection

OpsPilot determines the severity of an issue based on keywords and the described impact.

Supported severity levels:
- Low
- Medium
- High
- Critical

Example:
> "Production is completely down" $\rightarrow$ **Severity: Critical**

---

### 📊 Support Ticket Dashboard

The application provides a dashboard to view and monitor support tickets including total tickets, open tickets, high-priority tickets, details, and status.

---

### 🔄 Ticket Status Management

Support tickets move through the following stages:
```text
Open
  ↓
In Progress
  ↓
Resolved
```

---

### 🛡️ Security-Aware Support

OpsPilot is designed not to request or expose user passwords. Sensitive configurations like API keys and database credentials are securely stored using environment variables.

---

## 🧠 System Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Web Frontend      │
                    │    HTML / CSS / JS   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   RAG Pipeline  │        │ Ticket System   │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ Embeddings      │        │ PostgreSQL      │
        │ + Retrieval     │        │ Database        │
        └────────┬────────┘        └─────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Knowledge Base  │
        │ + Vector Search │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Google Gemini   │
        │ AI Model        │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ AI Support      │
        │ Response        │
        └─────────────────┘
```

---

## 🛠️ Technology Stack

- **Backend:** Python, FastAPI, Pydantic, Uvicorn, Psycopg
- **Artificial Intelligence:** Google Gemini, LangChain, Hugging Face Embeddings, RAG
- **Database:** PostgreSQL, pgvector
- **Frontend:** HTML5, CSS3, JavaScript
- **Development Tools:** Visual Studio Code, Git, GitHub, Python Virtual Environment

---

## 📁 Project Structure

```text
OpsPilot/
│
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── db_test.py
│   │   ├── main.py
│   │   ├── rag.py
│   │   │
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── embeddings.py
│   │   │   └── ingest.py
│   │   │
│   │   └── retrieval/
│   │       └── search.py
│   │
│   └── requirements.txt
│
├── data/
│   └── knowledge_base/
│       ├── .gitkeep
│       ├── email_troubleshooting.txt
│       ├── incident_management.txt
│       ├── network_troubleshooting.txt
│       ├── password_reset.txt
│       ├── software_installation.txt
│       └── vpn_troubleshooting.txt
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── tickets.html
│   ├── tickets.js
│   └── tickets.css
│
├── tests/
│   └── .gitkeep
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vaishnavi-d7/OpsPilot-AI.git
cd OpsPilot-AI
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
```

### 3. Activate the Virtual Environment
For Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:
```env
GOOGLE_API_KEY=your_google_api_key
DATABASE_URL=your_postgresql_database_url
```

---

## ▶️ Running the Application

1. **Start the FastAPI server:**
   ```bash
   uvicorn backend.app.main:app --reload
   ```
2. **Access the application:**
   - Base URL: `http://127.0.0.1:8000`
   - Frontend App: `http://127.0.0.1:8000/app`

---

## 🔌 API Endpoints

- **Health Check:** `GET /health`
- **Ask OpsPilot:** `POST /ask`
- **Create Support Ticket:** `POST /tickets`
- **Get Support Tickets:** `GET /tickets`
- **Update Ticket Status:** `PUT /tickets/{ticket_id}/status`

---

## 👩‍💻 Author

**Vaishnavi D**  
*B.E. Computer Science Engineering*  
GitHub: [https://github.com/vaishnavi-d7](https://github.com/vaishnavi-d7)

---

## ⭐ Support

If you find this project useful, consider giving the repository a star on GitHub!
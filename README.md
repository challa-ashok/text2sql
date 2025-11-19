# Text to SQL Converter

Transform natural language into powerful SQL queries with AI.

## Features

- 🔑 **Secure API Key Management** - Session-based API key storage
- 📁 **Schema Upload** - Drag-and-drop database schema upload
- 💬 **Natural Language Queries** - Ask questions in plain English
- ✨ **AI-Powered Conversion** - GPT-4 powered SQL generation
- 📜 **Query History** - Track your last 5 queries
- 🎨 **Modern UI** - Beautiful dark mode with glassmorphism effects
- 📋 **Copy to Clipboard** - Easy SQL query copying

## Quick Start

See [SETUP.md](SETUP.md) for detailed installation instructions.

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Technology Stack

**Backend:**
- FastAPI
- LangChain
- OpenAI GPT-4
- Python 3.8+

**Frontend:**
- React 18
- Vite
- Modern CSS with glassmorphism

## How It Works

1. Upload your database schema as a JSON file
2. Enter your OpenAI API key
3. Ask questions in natural language
4. Get SQL queries instantly
5. View and copy generated queries

## Example Questions

- "Show me all movies from 2020"
- "Find actors who have worked in more than 5 movies"
- "List the top 10 highest rated TV series"
- "Get all directors born after 1970"

## License

MIT

## Author

Created with ❤️ for the text2sql project
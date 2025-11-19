# Text to SQL Converter - Setup Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- OpenAI API key

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
uvicorn app:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Set API Key**: Enter your OpenAI API key in the first card
2. **Upload Schema**: Upload your database schema JSON file (see `Data/db_schema.json` for format)
3. **Ask Questions**: Enter natural language questions about your database
4. **View Results**: See the generated SQL query and copy it to your clipboard
5. **Check History**: View your last 5 queries in the history section

## Database Schema Format

Your schema JSON should be an array of table objects with the following structure:

```json
[
  {
    "table_name": "users",
    "description": "User account information",
    "columns": [
      {
        "name": "id",
        "type": "integer",
        "description": "Unique user identifier"
      }
    ],
    "primary_key": "id",
    "foreign_keys": []
  }
]
```

## API Endpoints

- `POST /api/set-api-key` - Set OpenAI API key
- `POST /api/upload-schema` - Upload database schema
- `POST /api/convert` - Convert text to SQL
- `GET /api/history/{session_id}` - Get query history

## Troubleshooting

### PowerShell Execution Policy Error

If you encounter a PowerShell execution policy error when running npm commands, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

If port 8000 or 5173 is already in use, you can change the ports:

**Backend**: Edit the port in `backend/app.py` (last line)
**Frontend**: Edit the port in `frontend/vite.config.js`

### CORS Issues

Make sure both servers are running and the frontend proxy is configured correctly in `vite.config.js`

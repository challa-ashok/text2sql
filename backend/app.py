"""
FastAPI Backend for Text-to-SQL Converter
Provides REST API endpoints for schema upload, API key management, and query conversion
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import uuid
from datetime import datetime
from text2sql_service import Text2SQLService

app = FastAPI(title="Text-to-SQL API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage
sessions: Dict[str, Dict[str, Any]] = {}


# Pydantic models
class ApiKeyRequest(BaseModel):
    api_key: str
    session_id: Optional[str] = None


class QueryRequest(BaseModel):
    question: str
    session_id: str


class QueryResponse(BaseModel):
    sql_query: str
    question: str
    timestamp: str


class HistoryResponse(BaseModel):
    history: List[QueryResponse]


class SessionResponse(BaseModel):
    session_id: str
    message: str


# Helper functions
def get_or_create_session(session_id: Optional[str] = None) -> tuple[str, Dict[str, Any]]:
    """Get existing session or create a new one"""
    if session_id and session_id in sessions:
        return session_id, sessions[session_id]
    
    new_session_id = str(uuid.uuid4())
    sessions[new_session_id] = {
        "service": Text2SQLService(),
        "history": [],
        "api_key_set": False,
        "schema_loaded": False
    }
    return new_session_id, sessions[new_session_id]


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Text-to-SQL API is running", "version": "1.0.0"}


@app.post("/api/set-api-key", response_model=SessionResponse)
async def set_api_key(request: ApiKeyRequest):
    """Set OpenAI API key for the session"""
    try:
        session_id, session = get_or_create_session(request.session_id)
        service: Text2SQLService = session["service"]
        
        service.set_api_key(request.api_key)
        session["api_key_set"] = True
        
        return SessionResponse(
            session_id=session_id,
            message="API key set successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set API key: {str(e)}")


@app.post("/api/upload-schema", response_model=SessionResponse)
async def upload_schema(file: UploadFile = File(...), session_id: str = None):
    """Upload database schema JSON file"""
    try:
        # Validate file type
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="File must be a JSON file")
        
        # Read and parse JSON
        content = await file.read()
        schema_data = json.loads(content)
        
        # Validate schema structure
        if not isinstance(schema_data, list):
            raise HTTPException(status_code=400, detail="Schema must be a JSON array")
        
        # Get or create session
        if not session_id or session_id not in sessions:
            raise HTTPException(status_code=400, detail="Invalid session ID. Please set API key first.")
        
        session = sessions[session_id]
        service: Text2SQLService = session["service"]
        
        if not session["api_key_set"]:
            raise HTTPException(status_code=400, detail="API key must be set before uploading schema")
        
        # Load schema
        service.load_schema(schema_data)
        session["schema_loaded"] = True
        
        return SessionResponse(
            session_id=session_id,
            message=f"Schema loaded successfully with {len(schema_data)} tables"
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load schema: {str(e)}")


@app.post("/api/convert", response_model=QueryResponse)
async def convert_to_sql(request: QueryRequest):
    """Convert natural language question to SQL query"""
    try:
        # Validate session
        if request.session_id not in sessions:
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        session = sessions[request.session_id]
        service: Text2SQLService = session["service"]
        
        if not session["api_key_set"]:
            raise HTTPException(status_code=400, detail="API key not set")
        
        if not session["schema_loaded"]:
            raise HTTPException(status_code=400, detail="Schema not loaded")
        
        # Convert to SQL
        sql_query = service.convert_to_sql(request.question)
        
        # Create response
        response = QueryResponse(
            sql_query=sql_query,
            question=request.question,
            timestamp=datetime.now().isoformat()
        )
        
        # Add to history (keep last 5)
        session["history"].insert(0, response.dict())
        session["history"] = session["history"][:5]
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert query: {str(e)}")


@app.get("/api/history/{session_id}", response_model=HistoryResponse)
async def get_history(session_id: str):
    """Get last 5 query results"""
    try:
        if session_id not in sessions:
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        session = sessions[session_id]
        history = session["history"]
        
        return HistoryResponse(history=history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

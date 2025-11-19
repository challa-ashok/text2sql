"""
Text-to-SQL Service
Refactored from the original text2SQL.py to work as a service class
"""
from langchain_community.document_loaders import JSONLoader
import json
import tempfile
import os
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain.chat_models import init_chat_model
from langchain import hub


class Text2SQLService:
    """Service class for converting natural language to SQL queries"""
    
    def __init__(self):
        self.vector_store = None
        self.embeddings = None
        self.llm = None
        self.api_key = None
        self.schema_loaded = False
        
    def set_api_key(self, api_key: str):
        """Set the OpenAI API key"""
        self.api_key = api_key
        os.environ["OPENAI_API_KEY"] = api_key
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
        self.vector_store = InMemoryVectorStore(self.embeddings)
        self.llm = init_chat_model("gpt-5-nano", model_provider="openai")
        
    def metadata_func(self, record: dict, metadata: dict) -> dict:
        """Extract metadata from schema records"""
        metadata["table_name"] = record.get("table_name")
        metadata["columns"] = record.get("columns")
        metadata["primary_key"] = record.get("primary_key")
        metadata["foreign_keys"] = record.get("foreign_keys")
        return metadata
    
    def load_schema(self, schema_data: List[Dict[str, Any]]):
        """Load database schema from JSON data"""
        if not self.api_key:
            raise ValueError("API key must be set before loading schema")
        
        # Create a temporary file to store the schema
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
            json.dump(schema_data, temp_file)
            temp_path = temp_file.name
        
        try:
            # Load documents using JSONLoader
            loader = JSONLoader(
                file_path=temp_path,
                jq_schema='.[]',
                content_key="description",
                metadata_func=self.metadata_func
            )
            
            documents = loader.load()
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=100,
                chunk_overlap=10,
                add_start_index=True,
            )
            
            all_splits = text_splitter.split_documents(documents)
            
            # Add to vector store
            self.vector_store.add_documents(documents=all_splits)
            self.schema_loaded = True
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    def retrieve_context(self, question: str):
        """Retrieve relevant schema context for a question"""
        if not self.schema_loaded:
            raise ValueError("Schema must be loaded before querying")
        
        retrieved_docs = self.vector_store.similarity_search(question)
        return retrieved_docs
    
    def convert_to_sql(self, question: str) -> str:
        """Convert natural language question to SQL query"""
        if not self.schema_loaded:
            raise ValueError("Schema must be loaded before converting queries")
        
        if not self.llm:
            raise ValueError("API key must be set before converting queries")
        
        # Retrieve relevant context
        table_info = self.retrieve_context(question)
        
        # Get the query prompt template
        query_prompt_template = hub.pull("langchain-ai/sql-query-system-prompt")
        
        # Create the prompt
        prompt = query_prompt_template.invoke({
            "dialect": "sql",
            "top_k": 10,
            "table_info": table_info,
            "input": question
        })
        
        # Generate SQL query
        result = self.llm.invoke(prompt)
        
        # Extract the content from the result
        if hasattr(result, 'content'):
            return result.content
        else:
            return str(result)

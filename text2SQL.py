from langchain_community.document_loaders import JSONLoader
import json
import jq

from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_core.vectorstores import InMemoryVectorStore

import getpass
import os
from langchain_openai import OpenAIEmbeddings
from langchain.chat_models import init_chat_model

from langchain import hub
from typing_extensions import List, TypedDict

#loader
def metadata_func(record: dict, metadata: dict) -> dict:

    metadata["table_name"] = record.get("table_name")
    metadata["columns"] = record.get("columns")
    metadata["primary_key"] = record.get("primary_key")
    metadata["foreign_keys"] = record.get("foreign_keys")

    return metadata
#loader
loader = JSONLoader(
    file_path='./Data/db_schema.json',
    jq_schema= '.[]',
    content_key="description",
    metadata_func=metadata_func

)

documents = loader.load() #documents list [] returned

### splitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 100,
    chunk_overlap = 10,
    add_start_index = True,
)

all_splits = text_splitter.split_documents(documents)
#print(f"{len(all_splits)}")

##vectore store

os.environ["OPENAI_API_KEY"] = getpass.getpass("enter api key for openai")
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

vector_store = InMemoryVectorStore(embeddings)

document_ids = vector_store.add_documents(documents=all_splits)


#retrieval
class State(TypedDict):
    question: str
    query: str
    context: List[str]
    answer: str

def retrieveContext(question):
    retrieved_docs = vector_store.similarity_search(question)
    return retrieved_docs
#generate

def main():
    print("Enter the question")
    question = str(input())
    query_prompt_template = hub.pull("langchain-ai/sql-query-system-prompt")
    table_info = retrieveContext(question)
    prompt = query_prompt_template.invoke(
        {
            "dialect": "sql",
            "top_k": 10,
            "table_info": table_info,
            "input": question
        }
    )

    llm = init_chat_model("gpt-4o-mini",model_provider="openai")
    result = llm.invoke(prompt)

    print(f"{result}")

if __name__ == "__main__":
    main()
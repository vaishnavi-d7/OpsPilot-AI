import json
import os
from dotenv import load_dotenv
import psycopg

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from embeddings import model

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

loader = DirectoryLoader(
    "data/knowledge_base",
    glob="**/*.txt",
    loader_cls=TextLoader
)

documents = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100
)

chunks = splitter.split_documents(documents)

print(f"Documents loaded: {len(documents)}")
print(f"Chunks created: {len(chunks)}")

with psycopg.connect(DATABASE_URL) as connection:
    with connection.cursor() as cursor:

        for chunk in chunks:
            content = chunk.page_content
            metadata = chunk.metadata

            embedding = model.embed_query(content)

            cursor.execute(
                """
                INSERT INTO documents (content, metadata, embedding)
                VALUES (%s, %s, %s)
                """,
                (content, json.dumps(metadata), embedding)
            )

    connection.commit()

print("Embeddings stored successfully!")
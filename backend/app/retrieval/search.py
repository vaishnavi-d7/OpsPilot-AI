import os
from dotenv import load_dotenv
import psycopg

from backend.app.ingestion.embeddings import model

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def search_documents(query, limit=3):
    query_embedding = model.embed_query(query)

    with psycopg.connect(DATABASE_URL) as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT content, metadata,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM documents
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (query_embedding, query_embedding, limit)
            )

            return cursor.fetchall()


if __name__ == "__main__":
    results = search_documents("My VPN is not connecting")

    for content, metadata, similarity in results:
        print("\n--- Result ---")
        print("Similarity:", round(similarity, 4))
        print(content)
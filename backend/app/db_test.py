import os
from dotenv import load_dotenv
import psycopg

load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL not found")

try:
    with psycopg.connect(database_url) as connection:
        print("Supabase PostgreSQL connection successful!")

except Exception as e:
    print("Connection failed")
    print(e)
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import uuid
import os
import psycopg

from backend.app.rag import ask_opspilot


app = FastAPI(
    title="OpsPilot AI",
    description="Autonomous AI IT Operations & Support Agent",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)


class QuestionRequest(BaseModel):
    question: str


class TicketRequest(BaseModel):
    issue: str
    category: str = "IT Support"
    severity: str = "Medium"


@app.get("/")
def root():
    return {
        "message": "OpsPilot AI is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/app")
def frontend():
    return FileResponse("frontend/index.html")


@app.post("/ask")
def ask(request: QuestionRequest):

    answer = ask_opspilot(request.question)

    return {
        "question": request.question,
        "answer": answer
    }


@app.post("/tickets")
def create_ticket(ticket: TicketRequest):

    ticket_id = "OPS-" + uuid.uuid4().hex[:8].upper()

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        return {
            "error": "DATABASE_URL is not configured"
        }

    with psycopg.connect(database_url) as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                INSERT INTO support_tickets
                (ticket_id, issue, category, severity, status)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    ticket_id,
                    ticket.issue,
                    ticket.category,
                    ticket.severity,
                    "Open"
                )
            )

        connection.commit()

    return {
        "message": "Support ticket created successfully",
        "ticket_id": ticket_id,
        "issue": ticket.issue,
        "category": ticket.category,
        "severity": ticket.severity,
        "status": "Open"
    }


@app.get("/tickets")
def get_tickets():

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        return {
            "error": "DATABASE_URL is not configured"
        }

    with psycopg.connect(database_url) as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    ticket_id,
                    issue,
                    category,
                    severity,
                    status
                FROM support_tickets
                ORDER BY ticket_id DESC
                """
            )

            rows = cursor.fetchall()

    tickets = []

    for row in rows:

        tickets.append({
            "ticket_id": row[0],
            "issue": row[1],
            "category": row[2],
            "severity": row[3],
            "status": row[4]
        })

    return {
        "tickets": tickets,
        "count": len(tickets)
    }


@app.put("/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: str, status: str):

    allowed_statuses = [
        "Open",
        "In Progress",
        "Resolved"
    ]

    if status not in allowed_statuses:
        return {
            "error": "Invalid status",
            "allowed_statuses": allowed_statuses
        }

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        return {
            "error": "DATABASE_URL is not configured"
        }

    with psycopg.connect(database_url) as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                UPDATE support_tickets
                SET status = %s
                WHERE ticket_id = %s
                """,
                (
                    status,
                    ticket_id
                )
            )

            if cursor.rowcount == 0:
                return {
                    "error": "Ticket not found"
                }

        connection.commit()

    return {
        "message": "Ticket status updated successfully",
        "ticket_id": ticket_id,
        "status": status
    }
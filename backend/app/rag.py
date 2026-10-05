import os
import sys
import psycopg

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
INGESTION_DIR = os.path.join(CURRENT_DIR, "ingestion")

if INGESTION_DIR not in sys.path:
    sys.path.insert(0, INGESTION_DIR)

from embeddings import model


DATABASE_URL = os.getenv("DATABASE_URL")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


llm = ChatGoogleGenerativeAI(
    model="gemini-3.8-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.2,
    max_retries=2
)


def search_documents(question, top_k=3):

    query_embedding = model.embed_query(question)

    with psycopg.connect(DATABASE_URL) as conn:

        with conn.cursor() as cursor:

            cursor.execute(
                """
                SELECT content,
                       metadata,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM documents
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (
                    query_embedding,
                    query_embedding,
                    top_k
                )
            )

            results = cursor.fetchall()

    return results


def fallback_answer(question, documents):

    context = "\n\n".join(
        row[0]
        for row in documents
    )

    return f"""### 1. Clear Answer

Based on the OpsPilot IT support knowledge base, I found relevant troubleshooting information for your issue.

---

### 2. Step-by-Step Troubleshooting Instructions

{context}

---

### 3. Escalation Guidance

If the issue continues after completing these troubleshooting steps, please contact the appropriate IT Support team.

**Security Note:** Never share your password with support personnel."""


def detect_ticket_details(question):

    question_lower = question.lower()

    category = "IT Support"
    severity = "Medium"


    if any(word in question_lower for word in [
        "vpn",
        "network",
        "internet",
        "wifi",
        "connection",
        "server"
    ]):

        category = "Network"


    elif any(word in question_lower for word in [
        "software",
        "application",
        "app",
        "install",
        "installation",
        "program"
    ]):

        category = "Software"


    elif any(word in question_lower for word in [
        "password",
        "login",
        "account",
        "access",
        "authentication"
    ]):

        category = "IT Support"


    elif any(word in question_lower for word in [
        "security",
        "hack",
        "malware",
        "virus",
        "phishing"
    ]):

        category = "Security"


    elif any(word in question_lower for word in [
        "laptop",
        "keyboard",
        "mouse",
        "monitor",
        "printer",
        "hardware"
    ]):

        category = "Hardware"


    if any(word in question_lower for word in [
        "critical",
        "production down",
        "completely down",
        "security breach"
    ]):

        severity = "Critical"


    elif any(word in question_lower for word in [
        "urgent",
        "important",
        "cannot work",
        "can't work",
        "business impact",
        "multiple users"
    ]):

        severity = "High"


    elif any(word in question_lower for word in [
        "minor",
        "small issue",
        "not urgent"
    ]):

        severity = "Low"


    return category, severity


def extract_response_text(response):

    if not hasattr(response, "content"):
        return str(response)


    content = response.content


    if isinstance(content, str):
        return content


    if isinstance(content, list):

        text_parts = []

        for item in content:

            if isinstance(item, dict):

                if item.get("type") == "text":

                    text_parts.append(
                        item.get("text", "")
                    )

            elif isinstance(item, str):

                text_parts.append(item)


        result = "\n".join(text_parts).strip()

        if result:
            return result


    return str(content)


def ask_opspilot(question):

    category, severity = detect_ticket_details(question)

    print(
        f"\nDetected category: {category}"
    )

    print(
        f"Detected severity: {severity}"
    )


    try:

        documents = search_documents(question)

    except Exception as e:

        print(
            "\n===== RAG Search Error ====="
        )

        print(str(e))

        print(
            "============================\n"
        )

        return """I am unable to access the OpsPilot knowledge base right now.

Please try again later or contact IT Support if the issue is urgent."""


    if not documents:

        return """I couldn't find relevant information in the OpsPilot IT support knowledge base.

Please provide more details about your IT issue."""


    context_parts = []


    for content, metadata, similarity in documents:

        context_parts.append(
            f"""
Document relevance: {similarity:.4f}

{content}
"""
        )


    context = "\n\n".join(context_parts)


    prompt = f"""
You are OpsPilot, an AI IT Operations and Support Agent.

Answer the user's IT support question using ONLY the information
provided in the knowledge base.

User question:
{question}

Knowledge base:
{context}

Instructions:

1. Give a clear answer.
2. Give step-by-step troubleshooting instructions.
3. Give escalation guidance when appropriate.
4. Never ask for or expose passwords.
5. Do not invent troubleshooting steps.
6. Keep the answer professional and easy to understand.
7. Use Markdown formatting.

Structure:

### 1. Clear Answer

### 2. Step-by-Step Troubleshooting Instructions

### 3. Escalation Guidance
"""


    try:

        response = llm.invoke(prompt)

        result = extract_response_text(response)

        if result.strip():

            return result

        return fallback_answer(
            question,
            documents
        )


    except Exception as e:

        error_message = str(e)

        print(
            "\n===== OpsPilot AI Error ====="
        )

        print(error_message)

        print(
            "=============================\n"
        )


        if (
            "429" in error_message
            or "RESOURCE_EXHAUSTED" in error_message
            or "quota" in error_message.lower()
        ):

            print(
                "Gemini quota exceeded."
            )

            print(
                "Using RAG fallback response."
            )


        elif (
            "SSL" in error_message
            or "UNEXPECTED_EOF" in error_message
            or "EOF occurred" in error_message
            or "Connection" in error_message
            or "timeout" in error_message.lower()
        ):

            print(
                "Gemini network/SSL connection problem."
            )

            print(
                "Using RAG fallback response."
            )


        else:

            print(
                "Gemini request failed."
            )

            print(
                "Using RAG fallback response."
            )


        return fallback_answer(
            question,
            documents
        )


if __name__ == "__main__":

    question = input(
        "Enter your IT support question: "
    )

    answer = ask_opspilot(question)

    print(
        "\n===== OpsPilot =====\n"
    )

    print(answer)
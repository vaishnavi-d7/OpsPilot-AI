const input = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");

const chatArea = document.getElementById("chatArea");
const welcome = document.querySelector(".welcome");

const ticketModal = document.getElementById("ticketModal");
const closeTicketBtn = document.getElementById("closeTicketBtn");
const createTicketBtn = document.getElementById("createTicketBtn");

const ticketIssue = document.getElementById("ticketIssue");
const ticketCategory = document.getElementById("ticketCategory");
const ticketSeverity = document.getElementById("ticketSeverity");
const ticketResult = document.getElementById("ticketResult");

const ticketsBtn = document.getElementById("ticketsBtn");
const backToChatBtn = document.getElementById("backToChatBtn");
const refreshTicketsBtn = document.getElementById("refreshTicketsBtn");

const ticketDashboard = document.getElementById("ticketDashboard");
const ticketList = document.getElementById("ticketList");

const totalTickets = document.getElementById("totalTickets");
const openTickets = document.getElementById("openTickets");
const highTickets = document.getElementById("highTickets");

let lastQuestion = "";


function addMessage(message, type) {

    const messageDiv = document.createElement("div");

    messageDiv.className = `message ${type}`;

    messageDiv.innerHTML = message.replace(/\n/g, "<br>");

    chatArea.appendChild(messageDiv);

    chatArea.scrollTop = chatArea.scrollHeight;
}


function removeFeedback() {

    const existingFeedback =
        document.getElementById("feedbackArea");

    if (existingFeedback) {
        existingFeedback.remove();
    }
}


function showFeedback() {

    removeFeedback();

    const feedbackArea =
        document.createElement("div");

    feedbackArea.id = "feedbackArea";
    feedbackArea.className = "feedback-area";

    feedbackArea.innerHTML = `
        <div class="feedback-question">
            Did this solve your issue?
        </div>

        <div class="feedback-buttons">

            <button
                id="resolvedBtn"
                class="feedback-btn resolved"
            >
                ✅ Yes, it's resolved
            </button>

            <button
                id="notResolvedBtn"
                class="feedback-btn not-resolved"
            >
                ❌ No, create a support ticket
            </button>

        </div>
    `;

    chatArea.appendChild(feedbackArea);

    chatArea.scrollTop =
        chatArea.scrollHeight;


    document
        .getElementById("resolvedBtn")
        .addEventListener("click", () => {

            feedbackArea.innerHTML = `
                <div class="resolved-message">
                    ✅ Great! Glad I could help.
                </div>
            `;

            chatArea.scrollTop =
                chatArea.scrollHeight;
        });


    document
        .getElementById("notResolvedBtn")
        .addEventListener("click", () => {

            ticketIssue.value = lastQuestion;

            ticketResult.textContent = "";

            createTicketBtn.disabled = false;

            createTicketBtn.textContent =
                "Create Ticket";

            ticketModal.style.display =
                "flex";
        });
}


async function sendQuestion() {

    const question =
        input.value.trim();

    if (!question) {
        return;
    }

    lastQuestion = question;

    removeFeedback();

    if (welcome) {
        welcome.style.display = "none";
    }

    addMessage(question, "user");

    input.value = "";

    sendBtn.disabled = true;

    sendBtn.textContent = "...";


    const loading =
        document.createElement("div");

    loading.className = "message bot";

    loading.textContent =
        "OpsPilot is thinking...";

    loading.id = "loading";

    chatArea.appendChild(loading);

    chatArea.scrollTop =
        chatArea.scrollHeight;


    try {

        const response =
            await fetch("/ask", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question: question
                })

            });


        const data =
            await response.json();


        const loadingMessage =
            document.getElementById("loading");

        if (loadingMessage) {
            loadingMessage.remove();
        }


        if (response.ok) {

            addMessage(
                data.answer,
                "bot"
            );

            showFeedback();

        } else {

            addMessage(
                "Sorry, something went wrong while processing your request.",
                "bot"
            );

        }


    } catch (error) {

        const loadingMessage =
            document.getElementById("loading");

        if (loadingMessage) {
            loadingMessage.remove();
        }

        addMessage(
            "Unable to connect to OpsPilot backend. Please make sure the FastAPI server is running.",
            "bot"
        );

    }


    sendBtn.disabled = false;

    sendBtn.textContent = "➤";
}


/* ============================= */
/* TICKET DASHBOARD */
/* ============================= */

async function loadTickets() {

    if (!ticketList) {
        return;
    }

    ticketList.innerHTML = `
        <div class="no-tickets">
            Loading tickets...
        </div>
    `;


    try {

        const response =
            await fetch("/tickets");


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Failed to load tickets"
            );

        }


        const tickets =
            data.tickets || [];


        if (totalTickets) {
            totalTickets.textContent =
                tickets.length;
        }


        if (openTickets) {

            openTickets.textContent =
                tickets.filter(ticket =>
                    ticket.status === "Open"
                ).length;

        }


        if (highTickets) {

            highTickets.textContent =
                tickets.filter(ticket =>
                    ticket.severity === "High" ||
                    ticket.severity === "Critical"
                ).length;

        }


        if (tickets.length === 0) {

            ticketList.innerHTML = `
                <div class="no-tickets">
                    🎫 No support tickets found.
                </div>
            `;

            return;
        }


        ticketList.innerHTML = "";


        tickets.forEach(ticket => {

            const card =
                document.createElement("div");

            card.className =
                "ticket-card";


            const status =
                ticket.status || "Open";


            card.innerHTML = `

                <div class="ticket-card-top">

                    <div class="ticket-id">
                        ${ticket.ticket_id}
                    </div>

                    <select
                        class="ticket-status-select"
                        data-ticket-id="${ticket.ticket_id}"
                    >

                        <option value="Open"
                            ${status === "Open" ? "selected" : ""}>
                            🟢 Open
                        </option>

                        <option value="In Progress"
                            ${status === "In Progress" ? "selected" : ""}>
                            🟡 In Progress
                        </option>

                        <option value="Resolved"
                            ${status === "Resolved" ? "selected" : ""}>
                            ✅ Resolved
                        </option>

                    </select>

                </div>


                <div class="ticket-issue">
                    ${ticket.issue}
                </div>


                <div class="ticket-meta">

                    <span>
                        📁 ${ticket.category}
                    </span>

                    <span>
                        ⚠️ ${ticket.severity}
                    </span>

                </div>

            `;


            ticketList.appendChild(card);

        });


        document
            .querySelectorAll(".ticket-status-select")
            .forEach(select => {

                select.addEventListener(
                    "change",
                    async (event) => {

                        const ticketId =
                            event.target.dataset.ticketId;

                        const newStatus =
                            event.target.value;

                        await updateTicketStatus(
                            ticketId,
                            newStatus
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );

        ticketList.innerHTML = `
            <div class="no-tickets">
                ❌ Unable to load tickets.
                <br>
                Make sure the FastAPI server is running.
            </div>
        `;

    }
}


/* ============================= */
/* UPDATE TICKET STATUS */
/* ============================= */

async function updateTicketStatus(
    ticketId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `/tickets/${ticketId}/status?status=${encodeURIComponent(newStatus)}`,
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Failed to update ticket status."
            );

            await loadTickets();

            return;
        }


        console.log(
            "Ticket status updated:",
            data
        );


        await loadTickets();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to connect to backend."
        );

        await loadTickets();

    }
}


/* ============================= */
/* SHOW TICKET DASHBOARD */
/* ============================= */

function showTicketDashboard() {

    if (chatArea) {
        chatArea.style.display = "none";
    }

    if (ticketDashboard) {

        ticketDashboard.style.display =
            "block";

    }

    loadTickets();
}


/* ============================= */
/* SHOW CHAT */
/* ============================= */

function showChat() {

    if (ticketDashboard) {

        ticketDashboard.style.display =
            "none";

    }

    if (chatArea) {

        chatArea.style.display =
            "block";

    }
}


/* ============================= */
/* DASHBOARD BUTTONS */
/* ============================= */

if (ticketsBtn) {

    ticketsBtn.addEventListener(
        "click",
        showTicketDashboard
    );

}


if (backToChatBtn) {

    backToChatBtn.addEventListener(
        "click",
        showChat
    );

}


if (refreshTicketsBtn) {

    refreshTicketsBtn.addEventListener(
        "click",
        loadTickets
    );

}


/* ============================= */
/* CLOSE TICKET MODAL */
/* ============================= */

if (closeTicketBtn) {

    closeTicketBtn.addEventListener(
        "click",
        () => {

            ticketModal.style.display =
                "none";

            ticketResult.textContent = "";

            createTicketBtn.disabled =
                false;

            createTicketBtn.textContent =
                "Create Ticket";

        }
    );

}


/* ============================= */
/* CREATE TICKET */
/* ============================= */

if (createTicketBtn) {

    createTicketBtn.addEventListener(
        "click",
        async () => {

            const issue =
                ticketIssue.value.trim();

            const category =
                ticketCategory.value;

            const severity =
                ticketSeverity.value;


            if (!issue) {

                ticketResult.textContent =
                    "Please describe the issue.";

                return;
            }


            createTicketBtn.disabled =
                true;

            createTicketBtn.textContent =
                "Creating...";

            ticketResult.textContent = "";


            try {

                const response =
                    await fetch("/tickets", {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            issue: issue,

                            category: category,

                            severity: severity

                        })

                    });


                const data =
                    await response.json();


                if (response.ok) {

                    ticketResult.innerHTML = `
                        ✅ Ticket created successfully!
                        <br>
                        <strong>
                            ${data.ticket_id}
                        </strong>
                    `;


                    createTicketBtn.textContent =
                        "Ticket Created";


                    await loadTickets();


                } else {

                    ticketResult.textContent =
                        "❌ Failed to create ticket.";

                    createTicketBtn.disabled =
                        false;

                    createTicketBtn.textContent =
                        "Create Ticket";

                }


            } catch (error) {

                console.error(
                    "Ticket creation error:",
                    error
                );

                ticketResult.textContent =
                    "❌ Unable to connect to backend.";

                createTicketBtn.disabled =
                    false;

                createTicketBtn.textContent =
                    "Create Ticket";

            }

        }
    );

}


/* ============================= */
/* SEND QUESTION */
/* ============================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendQuestion
    );

}


if (input) {

    input.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                sendQuestion();

            }

        }
    );

}


/* ============================= */
/* SUGGESTION BUTTONS */
/* ============================= */

document
    .querySelectorAll(".suggestions button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                input.value =
                    button.textContent;

                sendQuestion();

            }
        );

    });
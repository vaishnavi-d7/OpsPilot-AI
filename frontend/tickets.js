const ticketTableBody = document.getElementById("ticketTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const refreshBtn = document.getElementById("refreshBtn");

const totalTickets = document.getElementById("totalTickets");
const openTickets = document.getElementById("openTickets");
const progressTickets = document.getElementById("progressTickets");
const resolvedTickets = document.getElementById("resolvedTickets");


async function loadTickets() {

    try {

        const response = await fetch("/tickets");

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to load tickets");
        }

        const tickets = data.tickets || [];

        ticketTableBody.innerHTML = "";

        totalTickets.textContent = tickets.length;

        const openCount = tickets.filter(
            ticket => ticket.status === "Open"
        ).length;

        const progressCount = tickets.filter(
            ticket => ticket.status === "In Progress"
        ).length;

        const resolvedCount = tickets.filter(
            ticket => ticket.status === "Resolved"
        ).length;

        openTickets.textContent = openCount;
        progressTickets.textContent = progressCount;
        resolvedTickets.textContent = resolvedCount;


        if (tickets.length === 0) {

            emptyMessage.style.display = "block";

            return;

        }

        emptyMessage.style.display = "none";


        tickets.forEach(ticket => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="ticket-id">
                    ${ticket.ticket_id}
                </td>

                <td>
                    ${ticket.issue}
                </td>

                <td>
                    ${ticket.category}
                </td>

                <td>
                    <span class="severity severity-${ticket.severity.toLowerCase()}">
                        ${ticket.severity}
                    </span>
                </td>

                <td>
                    <span class="status-badge ${getStatusClass(ticket.status)}">
                        ${ticket.status}
                    </span>
                </td>

                <td>
                    <select
                        class="status-select"
                        onchange="updateStatus('${ticket.ticket_id}', this.value)"
                    >

                        <option value="Open"
                            ${ticket.status === "Open" ? "selected" : ""}>
                            Open
                        </option>

                        <option value="In Progress"
                            ${ticket.status === "In Progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Resolved"
                            ${ticket.status === "Resolved" ? "selected" : ""}>
                            Resolved
                        </option>

                    </select>
                </td>
            `;

            ticketTableBody.appendChild(row);

        });

    } catch (error) {

        console.error("Ticket loading error:", error);

        ticketTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#dc2626;">
                    Unable to load tickets.
                </td>
            </tr>
        `;

    }

}


function getStatusClass(status) {

    if (status === "Open") {
        return "status-open";
    }

    if (status === "In Progress") {
        return "status-progress";
    }

    if (status === "Resolved") {
        return "status-resolved";
    }

    return "";

}


async function updateStatus(ticketId, status) {

    try {

        const response = await fetch(
            `/tickets/${ticketId}/status?status=${encodeURIComponent(status)}`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.error || "Failed to update ticket status."
            );

            return;

        }

        await loadTickets();

    } catch (error) {

        console.error("Status update error:", error);

        alert(
            "Unable to connect to OpsPilot backend."
        );

    }

}


refreshBtn.addEventListener(
    "click",
    loadTickets
);


loadTickets();
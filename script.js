// ==========================================================================
// EventSphere - JavaScript Logic (CSE326 Web Technologies Project)
// Clean, syllabus-aligned DOM manipulation (Array, Objects, Functions, Events)
// ==========================================================================

// 1. Initial Events Database (Array of Objects)
let events = [
    {
        id: 101,
        title: "HTML5 & Semantic Web Development",
        category: "Web Development",
        host: "Prof. Rajveer Singh",
        date: "2026-11-25",
        time: "10:00",
        seats: 50,
        registered: 40,
        desc: "Learn logical tags, semantic layout, and modern HTML5 forms."
    },
    {
        id: 102,
        title: "Machine Learning & Neural Networks",
        category: "Artificial Intelligence",
        host: "Dr. Eslok Singh",
        date: "2026-11-28",
        time: "14:00",
        seats: 60,
        registered: 60, // Full
        desc: "Foundations of AI algorithms, training pipelines, and applications."
    },
    {
        id: 103,
        title: "Cyber Security & Network Defense",
        category: "Cyber Security",
        host: "Ms. Neha Verma",
        date: "2026-12-02",
        time: "11:30",
        seats: 40,
        registered: 22,
        desc: "Practical network security essentials, encryption, and safe browsing."
    }
];

// Current Session Variables
let currentUser = null;
let currentRole = null; // "Joiner" or "Host"
let userBookings = [];  // Event IDs registered by this user

// 2. Handle Login (Form Submit)
function handleLogin(event) {
    event.preventDefault(); // Stop page reload

    let name = document.getElementById("user-name").value.trim();
    let email = document.getElementById("user-email").value.trim();
    let role = document.getElementById("user-role").value;

    currentUser = name;
    currentRole = role;

    // Display user status bar & navigation
    document.getElementById("logged-user").innerText = currentUser;
    document.getElementById("logged-role").innerText = currentRole;
    document.getElementById("user-bar").style.display = "flex";
    document.getElementById("navbar").style.display = "block";

    // Host sees "Host New Event"; Joiner does not
    let hostLink = document.getElementById("host-nav-link");
    if (currentRole === "Joiner") {
        hostLink.style.display = "none";
    } else {
        hostLink.style.display = "inline-block";
    }

    renderEvents();
    showTab("browse"); // Open Browse Events after login
}

// 3. Handle Logout
function logout() {
    currentUser = null;
    currentRole = null;
    userBookings = [];

    // Hide navigation and user bar
    document.getElementById("user-bar").style.display = "none";
    document.getElementById("navbar").style.display = "none";

    // Clear inputs and show Login screen
    document.getElementById("user-name").value = "";
    document.getElementById("user-email").value = "";
    document.getElementById("user-pass").value = "";
    showTab("login");
}

// 4. Tab Navigation (Browse, Host, Manage, Video)
function showTab(tabId) {
    let pages = document.querySelectorAll(".tab-page");
    pages.forEach(page => page.style.display = "none");

    let buttons = document.querySelectorAll(".nav-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    let targetPage = document.getElementById("tab-" + tabId);
    if (targetPage) {
        targetPage.style.display = tabId === "login" ? "flex" : "block";
    }

    // Map tabId to navigation button
    let tabMap = { browse: 0, host: 1, manage: 2, video: 3 };
    if (tabMap[tabId] !== undefined && buttons[tabMap[tabId]]) {
        buttons[tabMap[tabId]].classList.add("active");
    }
}

// 5. Render Events (Grid Cards & Management Table)
function renderEvents(customList = null) {
    let list = customList || events;
    let grid = document.getElementById("events-grid");
    let tbody = document.getElementById("table-body");

    grid.innerHTML = "";
    tbody.innerHTML = "";

    let totalSeatsBooked = 0;

    list.forEach(ev => {
        let isFull = ev.registered >= ev.seats;
        let isBooked = userBookings.includes(ev.id);
        totalSeatsBooked += ev.registered;

        // --- A. Render Card for Browse Tab ---
        let card = document.createElement("div");
        card.className = "card";

        let actionBtnCard = "";
        if (currentRole === "Host") {
            actionBtnCard = `<button type="button" class="btn btn-danger btn-sm" onclick="deleteEvent(${ev.id})">Delete Event</button>`;
        } else {
            if (isBooked) {
                actionBtnCard = `<button type="button" class="btn btn-secondary btn-sm" onclick="toggleRegistration(${ev.id})">Cancel Seat</button>`;
            } else if (isFull) {
                actionBtnCard = `<button type="button" class="btn btn-secondary btn-sm" disabled>Full</button>`;
            } else {
                actionBtnCard = `<button type="button" class="btn btn-primary btn-sm" onclick="toggleRegistration(${ev.id})">Register Event</button>`;
            }
        }

        card.innerHTML = `
            <span class="card-cat">${ev.category}</span>
            <h3>${ev.title}</h3>
            <p><strong>Speaker:</strong> ${ev.host}</p>
            <p><strong>Schedule:</strong> ${ev.date} at ${ev.time}</p>
            <p><strong>Capacity:</strong> ${ev.registered} / ${ev.seats} seats ${isFull ? '<span class="status-full">(Full)</span>' : '<span class="status-open">(Available)</span>'}</p>
            <p>${ev.desc}</p>
            <div class="card-footer">
                <span>${isBooked ? '<strong style="color: #22c55e;">&#10003; Registered</strong>' : ''}</span>
                ${actionBtnCard}
            </div>
        `;
        grid.appendChild(card);

        // --- B. Render Table Row for Manage Tab ---
        let tr = document.createElement("tr");

        let actionBtnTable = "";
        if (currentRole === "Host") {
            actionBtnTable = `<button type="button" class="btn btn-danger btn-sm" onclick="deleteEvent(${ev.id})">Delete</button>`;
        } else {
            actionBtnTable = isBooked 
                ? `<button type="button" class="btn btn-secondary btn-sm" onclick="toggleRegistration(${ev.id})">Cancel</button>`
                : `<span style="color:#777777;">-</span>`;
        }

        tr.innerHTML = `
            <td>#${ev.id}</td>
            <td><strong>${ev.title}</strong></td>
            <td>${ev.category}</td>
            <td>${ev.date} ${ev.time}</td>
            <td>${ev.host}</td>
            <td>${ev.seats}</td>
            <td>${ev.registered}</td>
            <td>${isFull ? '<span class="status-full">Full</span>' : '<span class="status-open">Open</span>'}</td>
            <td>${actionBtnTable}</td>
        `;
        tbody.appendChild(tr);
    });

    // Update Table Summary Footer
    document.getElementById("total-registrations-cell").innerText = totalSeatsBooked + " Seats";
}

// 6. Search & Category Filter
function filterEvents() {
    let query = document.getElementById("search-input").value.toLowerCase().trim();
    let cat = document.getElementById("filter-category").value;

    let filtered = events.filter(ev => {
        let matchesQuery = ev.title.toLowerCase().includes(query);
        let matchesCat = cat === "All" || ev.category === cat;
        return matchesQuery && matchesCat;
    });

    renderEvents(filtered);
}

// 7. Host: Create New Event (Form Submission)
function handleCreateEvent(event) {
    event.preventDefault();

    let title = document.getElementById("event-title").value.trim();
    let category = document.getElementById("event-category").value;
    let host = document.getElementById("event-host-name").value.trim();
    let date = document.getElementById("event-date").value;
    let time = document.getElementById("event-time").value;
    let seats = parseInt(document.getElementById("event-seats").value, 10);
    let desc = document.getElementById("event-desc").value.trim();

    let newEvent = {
        id: events.length > 0 ? events[events.length - 1].id + 1 : 101,
        title: title,
        category: category,
        host: host,
        date: date,
        time: time,
        seats: seats,
        registered: 0,
        desc: desc
    };

    events.push(newEvent);
    alert(`Success! Event "${title}" has been published.`);

    event.target.reset();
    renderEvents();
    showTab("browse");
}

// 8. Joiner: Register or Cancel Seat
function toggleRegistration(eventId) {
    let ev = events.find(item => item.id === eventId);
    if (!ev) return;

    if (userBookings.includes(eventId)) {
        userBookings = userBookings.filter(id => id !== eventId);
        ev.registered--;
        alert(`You cancelled your seat for "${ev.title}".`);
    } else {
        if (ev.registered >= ev.seats) {
            alert("Sorry! This event has already reached full capacity.");
            return;
        }
        userBookings.push(eventId);
        ev.registered++;
        alert(`Congratulations! You are registered for "${ev.title}".`);
    }

    renderEvents();
}

// 9. Host: Delete Event
function deleteEvent(eventId) {
    let confirmed = confirm("Are you sure you want to delete this event?");
    if (confirmed) {
        events = events.filter(ev => ev.id !== eventId);
        userBookings = userBookings.filter(id => id !== eventId);
        alert("Event deleted successfully.");
        renderEvents();
    }
}

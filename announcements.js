const API_BASE_URL = "https://capacity-connect-backend-1.onrender.com";

async function loadAnnouncements() {
    const list = document.getElementById("announcements-list");

    try {
        const response = await fetch(API_BASE_URL + "/api/announcements/all");
        const announcements = await response.json();

        if (announcements.length === 0) {
            list.innerHTML = "<p>No announcements yet.</p>";
            return;
        }

        const sorted = announcements.slice().sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        list.innerHTML = "";
        sorted.forEach(function(announcement) {
            const card = document.createElement("div");
            card.className = "course-card";
            const formattedDate = new Date(announcement.createdAt).toLocaleString();
            card.innerHTML =
                "<h3>" + announcement.title + "</h3>" +
                "<p>" + announcement.message + "</p>" +
                "<span class='field-label'>" + formattedDate + "</span>";
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = "<p>Could not load announcements. Is the backend running?</p>";
    }
}

async function postAnnouncement() {
    const title = document.getElementById("announcement-title").value;
    const message = document.getElementById("announcement-message").value;
    const messageBox = document.getElementById("announcement-message-box");

    if (!title || !message) {
        messageBox.textContent = "Please fill in both the title and message.";
        messageBox.style.color = "red";
        return;
    }

    try {
        const response = await fetch(API_BASE_URL + "/api/announcements/add?role=ADMIN", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title, message: message })
        });

        if (response.ok) {
            messageBox.textContent = "Announcement posted!";
            messageBox.style.color = "green";
            document.getElementById("announcement-title").value = "";
            document.getElementById("announcement-message").value = "";
            loadAnnouncements();
        } else {
            const errorText = await response.text();
            messageBox.textContent = "Could not post announcement: " + errorText;
            messageBox.style.color = "red";
        }
    } catch (error) {
        messageBox.textContent = "Could not reach the server.";
        messageBox.style.color = "red";
    }
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

loadAnnouncements();

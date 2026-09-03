function switchTab(tabName) {
    document.getElementById("panel-courses").classList.add("hidden");
    document.getElementById("panel-analytics").classList.add("hidden");
    document.getElementById("panel-announcements").classList.add("hidden");
    document.getElementById("tab-courses").classList.remove("active");
    document.getElementById("tab-analytics").classList.remove("active");
    document.getElementById("tab-announcements").classList.remove("active");

    document.getElementById("panel-" + tabName).classList.remove("hidden");
    document.getElementById("tab-" + tabName).classList.add("active");

    if (tabName === "analytics") loadAnalytics();
    if (tabName === "announcements") loadAnnouncements();
}

/* ---------- Course Management ---------- */
let editingCourseId = null;

function getStatusBadgeClass(status) {
    if (status === "MANDATORY") return "badge-status-mandatory";
    if (status === "REQUIRED") return "badge-status-required";
    return "badge-status-normal";
}

async function loadAdminCourses() {
    const tbody = document.getElementById("admin-courses-table-body");
    try {
        const response = await fetch("http://10.121.1.171:8080/api/courses/all");
        const courses = await response.json();

        if (courses.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6'>No courses yet. Add one above.</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        courses.forEach(function(course) {
            const row = document.createElement("tr");
            const safeTitle = course.title.replace(/'/g, "\\'");
            const safeDescription = course.description.replace(/'/g, "\\'");
            row.innerHTML =
                "<td>" + course.id + "</td>" +
                "<td>" + course.title + "</td>" +
                "<td>" + course.category + "</td>" +
                "<td>" + course.level + "</td>" +
                "<td><span class='badge " + getStatusBadgeClass(course.status) + "'>" + course.status + "</span></td>" +
                "<td>" +
                    "<button onclick='editCourse(" + course.id + ")'>Edit</button> " +
                    "<button class='btn-danger' onclick=\"deleteCourse(" + course.id + ")\">Delete</button>" +
                "</td>";
            row.dataset.course = JSON.stringify(course);
            tbody.appendChild(row);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='6'>Could not load courses. Is the backend running?</td></tr>";
    }
}

async function saveCourse() {
    const title = document.getElementById("course-title").value;
    const description = document.getElementById("course-description").value;
    const category = document.getElementById("course-category").value;
    const level = document.getElementById("course-level").value;
    const durationHours = document.getElementById("course-duration").value;
    const status = document.getElementById("course-status").value;
    const imageUrl = document.getElementById("course-image-url").value;
    const messageBox = document.getElementById("course-message");

    if (!title || !description) {
        messageBox.textContent = "Please fill in both the title and description.";
        messageBox.style.color = "red";
        return;
    }

    const isEditing = editingCourseId !== null;
    const url = isEditing
        ? "http://10.121.1.171:8080/api/courses/" + editingCourseId + "?role=ADMIN"
        : "http://10.121.1.171:8080/api/courses/add?role=ADMIN";
    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title,
                description: description,
                category: category,
                level: level,
                durationHours: durationHours ? parseFloat(durationHours) : null,
                status: status,
                imageUrl: imageUrl
            })
        });

        if (response.ok) {
            messageBox.textContent = isEditing ? "Course updated!" : "Course added!";
            messageBox.style.color = "green";
            cancelEdit();
            loadAdminCourses();
        } else {
            const errorText = await response.text();
            messageBox.textContent = "Could not save course: " + errorText;
            messageBox.style.color = "red";
        }
    } catch (error) {
        messageBox.textContent = "Could not reach the server.";
        messageBox.style.color = "red";
    }
}

function editCourse(id) {
    const row = document.querySelector("tr:has(td)");
    const rows = document.querySelectorAll("#admin-courses-table-body tr");
    let course = null;
    rows.forEach(function(r) {
        if (r.dataset.course) {
            const c = JSON.parse(r.dataset.course);
            if (c.id === id) course = c;
        }
    });
    if (!course) return;

    editingCourseId = id;
    document.getElementById("course-title").value = course.title;
    document.getElementById("course-description").value = course.description;
    document.getElementById("course-category").value = course.category;
    document.getElementById("course-level").value = course.level;
    document.getElementById("course-duration").value = course.durationHours || course.duration_hours || "";
    document.getElementById("course-status").value = course.status;
    document.getElementById("course-image-url").value = course.imageUrl || course.image_url || "";
    document.getElementById("save-course-btn").textContent = "Update Course";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    editingCourseId = null;
    document.getElementById("course-title").value = "";
    document.getElementById("course-description").value = "";
    document.getElementById("course-category").value = "Technical";
    document.getElementById("course-level").value = "Beginner";
    document.getElementById("course-duration").value = "";
    document.getElementById("course-status").value = "NORMAL";
    document.getElementById("course-image-url").value = "";
    document.getElementById("save-course-btn").textContent = "Add Course";
    document.getElementById("cancel-edit-btn").classList.add("hidden");
}

async function deleteCourse(courseId) {
    const confirmed = confirm("Delete this course? This cannot be undone.");
    if (!confirmed) return;

    try {
        const response = await fetch("http://10.121.1.171:8080/api/courses/" + courseId + "?role=ADMIN", {
            method: "DELETE"
        });

        if (response.ok) {
            loadAdminCourses();
        } else {
            alert("Could not delete course.");
        }
    } catch (error) {
        alert("Could not reach the server.");
    }
}

/* ---------- Analytics ---------- */
async function loadAnalytics() {
    const container = document.getElementById("analytics-container");

    try {
        const response = await fetch("http://10.121.1.171:8080/api/analytics/summary");
        const summary = await response.json();

        container.innerHTML =
            "<div class='card-grid'>" +
                "<div class='course-card'>" +
                    "<span class='field-label'>Total Users</span>" +
                    "<h3>" + summary.totalUsers + "</h3>" +
                "</div>" +
                "<div class='course-card'>" +
                    "<span class='field-label'>Total Courses</span>" +
                    "<h3>" + summary.totalCourses + "</h3>" +
                "</div>" +
                "<div class='course-card'>" +
                    "<span class='field-label'>Most Popular Course</span>" +
                    "<h3>" + (summary.mostPopularCourse || "Not enough data yet") + "</h3>" +
                "</div>" +
            "</div>";
    } catch (error) {
        container.innerHTML = "<p>Could not load analytics. Is the backend running?</p>";
    }
}

/* ---------- Announcements ---------- */
async function loadAnnouncements() {
    const list = document.getElementById("announcements-list");

    try {
        const response = await fetch("http://10.121.1.171:8080/api/announcements/all");
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
        const response = await fetch("http://10.121.1.171:8080/api/announcements/add?role=ADMIN", {
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

loadAdminCourses();
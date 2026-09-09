const API_BASE_URL = "https://capacity-connect-backend-1.onrender.com";

let editingCourseId = null;

async function loadAdminCourses() {
    const list = document.getElementById("admin-courses-list");
    try {
        const response = await fetch(API_BASE_URL + "/api/courses/all");
        const courses = await response.json();

        if (courses.length === 0) {
            list.innerHTML = "<p>No courses yet. Add one above.</p>";
            return;
        }

        list.innerHTML = "";
        courses.forEach(function(course) {
            const card = document.createElement("div");
            card.className = "course-card";
            card.innerHTML =
                "<h3>" + course.title + "</h3>" +
                "<p>" + course.description + "</p>" +
                "<button onclick=\"editCourse(" + course.id + ", '" + course.title.replace(/'/g, "\\'") + "', '" + course.description.replace(/'/g, "\\'") + "')\">Edit</button> " +
                "<button onclick=\"deleteCourse(" + course.id + ")\">Delete</button>";
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = "<p>Could not load courses. Is the backend running?</p>";
    }
}

async function saveCourse() {
    const title = document.getElementById("course-title").value;
    const description = document.getElementById("course-description").value;
    const messageBox = document.getElementById("course-message");

    if (!title || !description) {
        messageBox.textContent = "Please fill in both the title and description.";
        messageBox.style.color = "red";
        return;
    }

    const isEditing = editingCourseId !== null;
    const url = isEditing
        ? API_BASE_URL + "/api/courses/" + editingCourseId + "?role=ADMIN"
        : API_BASE_URL + "/api/courses/add?role=ADMIN";
    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title, description: description })
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

function editCourse(id, title, description) {
    editingCourseId = id;
    document.getElementById("course-title").value = title;
    document.getElementById("course-description").value = description;
    document.querySelector("#admin-courses-list").previousElementSibling.previousElementSibling.querySelector("button").textContent = "Update Course";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
    editingCourseId = null;
    document.getElementById("course-title").value = "";
    document.getElementById("course-description").value = "";
    document.querySelector(".course-card button").textContent = "Add Course";
    document.getElementById("cancel-edit-btn").classList.add("hidden");
}

async function deleteCourse(courseId) {
    const confirmed = confirm("Delete this course? This cannot be undone.");
    if (!confirmed) return;

    try {
        const response = await fetch(API_BASE_URL + "/api/courses/" + courseId + "?role=ADMIN", {
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

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

loadAdminCourses();

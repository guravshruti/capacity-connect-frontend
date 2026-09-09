const API_BASE_URL = "https://capacity-connect-backend-1.onrender.com";

let allCourses = [];

async function loadCourses() {
    const coursesList = document.getElementById("courses-list");

    try {
        const response = await fetch(API_BASE_URL + "/api/courses/all");

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        const courses = await response.json();

        allCourses = courses;
        applyFilters();

    } catch (error) {
        console.error("Load courses error:", error);
        coursesList.innerHTML = "<p>Could not load courses. Is the backend running?</p>";
    }
}

function getCategoryBadgeClass(category) {
    if (category === "Technical") {
        return "badge-technical";
    }

    if (category === "Scientific") {
        return "badge-scientific";
    }

    if (category === "Administrative") {
        return "badge-administrative";
    }

    if (category === "Policy & Compliance") {
        return "badge-policy";
    }

    return "badge-technical";
}

function renderCourseFooter(course) {
    const completedYear = course.completedYear || course.completed_year;
    const year = completedYear ? " (" + completedYear + ")" : "";

    if (course.status === "COMPLETED") {
        return (
            "<span class='footer-label-completed'>✓ Completed" +
            year +
            "</span>" +
            "<button class='btn-secondary' onclick='enroll(" +
            course.id +
            ")'>Renew</button>"
        );
    }

    if (course.status === "MANDATORY") {
        return (
            "<span class='footer-label-mandatory'>Mandatory</span>" +
            "<button onclick='enroll(" +
            course.id +
            ")'>Enroll</button>"
        );
    }

    if (course.status === "REQUIRED") {
        return (
            "<span class='footer-label-required'>Required for Role</span>" +
            "<button onclick='enroll(" +
            course.id +
            ")'>Enroll</button>"
        );
    }

    return (
        "<span></span>" +
        "<button class='btn-secondary' onclick=\"window.location.href='course-detail.html?courseId=" +
        course.id +
        "'\">View Details</button>"
    );
}

function renderCourseCard(course, container) {
    const imageUrl =
        course.imageUrl ||
        course.image_url ||
        "images/default-course.jpg";

    const durationHours =
        course.durationHours ||
        course.duration_hours ||
        "N/A";

    const card = document.createElement("div");

    card.className = "course-card";

    card.innerHTML =
        "<div class='course-card-image-wrap'>" +
            "<img src='" +
            imageUrl +
            "' alt='" +
            (course.title || "Course") +
            "'>" +
            "<span class='badge badge-overlay " +
            getCategoryBadgeClass(course.category) +
            "'>" +
            (course.category || "General") +
            "</span>" +
        "</div>" +

        "<div class='course-card-body'>" +

            "<h3>" +
                "<a href='course-detail.html?courseId=" +
                course.id +
                "' style='color:inherit;'>" +
                (course.title || "Untitled Course") +
                "</a>" +
            "</h3>" +

            "<p>" +
            (course.description || "No description available.") +
            "</p>" +

            "<div class='course-meta-row'>" +
                "<span>⏱ " +
                durationHours +
                " Hours</span>" +

                "<span>📊 " +
                (course.level || "All Levels") +
                "</span>" +
            "</div>" +

            "<div class='course-card-footer'>" +
                renderCourseFooter(course) +
            "</div>" +

            "<span class='feedback-toggle' onclick='toggleFeedback(" +
            course.id +
            ")'>" +
            "Show feedback & rating" +
            "</span>" +

            "<div id='feedback-panel-" +
            course.id +
            "' class='feedback-panel hidden'>" +

                "<span class='field-label'>Feedback</span>" +

                "<div id='feedback-list-" +
                course.id +
                "'>" +
                "<p>Loading feedback...</p>" +
                "</div>" +

                "<select id='feedback-rating-" +
                course.id +
                "'>" +
                    "<option value='5'>5 - Excellent</option>" +
                    "<option value='4'>4 - Good</option>" +
                    "<option value='3'>3 - Okay</option>" +
                    "<option value='2'>2 - Poor</option>" +
                    "<option value='1'>1 - Very Poor</option>" +
                "</select>" +

                "<textarea id='feedback-comment-" +
                course.id +
                "' placeholder='Share your thoughts on this course...'></textarea>" +

                "<button onclick='submitFeedback(" +
                course.id +
                ")'>Submit Feedback</button>" +

                "<button class='btn-secondary' onclick=\"window.location.href='quiz.html?courseId=" +
                course.id +
                "'\">Take Quiz</button>" +

            "</div>" +

        "</div>";

    container.appendChild(card);
}

function toggleFeedback(courseId) {
    const panel = document.getElementById("feedback-panel-" + courseId);

    if (!panel) {
        return;
    }

    panel.classList.toggle("hidden");

    if (!panel.classList.contains("hidden")) {
        loadFeedback(courseId);
    }
}

async function loadFeedback(courseId) {
    const list = document.getElementById("feedback-list-" + courseId);

    if (!list) {
        return;
    }

    try {
        const response = await fetch(
            API_BASE_URL + "/api/feedback/course/" + courseId
        );

        if (!response.ok) {
            throw new Error("Failed to load feedback");
        }

        const feedbackItems = await response.json();

        if (!feedbackItems || feedbackItems.length === 0) {
            list.innerHTML =
                "<p>No feedback yet. Be the first to share yours.</p>";
            return;
        }

        list.innerHTML = "";

        feedbackItems.forEach(function(item) {
            const entry = document.createElement("p");

            entry.textContent =
                "★ " +
                item.rating +
                " — " +
                (item.comment || "");

            list.appendChild(entry);
        });

    } catch (error) {
        console.error("Load feedback error:", error);
        list.innerHTML = "<p>Could not load feedback.</p>";
    }
}

async function submitFeedback(courseId) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please sign up or log in first.");
        return;
    }

    const ratingElement =
        document.getElementById("feedback-rating-" + courseId);

    const commentElement =
        document.getElementById("feedback-comment-" + courseId);

    if (!ratingElement || !commentElement) {
        alert("Feedback form could not be loaded.");
        return;
    }

    const rating = ratingElement.value;
    const comment = commentElement.value.trim();

    if (!comment) {
        alert("Please write a comment before submitting.");
        return;
    }

    try {
        const response = await fetch(
            API_BASE_URL + "/api/feedback/add",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    courseId: courseId,
                    rating: parseInt(rating),
                    comment: comment
                })
            }
        );

        if (response.ok) {
            commentElement.value = "";
            alert("Feedback submitted successfully!");
            loadFeedback(courseId);
        } else {
            const errorText = await response.text();
            console.error("Feedback API error:", errorText);
            alert("Could not submit feedback.");
        }

    } catch (error) {
        console.error("Submit feedback error:", error);
        alert("Could not reach the server.");
    }
}

async function enroll(courseId) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please sign up or log in first.");
        return;
    }

    try {
        const response = await fetch(
            API_BASE_URL +
            "/api/enrollments/enroll?userId=" +
            encodeURIComponent(userId) +
            "&courseId=" +
            encodeURIComponent(courseId),
            {
                method: "POST"
            }
        );

        if (response.ok) {
            alert("Enrolled successfully!");
        } else {
            const errorText = await response.text();
            console.error("Enrollment API error:", errorText);
            alert("Could not enroll. You may already be enrolled in this course.");
        }

    } catch (error) {
        console.error("Enrollment error:", error);
        alert("Could not reach the server.");
    }
}

function renderCourses(courses) {
    const coursesList = document.getElementById("courses-list");

    if (!coursesList) {
        return;
    }

    if (!courses || courses.length === 0) {
        coursesList.innerHTML = "<p>No courses found.</p>";
        return;
    }

    coursesList.innerHTML = "";

    courses.forEach(function(course) {
        renderCourseCard(course, coursesList);
    });
}

function applyFilters() {
    const checkedCategories =
        Array.from(
            document.querySelectorAll(
                ".filter-group:nth-of-type(1) input:checked"
            )
        ).map(function(cb) {
            return cb.value;
        });

    const checkedLevels =
        Array.from(
            document.querySelectorAll(
                ".filter-group:nth-of-type(2) input:checked"
            )
        ).map(function(cb) {
            return cb.value;
        });

    const filtered = allCourses.filter(function(course) {
        const categoryMatch =
            checkedCategories.length === 0 ||
            checkedCategories.includes(course.category);

        const levelMatch =
            checkedLevels.length === 0 ||
            checkedLevels.includes(course.level) ||
            course.level === "All Levels";

        return categoryMatch && levelMatch;
    });

    renderCourses(filtered);
}

function clearFilters() {
    document
        .querySelectorAll(".filter-option input")
        .forEach(function(cb) {
            cb.checked = false;
        });

    applyFilters();
}

async function searchCourses() {
    const searchBox = document.getElementById("search-box");
    const coursesList = document.getElementById("courses-list");

    if (!searchBox) {
        return;
    }

    const keyword = searchBox.value.trim();

    if (keyword === "") {
        loadCourses();
        return;
    }

    try {
        const response = await fetch(
            API_BASE_URL +
            "/api/courses/search?keyword=" +
            encodeURIComponent(keyword)
        );

        if (!response.ok) {
            throw new Error("Search request failed");
        }

        const courses = await response.json();

        allCourses = courses;

        applyFilters();

    } catch (error) {
        console.error("Search courses error:", error);
        coursesList.innerHTML =
            "<p>Could not search courses. Is the backend running?</p>";
    }
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    window.location.href = "index.html";
}

loadCourses();

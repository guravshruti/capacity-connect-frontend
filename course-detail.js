const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

function getCategoryBadgeClass(category) {
    if (category === "Technical") return "badge-technical";
    if (category === "Scientific") return "badge-scientific";
    if (category === "Administrative") return "badge-administrative";
    if (category === "Policy & Compliance") return "badge-policy";
    return "badge-technical";
}

async function loadCourseDetail() {
    if (!courseId) {
        document.getElementById("course-header").innerHTML = "<p>No course selected.</p>";
        return;
    }

    try {
        const response = await fetch("http://10.121.1.171:8080/api/courses/all");
        const allCourses = await response.json();
        const course = allCourses.find(function(c) { return c.id == courseId; });

        if (!course) {
            document.getElementById("course-header").innerHTML = "<p>Course not found.</p>";
            return;
        }

        const imageUrl = course.imageUrl || course.image_url;
        const durationHours = course.durationHours || course.duration_hours;

        document.getElementById("course-header").innerHTML =
            "<span class='badge " + getCategoryBadgeClass(course.category) + "'>" + course.category + "</span> " +
            "<span class='badge badge-category'>" + course.level + "</span>" +
            "<h1 style='margin-top:10px;'>" + course.title + "</h1>";
        document.getElementById("course-description").textContent = course.description;
        document.getElementById("course-image").src = imageUrl;

        document.getElementById("course-enrollment-meta").innerHTML =
            "<p>⏱ Estimated " + durationHours + " hours total</p>" +
            "<p>📅 Self-paced, flexible schedule</p>" +
            "<p>🎓 Official Certificate of Completion</p>";

        loadMaterials();
        loadFeedback();
        loadAverageRating();
        buildRatingOptions();
    } catch (error) {
        document.getElementById("course-header").innerHTML = "<p>Could not load course. Is the backend running?</p>";
    }
}

function buildRatingOptions() {
    const select = document.getElementById("feedback-rating");
    select.innerHTML =
        "<option value='5'>5 - Excellent</option>" +
        "<option value='4'>4 - Good</option>" +
        "<option value='3'>3 - Okay</option>" +
        "<option value='2'>2 - Poor</option>" +
        "<option value='1'>1 - Very Poor</option>";
}

async function loadMaterials() {
    const list = document.getElementById("course-materials-list");
    try {
        const response = await fetch("http://10.121.1.171:8080/api/materials/course/" + courseId);
        const materials = await response.json();

        if (materials.length === 0) {
            list.innerHTML = "<p>No materials uploaded for this course yet.</p>";
            return;
        }

        list.innerHTML = "";
        materials.forEach(function(material) {
            const row = document.createElement("div");
            row.className = "course-card";
            row.innerHTML =
                "<h3 style='font-size:15px; margin-bottom:2px;'>📄 " + material.title + "</h3>" +
                "<a href='" + material.url + "' target='_blank'>" + material.url + "</a>";
            list.appendChild(row);
        });
    } catch (error) {
        list.innerHTML = "<p>Could not load materials.</p>";
    }
}

async function loadFeedback() {
    const list = document.getElementById("course-feedback-list");
    try {
        const response = await fetch("http://10.121.1.171:8080/api/feedback/course/" + courseId);
        const feedbackItems = await response.json();

        if (feedbackItems.length === 0) {
            list.innerHTML = "<p>No feedback yet. Be the first to share yours.</p>";
            return;
        }

        list.innerHTML = "";
        feedbackItems.forEach(function(item) {
            const row = document.createElement("div");
            row.className = "course-card";
            row.innerHTML = "<p style='margin:0;'>★ " + item.rating + " — " + item.comment + "</p>";
            list.appendChild(row);
        });
    } catch (error) {
        list.innerHTML = "<p>Could not load feedback.</p>";
    }
}

async function loadAverageRating() {
    const el = document.getElementById("course-avg-rating");
    try {
        const response = await fetch("http://10.121.1.171:8080/api/ratings/course/" + courseId + "/average");
        const avg = await response.json();
        el.textContent = avg ? "★ " + avg.toFixed(1) + " average rating" : "No ratings yet";
    } catch (error) {
        el.textContent = "";
    }
}

async function submitFeedback() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please sign up or log in first.");
        return;
    }

    const rating = document.getElementById("feedback-rating").value;
    const comment = document.getElementById("feedback-comment").value;

    if (!comment) {
        alert("Please write a comment before submitting.");
        return;
    }

    try {
        const response = await fetch("http://10.121.1.171:8080/api/feedback/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                courseId: courseId,
                rating: parseInt(rating),
                comment: comment
            })
        });

        if (response.ok) {
            document.getElementById("feedback-comment").value = "";
            loadFeedback();
        } else {
            alert("Could not submit feedback.");
        }
    } catch (error) {
        alert("Could not reach the server.");
    }
}

async function enroll() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please sign up or log in first.");
        return;
    }
    try {
        const response = await fetch(
            "http://10.121.1.171:8080/api/enrollments/enroll?userId=" + userId + "&courseId=" + courseId,
            { method: "POST" }
        );
        if (response.ok) {
            alert("Enrolled successfully!");
        } else {
            alert("Could not enroll. You may already be enrolled in this course.");
        }
    } catch (error) {
        alert("Could not reach the server.");
    }
}

function goToQuiz() {
    window.location.href = "quiz.html?courseId=" + courseId;
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

loadCourseDetail();
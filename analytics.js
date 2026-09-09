const API_BASE_URL = "https://capacity-connect-backend-1.onrender.com";

async function loadAnalytics() {
    const container = document.getElementById("analytics-container");

    try {
        const response = await fetch(API_BASE_URL + "/api/analytics/summary");
        const summary = await response.json();

        container.innerHTML =
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
            "</div>";
    } catch (error) {
        container.innerHTML = "<p>Could not load analytics. Is the backend running?</p>";
    }
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

loadAnalytics();

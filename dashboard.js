async function loadDashboard() {
    const list = document.getElementById("enrollments-list");
    const credentialsList = document.getElementById("credentials-list");
    const userId = localStorage.getItem("userId");
    if (!userId) {
        list.innerHTML = "<p>Please sign up or log in first.</p>";
        credentialsList.innerHTML = "";
        return;
    }
    try {
        const coursesResponse = await fetch("http://10.121.1.171:8080/api/courses/all");
        const allCourses = await coursesResponse.json();
        const courseMap = {};
        allCourses.forEach(function(course) {
            courseMap[course.id] = course;
        });

        const response = await fetch("http://10.121.1.171:8080/api/enrollments/user/" + userId);
        const enrollments = await response.json();

        if (enrollments.length === 0) {
            list.innerHTML = "<p>You haven't enrolled in any courses yet. Go to the Courses page to get started!</p>";
            credentialsList.innerHTML = "<p>No credentials yet.</p>";
            return;
        }

        list.innerHTML = "";
        const completedEnrollments = [];

        enrollments.forEach(function(enrollment) {
            const progress = enrollment.progressPercent;
            const statusClass = enrollment.status === "COMPLETED" ? "completed" : "enrolled";
            const course = courseMap[enrollment.courseId];
            const courseTitle = course ? course.title : "Course #" + enrollment.courseId;
            const courseCategory = course ? course.category : "";
            const durationHours = course ? (course.durationHours || course.duration_hours) : null;

            let remainingText = "";
            if (durationHours) {
                const remainingHours = (durationHours * (100 - progress) / 100).toFixed(1);
                remainingText = remainingHours <= 0
                    ? "Complete"
                    : "Est. time remaining: " + remainingHours + " hrs";
            }

            const certificateButton = enrollment.status === "COMPLETED"
                ? "<button onclick=\"getCertificate(" + enrollment.id + ")\">Get Certificate</button>"
                : "<button onclick=\"saveProgress(" + enrollment.id + ")\">Continue Module</button>";

            if (enrollment.status === "COMPLETED") {
                completedEnrollments.push({ enrollment: enrollment, course: course });
            }

            const card = document.createElement("div");
            card.className = "course-card";
            card.style.padding = "20px";
            card.style.marginBottom = "14px";
            card.innerHTML =
                "<div class='enrollment-head'>" +
                    "<div>" +
                        "<h3>" + courseTitle + "</h3>" +
                        "<p style='margin:0; font-size:13px;'>" + courseCategory + "</p>" +
                    "</div>" +
                    "<span class='status-pill " + statusClass + "'>" + enrollment.status + "</span>" +
                "</div>" +
                "<div class='progress-track'>" +
                    "<div class='progress-fill' style='width:" + progress + "%;'></div>" +
                "</div>" +
                "<div class='progress-meta'>" +
                    "<span>" + progress + "% Completed</span>" +
                    "<span>" + remainingText + "</span>" +
                "</div>" +
                "<input type='range' min='0' max='100' value='" + progress + "' " +
                "id='slider-" + enrollment.id + "' " +
                "oninput=\"document.getElementById('label-" + enrollment.id + "').textContent = this.value + '%'\">" +
                "<p id='label-" + enrollment.id + "'>" + progress + "%</p>" +
                "<button onclick=\"saveProgress(" + enrollment.id + ")\">Save Progress</button> " +
                certificateButton;
            list.appendChild(card);
        });

        if (completedEnrollments.length === 0) {
            credentialsList.innerHTML = "<p>No credentials yet. Complete a course to earn one.</p>";
        } else {
            credentialsList.innerHTML = "";
            completedEnrollments.forEach(function(item) {
                const title = item.course ? item.course.title : "Course #" + item.enrollment.courseId;
                const card = document.createElement("div");
                card.className = "credential-card";
                card.innerHTML =
                    "<div class='cred-icon'>🎓</div>" +
                    "<p><strong>" + title + "</strong></p>" +
                    "<button class='btn-secondary' onclick=\"getCertificate(" + item.enrollment.id + ")\">View Certificate</button>";
                credentialsList.appendChild(card);
            });
        }
    } catch (error) {
        list.innerHTML = "<p>Could not load your dashboard. Is the backend running?</p>";
        credentialsList.innerHTML = "";
    }
}

async function saveProgress(enrollmentId) {
    const slider = document.getElementById("slider-" + enrollmentId);
    const newProgress = slider.value;
    try {
        const response = await fetch(
            "http://10.121.1.171:8080/api/enrollments/" + enrollmentId + "/progress?progressPercent=" + newProgress,
            { method: "PUT" }
        );
        if (response.ok) {
            alert("Progress updated!");
            loadDashboard();
        } else {
            alert("Could not update progress.");
        }
    } catch (error) {
        alert("Could not reach the server.");
    }
}

async function getCertificate(enrollmentId) {
    try {
        const response = await fetch("http://10.121.1.171:8080/api/certificates/generate/" + enrollmentId, {
            method: "POST"
        });
        if (response.ok) {
            window.location.href = "certificates.html";
        } else {
            alert("Could not generate certificate.");
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

loadDashboard();
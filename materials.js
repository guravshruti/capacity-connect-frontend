async function loadCourseDropdown() {
    const select = document.getElementById("course-select");

    try {
        const response = await fetch("http://10.121.1.171:8080/api/courses/all");
        const courses = await response.json();

        select.innerHTML = "";
        courses.forEach(function(course) {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = course.title;
            select.appendChild(option);
        });

        loadMaterials();
    } catch (error) {
        select.innerHTML = "<option>Could not load courses</option>";
    }
}

async function loadMaterials() {
    const courseId = document.getElementById("course-select").value;
    const list = document.getElementById("materials-list");

    if (!courseId) {
        list.innerHTML = "<p>Select a course above to see its materials.</p>";
        return;
    }

    list.innerHTML = "<p>Loading materials...</p>";

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
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.alignItems = "center";
            row.style.padding = "12px 0";
            row.style.borderBottom = "1px solid var(--border)";
            row.innerHTML =
                "<div>" +
                    "<h3 style='margin-bottom:2px; font-size:15px;'>" + material.title + "</h3>" +
                    "<a href='" + material.url + "' target='_blank' style='font-size:13px;'>" + material.url + "</a>" +
                "</div>" +
                "<button class='btn-danger' onclick=\"deleteMaterial(" + material.id + ")\">Delete</button>";
            list.appendChild(row);
        });

    } catch (error) {
        list.innerHTML = "<p>Could not load materials. Is the backend running?</p>";
    }
}

async function uploadMaterial() {
    const courseId = document.getElementById("course-select").value;
    const title = document.getElementById("material-title").value;
    const url = document.getElementById("material-url").value;
    const messageBox = document.getElementById("upload-message");

    if (!courseId) {
        messageBox.textContent = "Please select a course first.";
        messageBox.style.color = "red";
        return;
    }
    if (!title || !url) {
        messageBox.textContent = "Please fill in both the title and link.";
        messageBox.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://10.121.1.171:8080/api/materials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title, url: url, courseId: courseId })
        });

        if (response.ok) {
            messageBox.textContent = "Material uploaded!";
            messageBox.style.color = "green";
            document.getElementById("material-title").value = "";
            document.getElementById("material-url").value = "";
            loadMaterials();
        } else {
            messageBox.textContent = "Could not upload material.";
            messageBox.style.color = "red";
        }
    } catch (error) {
        messageBox.textContent = "Could not reach the server.";
        messageBox.style.color = "red";
    }
}

async function deleteMaterial(materialId) {
    const confirmed = confirm("Delete this material?");
    if (!confirmed) return;

    try {
        const response = await fetch("http://10.121.1.171:8080/api/materials/" + materialId, {
            method: "DELETE"
        });

        if (response.ok) {
            loadMaterials();
        } else {
            alert("Could not delete material.");
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

loadCourseDropdown();
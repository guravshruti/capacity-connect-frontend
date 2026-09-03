async function loadProfile() {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId) {
        document.getElementById("profile-message").textContent = "Please sign up or log in first.";
        document.getElementById("profile-message").style.color = "red";
        return;
    }

    document.getElementById("profile-name").textContent = userName || "My Profile";
    document.getElementById("profile-email").textContent = userEmail || "";
    document.getElementById("contact-email").textContent = userEmail || "";

    try {
        const response = await fetch("http://10.121.1.171:8080/api/trainee-profile/" + userId);
        if (response.ok) {
            const data = await response.json();
            if (data) {
                document.getElementById("qualifications").value = data.qualifications || "";
                document.getElementById("workExperience").value = data.workExperience || "";
                document.getElementById("skills").value = data.skills || "";
                document.getElementById("interests").value = data.interests || "";
                document.getElementById("certificates").value = data.certificates || "";
            }
        }
        // If no profile exists yet, that's fine — form just stays blank for a first-time entry.
    } catch (error) {
        console.log("No existing profile found, or could not reach server.");
    }
}

async function saveProfile() {
    const userId = localStorage.getItem("userId");
    const messageBox = document.getElementById("profile-message");
    if (!userId) {
        messageBox.textContent = "Please sign up or log in first.";
        messageBox.style.color = "red";
        return;
    }
    const profileData = {
        qualifications: document.getElementById("qualifications").value,
        workExperience: document.getElementById("workExperience").value,
        skills: document.getElementById("skills").value,
        interests: document.getElementById("interests").value,
        certificates: document.getElementById("certificates").value
    };
    try {
        const response = await fetch("http://10.121.1.171:8080/api/trainee-profile/" + userId, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData)
        });
        if (response.ok) {
            messageBox.textContent = "Profile saved!";
            messageBox.style.color = "green";
        } else {
            messageBox.textContent = "Could not save profile.";
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

loadProfile();
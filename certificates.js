async function loadCertificates() {
    const list = document.getElementById("certificates-list");
    const userId = localStorage.getItem("userId");

    if (!userId) {
        list.innerHTML = "<p>Please sign up or log in first.</p>";
        return;
    }

    try {
        const response = await fetch("http://10.121.1.171:8080/api/certificates/user/" + userId);
        const certificates = await response.json();

        if (certificates.length === 0) {
            list.innerHTML = "<p>No certificates yet. Complete a course to earn one!</p>";
            return;
        }

        list.innerHTML = "";
        certificates.forEach(function(cert) {
            const card = document.createElement("div");
            card.className = "course-card";
            card.innerHTML =
                "<span class='badge badge-published'>Completed</span>" +
                "<h3 style='margin-top:10px;'>" + cert.courseTitle + "</h3>" +
                "<p>Awarded to <strong>" + cert.userName + "</strong></p>" +
                "<p>Issued: " + cert.issueDate + "</p>" +
                "<p style='font-family: monospace; font-size: 12px; color: var(--text-muted);'>Code: " + cert.certificateCode + "</p>" +
                "<button onclick='printCertificate(" +
                    JSON.stringify(cert.courseTitle) + ", " +
                    JSON.stringify(cert.userName) + ", " +
                    JSON.stringify(cert.issueDate) + ", " +
                    JSON.stringify(cert.certificateCode) +
                ")'>Print Certificate</button>";
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = "<p>Could not load certificates. Is the backend running?</p>";
    }
}

function printCertificate(courseTitle, userName, issueDate, certificateCode) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
        "<html><head><title>Certificate</title>" +
        "<style>" +
        "body{ font-family: 'Inter', Arial, sans-serif; text-align:center; padding:80px; border: 10px solid #0F1E3C; margin:20px; }" +
        "h1{ font-size:14px; letter-spacing:3px; text-transform:uppercase; color:#4F5FE8; }" +
        "h2{ font-size:38px; color:#0F1E3C; margin:20px 0; }" +
        "p{ font-size:16px; color:#64748B; }" +
        ".name{ font-size:30px; font-weight:700; margin:20px 0; color:#0F1E3C; }" +
        ".course{ font-size:24px; font-weight:600; margin:20px 0; color:#4F5FE8; }" +
        ".code{ margin-top:60px; font-family:monospace; font-size:12px; color:#94A3B8; }" +
        "</style></head><body>" +
        "<h1>Capacity Connect</h1>" +
        "<h2>Certificate of Completion</h2>" +
        "<p>This certifies that</p>" +
        "<div class='name'>" + userName + "</div>" +
        "<p>has successfully completed</p>" +
        "<div class='course'>" + courseTitle + "</div>" +
        "<p>Issued on " + issueDate + "</p>" +
        "<div class='code'>Certificate Code: " + certificateCode + "</div>" +
        "</body></html>"
    );
    printWindow.document.close();
    printWindow.print();
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

loadCertificates();
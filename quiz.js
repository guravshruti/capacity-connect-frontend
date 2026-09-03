const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");
let quizQuestions = [];
let currentIndex = 0;
let userAnswers = {};

async function loadQuiz() {
    const container = document.getElementById("quiz-container");

    if (!courseId) {
        container.innerHTML = "<p>No course selected. Go back to Courses and click Take Quiz.</p>";
        document.getElementById("prev-btn").style.display = "none";
        document.getElementById("next-btn").style.display = "none";
        return;
    }

    try {
        const courseResponse = await fetch("http://10.121.1.171:8080/api/courses/all");
        const allCourses = await courseResponse.json();
        const course = allCourses.find(function(c) { return c.id == courseId; });

        if (course) {
            document.getElementById("quiz-title").textContent = course.title + " Quiz";
        }

        let response = await fetch("http://10.121.1.171:8080/api/quiz/" + courseId);
        let questions = await response.json();

        if (questions.length === 0) {
            container.innerHTML = "<p>Generating quiz questions...</p>";
            const genResponse = await fetch("http://10.121.1.171:8080/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: courseId,
                    title: course ? course.title : "",
                    description: course ? course.description : ""
                })
            });
            questions = await genResponse.json();
        }

        quizQuestions = questions;

        if (quizQuestions.length === 0) {
            container.innerHTML = "<p>No quiz questions available for this course yet.</p>";
            document.getElementById("prev-btn").style.display = "none";
            document.getElementById("next-btn").style.display = "none";
            return;
        }

        renderQuestion();
    } catch (error) {
        container.innerHTML = "<p>Could not load quiz. Is the backend running?</p>";
    }
}

function renderQuestion() {
    const container = document.getElementById("quiz-container");
    const q = quizQuestions[currentIndex];

    document.getElementById("question-counter").textContent = "Question " + (currentIndex + 1) + " of " + quizQuestions.length;
    const percent = Math.round(((currentIndex) / quizQuestions.length) * 100);
    document.getElementById("quiz-progress-fill").style.width = percent + "%";
    document.getElementById("progress-percent-label").textContent = percent + "% Completed";

    const savedAnswer = userAnswers[q.id];

    const options = [
        { key: "A", text: q.optionA },
        { key: "B", text: q.optionB },
        { key: "C", text: q.optionC },
        { key: "D", text: q.optionD }
    ];

    let optionsHtml = "";
    options.forEach(function(opt) {
        const isSelected = savedAnswer === opt.key;
        optionsHtml +=
            "<label class='quiz-option" + (isSelected ? " selected" : "") + "'>" +
                "<input type='radio' name='answer' value='" + opt.key + "' " + (isSelected ? "checked" : "") + " onclick=\"selectAnswer('" + opt.key + "')\">" +
                opt.key + ". " + opt.text +
            "</label>";
    });

    container.innerHTML =
        "<div class='course-card quiz-question-card'>" +
            "<div class='quiz-question-icon'>🛡️</div>" +
            "<div class='quiz-options'>" +
                "<h3>" + q.questionText + "</h3>" +
                optionsHtml +
            "</div>" +
        "</div>";

    document.getElementById("prev-btn").style.visibility = currentIndex === 0 ? "hidden" : "visible";
    document.getElementById("next-btn").textContent = currentIndex === quizQuestions.length - 1 ? "Submit Quiz" : "Next →";
}

function selectAnswer(value) {
    const q = quizQuestions[currentIndex];
    userAnswers[q.id] = value;
}

function goNext() {
    const q = quizQuestions[currentIndex];
    if (!userAnswers[q.id]) {
        alert("Please select an answer before continuing.");
        return;
    }

    if (currentIndex === quizQuestions.length - 1) {
        submitQuiz();
        return;
    }

    currentIndex++;
    renderQuestion();
}

function goPrevious() {
    if (currentIndex === 0) return;
    currentIndex--;
    renderQuestion();
}

async function submitQuiz() {
    const resultBox = document.getElementById("quiz-result");
    const submissions = quizQuestions.map(function(q) {
        return { questionId: q.id, selectedAnswer: userAnswers[q.id] };
    });

    try {
        const response = await fetch("http://10.121.1.171:8080/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submissions)
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById("quiz-progress-fill").style.width = "100%";
            document.getElementById("progress-percent-label").textContent = "100% Completed";
            document.getElementById("prev-btn").style.display = "none";
            document.getElementById("next-btn").style.display = "none";
            document.getElementById("quiz-container").innerHTML = "";
            resultBox.innerHTML =
                "<div class='course-card'>" +
                "<h3>Quiz Result</h3>" +
                "<p>Score: " + result.score + "%</p>" +
                "<p>" + result.correctCount + " out of " + result.totalQuestions + " correct</p>" +
                "</div>";
        } else {
            resultBox.innerHTML = "<p style='color:red;'>Could not submit quiz.</p>";
        }
    } catch (error) {
        resultBox.innerHTML = "<p style='color:red;'>Could not reach the server.</p>";
    }
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

loadQuiz();
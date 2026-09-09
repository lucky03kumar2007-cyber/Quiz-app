const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const questionNumber = document.getElementById("question-number");
const timerElement = document.getElementById("timer");

const startButton = document.getElementById("start-btn");
const startBox = document.getElementById("start-box");
const quizBox = document.getElementById("quiz-box");
const resultBox = document.getElementById("result-box");
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart-btn");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

let timer;
let timeLeft = 30;


startButton.disabled = true;
startButton.innerText = "Loading Questions...";


startButton.addEventListener("click", () => {

    if (questions.length === 0) {
        alert("Questions load nahi hue.");
        return;
    }

    startBox.style.display = "none";
    quizBox.style.display = "block";
    resultBox.style.display = "none";

    currentQuestionIndex = 0;
    score = 0;

    nextButton.style.display = "block";

    showQuestion();
});


async function loadQuestions() {

    try {

        const response =
            await fetch("http://localhost:3000/api/questions");

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const data = await response.json();

        questions = data;

        console.log("Questions loaded:", questions);

        if (questions.length > 0) {

            startButton.disabled = false;
            startButton.innerText = "Start Quiz";

        } else {

            startButton.innerText = "No Questions Found";

        }

    } catch (error) {

        console.error("Questions load error:", error);

        startButton.disabled = true;
        startButton.innerText = "Questions Load Failed";

        alert(
            "Questions load nahi ho rahe. Backend server check karo."
        );
    }
}


function showQuestion() {

    clearInterval(timer);

    answerButtons.innerHTML = "";

    const currentQuestion =
        questions[currentQuestionIndex];

    questionNumber.innerText =
        `Question ${currentQuestionIndex + 1} / ${questions.length}`;


    questionElement.innerText =
        currentQuestion.question;


    currentQuestion.options.forEach(option => {

        const button =
            document.createElement("button");

        button.innerText = option;

        button.classList.add("answer-btn");

        button.addEventListener("click", () => {

            selectAnswer(button, option);

        });

        answerButtons.appendChild(button);

    });



    timeLeft = 30;

    timerElement.innerText = timeLeft;

    timerElement.style.background = "#f0f0f0";

    startTimer();
}


function selectAnswer(button, selectedAnswer) {

    const correctAnswer =
        questions[currentQuestionIndex].answer;


    if (selectedAnswer === correctAnswer) {

        button.style.background = "lightgreen";

        score++;

    } else {

        // Wrong answer red
        button.style.background = "lightcoral";

        // Correct answer green
        document.querySelectorAll(".answer-btn").forEach(btn => {

            if (btn.innerText === correctAnswer) {
                btn.style.background = "lightgreen";
            }

        });

    }


    // Sabhi options disable
    document.querySelectorAll(".answer-btn").forEach(btn => {

        btn.disabled = true;

    });
}



function startTimer() {

    console.log("Timer started");

    timer = setInterval(() => {

        timeLeft--;

        timerElement.innerText = timeLeft;


        if (timeLeft <= 10) {

            timerElement.style.background =
                "lightcoral";

        } else {

            timerElement.style.background =
                "#f0f0f0";

        }


        if (timeLeft <= 0) {

            clearInterval(timer);

            goToNextQuestion();

        }

    }, 1000);
}



nextButton.addEventListener("click", () => {

    clearInterval(timer);

    goToNextQuestion();

});



function goToNextQuestion() {

    currentQuestionIndex++;


    if (currentQuestionIndex < questions.length) {

        showQuestion();

    } else {

        showResult();

    }
}

function showResult() {

    clearInterval(timer);

    questionElement.innerText = "";

    answerButtons.innerHTML = "";

    questionNumber.innerText = "";

    timerElement.innerText = "";

    nextButton.style.display = "none";

let percentage = Math.round((score / questions.length) * 100);

let message = "";

if (percentage >= 80) {
    message = "Excellent! 🎉";
} else if (percentage >= 60) {
    message = "Good Job! 👍";
} else if (percentage >= 40) {
    message = "Keep Practicing! 💪";
} else {
    message = "Try Again! 📚";
}

scoreElement.innerHTML = `
    <p>Your Score: ${score} / ${questions.length}</p>
    <p>Percentage: ${percentage}%</p>
    <p>${message}</p>
`;


    resultBox.style.display = "block";


    sendScoreToBackend();
}



async function sendScoreToBackend() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/score",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        score: score,
                        total: questions.length
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data =
            await response.json();

        console.log(
            "Backend response:",
            data
        );


    } catch (error) {

        console.error(
            "Score send nahi hua:",
            error
        );

    }
}


restartButton.addEventListener("click", () => {

    clearInterval(timer);

    currentQuestionIndex = 0;

    score = 0;

    timeLeft = 30;


    resultBox.style.display = "none";

    quizBox.style.display = "none";

    startBox.style.display = "block";


    nextButton.style.display = "block";

    timerElement.innerText = "30";

    timerElement.style.background = "#f0f0f0";

});


loadQuestions();
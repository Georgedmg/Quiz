// Initialize variables
let quiz;
let counter = 0;
let score = 0;
let answer = "";
let multipleAnswers = [];
let go = true;
let correctAnswer = "";
let quizQuestion = document.getElementById("quizQuestion");

// Function to fetch quiz data from a JSON endpoint
async function fetchQuizJSON() {
  try {
    const response = await fetch("https://proto.io/en/jobs/candidate-exercise/quiz.json");
    quiz = await response.json();
    return quiz;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
  }
}

// Fetch quiz data and set labels when it's available
fetchQuizJSON().then((quizData) => {
  quiz = quizData;
  const { title, description, questions } = quiz;
  setLabels(title, description);
});

// Function to fetch results data from a JSON endpoint
async function fetchResultsJSON() {
  try {
    const response = await fetch("https://proto.io/en/jobs/candidate-exercise/result.json");
    const results = await response.json();
    return results;
  } catch (error) {
    console.error("Error fetching results data:", error);
  }
}

// Fetch results data when it's available
fetchResultsJSON().then((results) => {
  quizResults = results.results;
});

// Function to start the quiz game
function beginGame() {
  document.getElementById("nextQuestion").removeAttribute("hidden");
  document.getElementById("start").setAttribute("hidden", "true");
  document.getElementById("quizDescription").innerHTML = "";
  setQuestionButtons();
}

// Function to set labels based on quiz data
function setLabels(title, description) {
  document.getElementById("quizTitle").innerHTML = title;
  document.getElementById("quizDescription").innerHTML = description;
}

// Function to set question buttons and display the current question
function setQuestionButtons() {
  const img = document.createElement("img");

  quizQuestion.innerHTML = quiz.questions[counter].title;
  quizQuestion.classList.add("display-6");
  quizQuestion.removeAttribute("hidden");
  quizQuestion.style.backgroundColor = "#ffca2c";
  img.src = quiz.questions[counter].img;
  questionButtons.appendChild(img);
  const lineBreak = document.createElement("br");
  questionButtons.appendChild(lineBreak);

  if (counter < quiz.questions.length) {
    if (quiz.questions[counter].question_type === "multiplechoice-single") {
      const correctAnswerNo = quiz.questions[counter].correct_answer;
      const questionsArray = quiz.questions[counter].possible_answers;
      correctAnswer = questionsArray.find((matchingId) => matchingId.a_id === correctAnswerNo).caption;
      for (let i = 0; i < quiz.questions[counter].possible_answers.length; i++) {
        const radioButton = document.createElement("input");
        const radioLabel = document.createElement("label");

        radioButton.classList.add("form-check-input");
        radioLabel.classList.add("form-check-label");
        radioLabel.innerHTML = quiz.questions[counter].possible_answers[i].caption;
        radioButton.type = "radio";
        radioButton.name = "multipleChoiceSingle";

        radioButton.onclick = function () {
          answer = quiz.questions[counter].possible_answers[i].a_id;
        };
        questionButtons.appendChild(radioButton);
        questionButtons.appendChild(radioLabel);
      }
    } else if (quiz.questions[counter].question_type === "multiplechoice-multiple") {
      correctAnswer = "";
      for (let i = 0; i < quiz.questions[counter].correct_answer.length; i++) {
        const correctAnswerNo = quiz.questions[counter].correct_answer[i];
        const questionsArray = quiz.questions[counter].possible_answers;
        correctAnswer += `${i + 1}. ${questionsArray.find((matchingId) => matchingId.a_id === correctAnswerNo).caption}<br>`;
      }
      for (let i = 0; i < quiz.questions[counter].possible_answers.length; i++) {
        const multipleButton = document.createElement("input");
        const multipleLabel = document.createElement("label");

        multipleLabel.innerHTML = quiz.questions[counter].possible_answers[i].caption;
        multipleButton.type = "checkbox";
        multipleButton.name = "multipleChoiceMultiple";
        multipleButton.classList.add("form-check-input");

        multipleButton.onclick = function () {
          if (multipleButton.checked) {
            multipleAnswers.push(quiz.questions[counter].possible_answers[i].a_id);
          } else {
            multipleAnswers.pop(quiz.questions[counter].possible_answers[i].a_id);
          }
        };
        questionButtons.appendChild(multipleButton);
        questionButtons.appendChild(multipleLabel);
      }
    } else {
      const trueButton = document.createElement("input");
      const trueLabel = document.createElement("label");
      const falseButton = document.createElement("input");
      const falseLabel = document.createElement("label");
      correctAnswer = quiz.questions[counter].correct_answer;

      trueButton.classList.add("form-check-input");
      trueLabel.classList.add("form-check-label");
      falseButton.classList.add("form-check-input");
      falseLabel.classList.add("form-check-label");

      trueButton.type = "radio";
      trueButton.name = "trueFalse";
      trueLabel.innerHTML = "True";

      trueButton.onclick = function () {
        answer = true;
      };
      falseButton.type = "radio";
      falseButton.name = "trueFalse";
      falseLabel.innerHTML = "False";
      falseButton.onclick = function () {
        answer = false;
      };
      questionButtons.appendChild(trueButton);
      questionButtons.appendChild(trueLabel);
      questionButtons.appendChild(falseButton);
      questionButtons.appendChild(falseLabel);
    }
  }
}

// Function to handle the next question
function nextQuestion() {
  multipleAnswers.sort((a, b) => a - b);
  if (counter < quiz.questions.length - 1) {
    if (answer !== "" || multipleAnswers.length !== 0) {
      if (answer === quiz.questions[counter].correct_answer) {
        score += quiz.questions[counter].points;
        go = true;
      } else if (
        JSON.stringify(multipleAnswers) ==
        JSON.stringify(quiz.questions[counter].correct_answer)
      ) {
        score += quiz.questions[counter].points;
        go = true;
      } else {
        wrongAnswerPreparation();
        setTimeout(wrongAnswer, 3000);
      }

      if (go) {
        counter += 1;
        document.getElementById("questionButtons").innerHTML = "";
        setQuestionButtons();
        answer = "";
        multipleAnswers = [];
      }
    }
  } else {
    if (answer === quiz.questions[counter].correct_answer) {
      score += quiz.questions[counter].points;
    } else {
      wrongAnswerPreparation();
      setTimeout(finalSubmit, 3000);
    }

    if (go) {
      finalSubmit();
    }
  }
}

// Function to handle any wrong answers
function wrongAnswer() {
  quizQuestion.classList.remove("blink");
  document.getElementById("nextQuestion").disabled = false;
  go = true;
  counter += 1;
  document.getElementById("questionButtons").innerHTML = "";
  setQuestionButtons();
  answer = "";
  multipleAnswers = [];
}

// Function to prepare for wrong answers
function wrongAnswerPreparation() {
  go = false;
  document.getElementById("nextQuestion").disabled = true;
  const allButtons = document.querySelectorAll("input");
  for (let i = 0; i < allButtons.length; i++) {
    allButtons[i].disabled = "true";
  }
  quizQuestion.innerHTML = "Wrong, the correct answer is: " + correctAnswer;
  quizQuestion.style.backgroundColor = "green";
  quizQuestion.classList.add("blink");
}

// Function for the final submission
function finalSubmit() {
  quizQuestion.classList.remove("blink");
  document.getElementById("questionButtons").innerHTML = "";
  quizQuestion.innerHTML = "";
  quizQuestion.style.backgroundColor = "";

  const submit = document.getElementById("nextQuestion");
  submit.id = "submit";
  submit.innerHTML = "SUBMIT";
  submit.removeAttribute("disabled");
  submit.classList.remove("btn-warning");
  submit.classList.add("btn-danger");
  score = score * 5;

  submit.onclick = function () {
    for (let i = 0; i < quizResults.length; i++) {
      if (
        score <= quizResults[i].maxpoints &&
        score >= quizResults[i].minpoints
      ) {
        document.getElementById("quizDescription").innerHTML =
          quizResults[i].title;
        quizQuestion.innerHTML = quizResults[i].message;
        document.getElementById("quizTitle").innerHTML =
          "Your score is: " + score + "%";
        const img = document.createElement("img");
        img.src = quizResults[i].img;
        questionButtons.appendChild(img);
        submit.id = "retry";
        submit.innerHTML = "RETRY";
        submit.classList.add("btn-info");
        submit.classList.remove("btn-danger");
        submit.onclick = function () {
          location.reload();
        };
      }
    }
  };
}

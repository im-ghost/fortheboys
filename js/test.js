import { getFlashcards, saveGrade } from './data.js';

let timerInterval; // Track the timer interval

// Event Listener for Generate Test Button
document.getElementById('generateTestButton').addEventListener('click', () => {
  const selectedCourse = document.getElementById('courseSelectorForTest').value;
  const selectedTopic = document.getElementById('topicSelectorForTest').value;
  const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);
  const difficulty = parseInt(document.getElementById('difficulty').value, 10);

  if (!selectedCourse || !numQuestions || !difficulty) {
    alert('Please fill out all required fields (Course, Number of Questions, Difficulty).');
    return;
  }

  generateTest(selectedCourse, selectedTopic || null, numQuestions, difficulty);
});

// Generate Test Function
export const generateTest = (courseName, topicName, numQuestions, difficulty) => {
  stopTimer(); // Stop any existing timer

  const flashcards = topicName ? getFlashcards(courseName, topicName) : getFlashcards(courseName);

  if (!flashcards || flashcards.length === 0) {
    alert('No flashcards available for the selected course/topic.');
    return;
  }

  // Ensure numQuestions is not greater than the number of available flashcards
  if (numQuestions > flashcards.length) {
    alert(`Only ${flashcards.length} flashcards are available. Generating a test with all available questions.`);
    numQuestions = flashcards.length;
  }

  // Set range input maximum to the number of available flashcards
  document.getElementById('numQuestions').setAttribute('max', flashcards.length);

  const container = document.getElementById('testContainer');
  container.innerHTML = ''; // Clear the container

  const shuffledFlashcards = shuffle(flashcards).slice(0, numQuestions);

  // Adjust the number of fill-in-the-gap questions based on difficulty (1-10 range)
  const numFillInTheBlank = difficulty < 5 ? 0
                          : difficulty <= 7 ? Math.floor(numQuestions / 3)
                          : Math.floor(numQuestions / 2);

  let fillInTheBlankCount = 0;

  shuffledFlashcards.forEach((fc, index) => {
    let questionText, correctAnswer, options, isFillInTheBlank;

    if (fillInTheBlankCount < numFillInTheBlank) {
      // Generate Fill-in-the-Blank Question
      isFillInTheBlank = true;
      fillInTheBlankCount++;
      questionText = generateFillInTheBlank(fc.caseName, fc.principle);
      correctAnswer = `${fc.caseName}, ${fc.principle}`;
    } else {
      // Generate Multiple-Choice Question
      isFillInTheBlank = false;
      const isCaseQuestion = Math.random() > 0.5;

      if (isCaseQuestion) {
        questionText = `What is the principle of "${fc.caseName}"?`;
        correctAnswer = fc.principle;
        options = getPrinciplesFromOtherFlashcards(flashcards, fc.principle);
      } else {
        questionText = `Which case corresponds to the principle: "${fc.principle}"?`;
        correctAnswer = fc.caseName;
        options = getCasesFromOtherFlashcards(flashcards, fc.caseName);
      }

      options = shuffle([correctAnswer, ...options]);
    }

    // Create the question container
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-container');
    questionDiv.innerHTML = `
      <p>${questionText}</p>
      ${isFillInTheBlank
        ? ``
        : options.map(option => `
          <label>
            <input type="radio" name="question${index}" value="${option}">
            ${option}
          </label><br>`).join('')}
    `;
    container.appendChild(questionDiv);
  });

  // Add Submit Button
  const submitTestBtn = document.createElement('button');
  submitTestBtn.setAttribute('id', 'submitTest');
  submitTestBtn.classList.add('button');
  submitTestBtn.textContent = 'Submit Test';
  container.appendChild(submitTestBtn);

  // Add Submit Test Event Listener
  submitTestBtn.addEventListener('click', () => {
    stopTimer(); // Stop the timer
    submitTest(container, shuffledFlashcards, courseName, topicName);
  });

  // Start the timer based on the number of questions
  startTimer(numQuestions, () => {
    alert('Time is up! Submitting the test automatically.');
    submitTest(container, shuffledFlashcards, courseName, topicName);
  });
};

// Helper: Generate Fill-in-the-Blank
const generateFillInTheBlank = (caseName, principle) => {
  const caseParts = caseName.split(' ');
  const principleParts = principle.split(' ');

  // Randomly pick 2 words from the principle to mask
  const randomIndices = [];
  while (randomIndices.length < 2) {
    const randomIndex = Math.floor(Math.random() * principleParts.length);
    if (!randomIndices.includes(randomIndex)) {
      randomIndices.push(randomIndex);
    }
  }

  // Fill the first word of the case
  const maskedCase = caseParts.map((word, idx) =>
    idx === 0 ? `<input type="text" class="fill-in-the-blank-input" data-answer="${word}" />` : word
  ).join(' ');

  // Mask two random words in the principle
  const maskedPrinciple = principleParts.map((word, idx) =>
    randomIndices.includes(idx)
      ? `<input type="text" class="fill-in-the-blank-input" data-answer="${word}" />`
      : word
  ).join(' ');

  return `In the case of "${maskedCase}" it was held that "${maskedPrinciple}".`;
};

// Function to update the difficulty label as slider changes
function updateDifficultyLabel(value) {
  document.getElementById('difficultyValue').textContent = value;
}

// Update max questions in the numQuestions input dynamically
document.getElementById('difficulty').addEventListener('input', function() {
  const difficultyValue = parseInt(this.value, 10);
});

// Submit Test Function
const submitTest = (container, shuffledFlashcards, courseName, topicName) => {
  let score = 0;
  const totalQuestions = shuffledFlashcards.length;
  let formValid = true;

  shuffledFlashcards.forEach((flashcard, index) => {
    const questionDiv = container.children[index];
    const isFillInTheBlank = questionDiv.querySelectorAll('.fill-in-the-blank-input').length > 0;

    if (isFillInTheBlank) {
      // Handle Fill-in-the-Blank
      const inputs = questionDiv.querySelectorAll('.fill-in-the-blank-input');
      const answers = [...inputs].map(input => input.value.trim());
      const correctAnswers = [...inputs].map(input => input.dataset.answer);

      // Check if all inputs are filled
      if (answers.some(answer => answer === '')) {
        formValid = false;
        alert('Please fill all the blanks!');
        return;
      }

      // Check if answers are correct
      const isCorrect = JSON.stringify(answers.map(a => a.toLowerCase())) === JSON.stringify(correctAnswers.map(a => a.toLowerCase()));

      if (isCorrect) {
        score++;
        questionDiv.style.border = '3px solid green';
        // Display the correct answers below the inputs
        const correctAnswerText = correctAnswers.map(answer => `<span style="color: green">${answer}</span>`).join(' ');
        questionDiv.innerHTML += `<p>Correct answer: ${correctAnswerText}</p>`;
      } else {
        questionDiv.style.border = '3px solid red';
        // Display the correct answers below the inputs
        const correctAnswerText = correctAnswers.map(answer => `<span style="color: red">${answer}</span>`).join(' ');
        questionDiv.innerHTML += `<p>Correct answer: ${correctAnswerText}</p>`;
      }
    } else {
      // Handle Multiple-Choice
      const selectedOption = questionDiv.querySelector(`input[name="question${index}"]:checked`);
      const correctAnswer = flashcard.principle || flashcard.caseName;
      const options = questionDiv.querySelectorAll('input[type="radio"]');
      
      if (selectedOption && selectedOption.value === correctAnswer) {
        score++;
        questionDiv.style.border = '3px solid green';
        // Highlight only the correct option container green
        options.forEach(option => {
          if (option.value === selectedOption.value) {
            option.parentElement.style.backgroundColor = 'green'; // Correct answer
          }
        });
      } else {
        questionDiv.style.border = '3px solid red';
        // Highlight selected wrong option red and correct option green
        options.forEach(option => {
          if (option.value === selectedOption.value) {
            option.parentElement.style.backgroundColor = 'red'; // Wrong answer
          }
          if (option.value === correctAnswer) {
            option.parentElement.style.backgroundColor = 'green'; // Correct answer
          }
        });
      }
    }
  });

  if (!formValid) return; // If any form is invalid, stop submission

  // Save Grade
  if (courseName) {
    saveGrade(courseName, topicName || 'All Topics', score, totalQuestions);
  }
showTestResults(score,totalQuestions)
  
};

 const feedbackContainer = document.getElementById("feedback-container");
const feedbackCanvas = document.getElementById("feedbackCanvas");
const ctx = feedbackCanvas.getContext("2d");

// Make the canvas responsive
const resizeCanvas = () => {
  feedbackCanvas.width = Math.min(window.innerWidth * 0.8, 400);
  feedbackCanvas.height = feedbackCanvas.width;
};
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Show feedback animation with score
const showFeedback = (score, totalQuestions) => {
  feedbackContainer.style.display = "block"; // Show the feedback container
  document.getElementById("retry-button-container").style.display = "none"; // Hide retry initially
  animateFeedback(score, totalQuestions);
};

// Retry Test
const retryTest = () => {
  location.reload();
};

// Animation function for score with pulse effect
const animateFeedback = (score, totalQuestions) => {
  const x = feedbackCanvas.width / 2;
  const y = feedbackCanvas.height / 2;
  const radius = feedbackCanvas.width / 3;
  const finalScore = (score / totalQuestions) * 100;

  let currentProgress = 0;
  let pulseSize = 1;

  const animate = () => {
    ctx.clearRect(0, 0, feedbackCanvas.width, feedbackCanvas.height); // Clear canvas

    // Draw background circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();

    // Draw progress arc
    const progressAngle = (currentProgress / 100) * 2 * Math.PI - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI / 2, progressAngle);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#4caf50";
    ctx.stroke();

    // Draw percentage
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(currentProgress)}%`, x, y + 10);

    // Pulsing effect for the circle
    ctx.beginPath();
    ctx.arc(x, y, radius + pulseSize, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#ff4081";
    ctx.stroke();
    pulseSize = pulseSize > 10 ? 1 : pulseSize + 0.5;

    // Increment progress
    if (currentProgress < finalScore) {
      currentProgress += 1;
      requestAnimationFrame(animate);
    } else {
      // Show retry button after animation ends
      setTimeout(() => {
        document.getElementById("retry-button-container").style.display = "block";
      }, 500);
    }
  };

  animate(); // Start animation
};

// Show test results (example usage)
const showTestResults = (score, totalQuestions) => {
  showFeedback(score, totalQuestions);
};


// Helper: Start Timer
const startTimer = (numQuestions, onTimeUp) => {
  const timerDisplay = document.getElementById('timerDisplay');
  const totalTime = numQuestions * 10; // 10 seconds per question
  let timeRemaining = totalTime;

  const updateTimerDisplay = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `Time Left: ${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining -= 1;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = 'Time Up!';
      onTimeUp(); // Call the callback
    } else {
      updateTimerDisplay();
    }
  }, 1000);
};

// Helper: Stop Timer
const stopTimer = () => {
  clearInterval(timerInterval);
};

// Helper: Shuffle Array
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Get random principles from other flashcards, excluding the correct one
const getPrinciplesFromOtherFlashcards = (flashcards, correctPrinciple) => {
  const otherPrinciples = flashcards
    .filter(fc => fc.principle !== correctPrinciple) // Exclude the correct principle
    .map(fc => fc.principle);
  return shuffle(otherPrinciples).slice(0, 3); // Get 3 random options
};

// Get random cases from other flashcards, excluding the correct one
const getCasesFromOtherFlashcards = (flashcards, correctCase) => {
  const otherCases = flashcards
    .filter(fc => fc.caseName !== correctCase) // Exclude the correct case
    .map(fc => fc.caseName);
  return shuffle(otherCases).slice(0, 3); // Get 3 random options
};
// Update the number of questions label
document.getElementById('numQuestions').addEventListener('input', function() {
  const numQuestions = parseInt(this.value, 10);
  document.getElementById('numQuestionsLabel').textContent = numQuestions;
});

// Update the max number of questions based on available flashcards
document.getElementById('courseSelectorForTest').addEventListener('change', updateMaxQuestions);
document.getElementById('topicSelectorForTest').addEventListener('change', updateMaxQuestions);

function updateMaxQuestions() {
  const selectedCourse = document.getElementById('courseSelectorForTest').value;
  const selectedTopic = document.getElementById('topicSelectorForTest').value;

  // Fetch the flashcards for the selected course/topic
  const flashcards = selectedTopic ? getFlashcards(selectedCourse, selectedTopic) : getFlashcards(selectedCourse);

  if (flashcards && flashcards.length > 0) {
    document.getElementById('numQuestions').setAttribute('max', flashcards.length);
    document.getElementById('numQuestions').value = Math.min(document.getElementById('numQuestions').value, flashcards.length);
    document.getElementById('numQuestionsLabel').textContent = document.getElementById('numQuestions').value;
  }
  console.log("update ")
}

// Initial update for max questions on page load
updateMaxQuestions();
// Update the difficulty level label when the slider is changed
document.getElementById('difficulty').addEventListener('input', function() {
  const difficultyValue = this.value;
  document.getElementById('difficultyValue').textContent = difficultyValue;
  updateMaxQuestions()
});

 document.getElementById("retry-button-container").addEventListener("click",retryTest);
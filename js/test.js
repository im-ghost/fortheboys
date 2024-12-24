// test.js - Handles test generation and evaluation

import { getFlashcards, saveGrade } from './data.js';
import { getCurrentUser } from './auth.js';

import { displayGrades, displayPerformanceChart, displayProgressAndAdvice } from './grades.js';



export const generateTest = (courseName, topicName) => {
  // Validate topic selection
  if (!topicName) {
    alert('Please select a topic before starting the test.');
    return;
  }

  const flashcards = getFlashcards(courseName, topicName);

  if (!flashcards || flashcards.length === 0) {
    alert('No flashcards available for this topic.');
    return;
  }

  const numQuestionsInput = document.getElementById('numQuestions');
  let numQuestions = parseInt(numQuestionsInput.value, 10);

  if (isNaN(numQuestions) || numQuestions <= 0) {
    alert('Please enter a valid number of questions.');
    return;
  }

  if (numQuestions > flashcards.length) {
    alert(`Only ${flashcards.length} flashcards are available. Generating a test with all available questions.`);
    numQuestions = flashcards.length;
  }

  const container = document.getElementById('testContainer');
  container.innerHTML = ''; // Clear the container

  const shuffledFlashcards = shuffle(flashcards).slice(0, numQuestions);

  shuffledFlashcards.forEach((fc, index) => {
    const isCaseQuestion = Math.random() > 0.5;

    let questionText, correctAnswer, options;

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

    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-container');

    questionDiv.innerHTML = `
      <p>${questionText}</p>
      ${options.map(option => `
        <label>
          <input type="radio" name="question${index}" value="${option}">
          ${option}
        </label><br>
      `).join('')}
    `;
    container.appendChild(questionDiv);
  });

  const submitTestBtn = document.createElement('button');
  submitTestBtn.setAttribute('id', 'submitTest');
  submitTestBtn.classList.add('button');
  submitTestBtn.textContent = 'Submit Test';
  container.appendChild(submitTestBtn);

  document.getElementById('submitTest').addEventListener('click', () => {
    stopTimer(); // Stop the timer
    submitTest(container, shuffledFlashcards, courseName, topicName);
  });

  // Start the timer based on the number of questions
  startTimer(numQuestions, () => {
    alert('Time is up! Submitting the test automatically.');
    submitTest(container, shuffledFlashcards, courseName, topicName);
  });
};


let timerInterval;

const startTimer = (numQuestions, onTimeUp) => {
  const timerDisplay = document.getElementById('timerDisplay');
  const totalTime = numQuestions * 3; // 3 seconds per question
  let timeRemaining = totalTime;

  const updateTimerDisplay = () => {
    const seconds = timeRemaining;
    timerDisplay.textContent = `Time Left: ${String(seconds).padStart(2, '0')}s`;

    // Change color and apply animation when 5 seconds remain
    if (seconds <= 5) {
      timerDisplay.style.color = 'red';
      timerDisplay.style.animation = 'zoom 1s infinite';
    } else {
      timerDisplay.style.color = 'black'; // Default color
      timerDisplay.style.animation = 'none';
    }
  };

  updateTimerDisplay(); // Initialize display

  timerInterval = setInterval(() => {
    timeRemaining -= 1;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = 'Time Up!';
      timerDisplay.style.color = 'red';
      timerDisplay.style.animation = 'none';
      onTimeUp(); // Call the callback function
    } else {
      updateTimerDisplay();
    }
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
};



// Helper function to shuffle an array
const shuffle = (array) => {
  console.log(array)
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};

// Get random principles from other flashcards, excluding the correct one
const getPrinciplesFromOtherFlashcards = (flashcards, correctPrinciple) => {
  const otherPrinciples = flashcards
    .filter(fc => fc.principle !== correctPrinciple) // Exclude the correct principle
    .map(fc => fc.principle);
  return shuffle(otherPrinciples).slice(0, 3); // Return 3 random principles
};

// Get random cases from other flashcards, excluding the correct one
const getCasesFromOtherFlashcards = (flashcards, correctCase) => {
  const otherCases = flashcards
    .filter(fc => fc.caseName !== correctCase) // Exclude the correct case
    .map(fc => fc.caseName)

  return shuffle(otherCases).slice(0, 3); // Return 3 random cases
};
const submitTest = (container, shuffledFlashcards, courseName, topicName) => {
  let score = 0;
  const totalQuestions = shuffledFlashcards.length;

  // Check each question's answer
  shuffledFlashcards.forEach((flashcard, index) => {
    const questionDiv = container.children[index];
    const questionName = `question${index}`;
    const selectedOption = questionDiv.querySelector(`input[name="${questionName}"]:checked`);
    const labels = questionDiv.querySelectorAll('label');

    const isCaseQuestion = questionDiv.querySelector('p').textContent.includes('_');
    const correctAnswer = isCaseQuestion ? flashcard.principle : flashcard.caseName;

    if (selectedOption) {
      const selectedValue = selectedOption.value;

      if (selectedValue === correctAnswer) {
        score++;
        questionDiv.style.border = '3px solid green';
        questionDiv.style.backgroundColor = 'rgba(0, 128, 0, 0.1)';

        labels.forEach((label) => {
          if (label.querySelector('input').value === correctAnswer) {
            label.style.backgroundColor = 'green';
            label.style.color = 'white';
          }
        });
      } else {
        questionDiv.style.border = '3px solid red';
        questionDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';

        labels.forEach((label) => {
          const labelInput = label.querySelector('input');
          if (labelInput.value === correctAnswer) {
            label.style.backgroundColor = 'green';
            label.style.color = 'white';
          }
          if (labelInput.value === selectedValue) {
            label.style.backgroundColor = 'red';
            label.style.color = 'white';
          }
        });
      }
    } else {
      questionDiv.style.border = '3px solid orange';
      questionDiv.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';

      labels.forEach((label) => {
        if (label.querySelector('input').value === correctAnswer) {
          label.style.backgroundColor = 'green';
          label.style.color = 'white';
        }
      });
    }
  });

  // Save the grade only if topicName is valid
  if (courseName && topicName) {
    saveGrade(courseName, topicName, score, totalQuestions);
  }

  displayGrades();
  displayPerformanceChart(score,totalQuestions);
  displayProgressAndAdvice()
  alert(`You scored ${score} out of ${totalQuestions}`);
};

// Submit the test, check answers and calculate score

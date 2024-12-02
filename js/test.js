// test.js - Handles test generation and evaluation

import { getFlashcards, saveGrade } from './data.js';
import { getCurrentUser } from './auth.js';

export const generateTest = (courseName, topicName) => {
  const flashcards = topicName
    ? getFlashcards(courseName, topicName)
    : Object.values(getFlashcards(courseName)).flat();

  if (!flashcards || flashcards.length === 0) {
    alert('No flashcards available for this selection.');
    return;
  }const container = document.getElementById('testContainer');
  container.innerHTML = ''; // Clear the container

  // Shuffle the flashcards for random order
  const shuffledFlashcards = shuffle(flashcards);
 console.log(shuffledFlashcards)
  shuffledFlashcards.forEach((fc, index) => {
    const isCaseQuestion = Math.random() > 0.5; // Randomly decide if the question is about case or principle

    let questionText, correctAnswer, options;

    if (isCaseQuestion) {
      // Ask for principle of a case
      questionText = `What is the principle of "${fc.caseName}"?_`;
      correctAnswer = fc.principle;
      options = getPrinciplesFromOtherFlashcards(flashcards, fc.principle);
    } else {
      // Ask for case of a principle
      questionText = `Which case corresponds to the principle: "${fc.principle}"?`;
      correctAnswer = fc.caseName;
      options = getCasesFromOtherFlashcards(flashcards, fc.caseName);
    }

    // Shuffle the options to randomize their order
    options = shuffle([correctAnswer, ...options]);

    // Create HTML for the question
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-container'); // Add a container for the question

    questionDiv.innerHTML = `
      <p>${questionText}</p>
      ${options.map((option, i) => `
        <label>
          <input type="radio" name="question${index}" value="${option}">
          ${option}
        </label><br>
      `).join('')}
    `;
    container.appendChild(questionDiv);
  });
  const submitTestBtn = document.createElement("button")
  submitTestBtn.setAttribute("id","submitTest");
  submitTestBtn.classList.add("button");
  container.appendChild(submitTestBtn)

  // Add the submit button functionality
  document.getElementById('submitTest').addEventListener('click', () => {
    submitTest(container, shuffledFlashcards);
  });
};

// Helper function to shuffle an array
const shuffle = (array) => {
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
    .map(fc => fc.caseName);
  return shuffle(otherCases).slice(0, 3); // Return 3 random cases
};

// Submit the test, check answers and calculate score
const submitTest = (container, shuffledFlashcards) => {
  let score = 0;
  const totalQuestions = shuffledFlashcards.length;

  // Check each question's answer
  shuffledFlashcards.forEach((flashcard, index) => {
    const questionDiv = container.children[index];
    const questionName = `question${index}`;
    const selectedOption = questionDiv.querySelector(`input[name="${questionName}"]:checked`);
    const labels = questionDiv.querySelectorAll('label');

    // Determine if the question was asking for the principle or the case
    console.log(questionDiv.querySelector("p").textContent.includes("principle"))
    const isCaseQuestion = questionDiv.querySelector('p').textContent.includes('_');
    const correctAnswer = isCaseQuestion ? flashcard.principle : flashcard.caseName;
  console.log(correctAnswer)
    if (selectedOption) {
      const selectedValue = selectedOption.value;

      // If the selected answer is correct
      if (selectedValue === correctAnswer) {
        score++;
        questionDiv.style.border = '3px solid green';
        questionDiv.style.backgroundColor = 'rgba(0, 128, 0, 0.1)'; // Light green background

        // Highlight the correct label in green
        labels.forEach((label) => {
          if (label.querySelector('input').value === correctAnswer) {
            label.style.backgroundColor = 'green';
            label.style.color = 'white';
          }
        });
      } else {
        // If the selected answer is incorrect
        questionDiv.style.border = '3px solid red';
        questionDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'; // Light red background

        // Highlight the correct option in green
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
      // If no option is selected, only highlight the correct answer
      questionDiv.style.border = '3px solid orange';
      questionDiv.style.backgroundColor = 'rgba(255, 165, 0, 0.1)'; // Light orange background

      // Highlight the correct label in green
      labels.forEach((label) => {
        if (label.querySelector('input').value === correctAnswer) {
          label.style.backgroundColor = 'green';
          label.style.color = 'white';
        }
      });
    }
  });

  // Show score in an alert
  alert(`You scored ${score} out of ${totalQuestions}`);
};

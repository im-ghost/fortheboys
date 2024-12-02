// flashcards.js - Handles flashcard display and interactions

import { getFlashcards } from './data.js';

export const displayFlashcards = (courseName, topicName) => {
  const container = document.getElementById('flashcardsList');
  const flashcards = getFlashcards(courseName, topicName);

  // Clear previous flashcards
  container.innerHTML = '';

  if (!flashcards || flashcards.length === 0) {
    container.innerHTML = `<p>No flashcards available for this topic.</p>`;
    return;
  }

  flashcards.forEach((flashcard) => {
    const card = document.createElement('div');
    card.classList.add('flashcard');
    card.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">${flashcard.caseName}</div>
        <div class="flashcard-back">${flashcard.principle}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      card.classList.toggle('active');
    });
    container.appendChild(card);
  });
};

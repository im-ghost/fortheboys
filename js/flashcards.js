// flashcards.js - Handles flashcard display and interactions

import { getFlashcards,getCourses,createCourse,addTopic,saveFlashcard,getTopics } from './data.js';
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
document.getElementById('shareFlashcards').addEventListener('click', () => {
  const courseName = document.getElementById('courseSelector').value;
  const topicName = document.getElementById('topicSelector').value;

  if (!courseName) {
    alert('Please select a course to share.');
    return;
  }

  shareFlashcardsByTopicOrSubject(courseName, topicName);
});

export const shareFlashcardsByTopicOrSubject = (courseName, topicName = null) => {
  const flashcards = getFlashcards(courseName, topicName);

  if (!flashcards || flashcards.length === 0) {
    alert('No flashcards available to share.');
    return;
  }

  const data = {
    courseName,
    topicName,
    flashcards,
  };

  console.log('Sharing data:', data); // Debugging line

  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = topicName ? `${topicName}.json` : `${courseName}.json`;
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url); // Clean up
};

document.getElementById('loadFlashcards').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => loadFlashcardsByTopicOrSubject(e.target.result);
      reader.readAsText(file);
    }
  });
  input.click();
});

export const loadFlashcardsByTopicOrSubject = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    const { courseName, topicName, flashcards } = data;

    if (!courseName || !flashcards) {
      alert('Invalid flashcard data.');
      return;
    }

    const userCourses = getCourses();
    let finalCourseName = courseName;

    // Handle course name conflicts
    if (userCourses.includes(courseName)) {
      let counter = 1;
      while (userCourses.includes(`${courseName} - ${counter}`)) {
        counter++;
      }
      finalCourseName = `${courseName} - ${counter}`;
    }

    if (!userCourses.includes(finalCourseName)) {
      createCourse(finalCourseName);
    }

    const userTopics = getTopics(finalCourseName);
    let finalTopicName = topicName;

    if (topicName && userTopics.includes(topicName)) {
      let counter = 1;
      while (userTopics.includes(`${topicName} - ${counter}`)) {
        counter++;
      }
      finalTopicName = `${topicName} - ${counter}`;
    }

    if (finalTopicName) {
      addTopic(finalCourseName, finalTopicName);
    }

    flashcards.forEach((fc) => {
      saveFlashcard(finalCourseName, finalTopicName || fc.topicName, fc);
    });

    alert(`Flashcards loaded successfully into "${finalTopicName || finalCourseName}".`);
  } catch (error) {
    console.error('Error loading flashcards:', error);
    alert('Failed to load flashcards.');
  }
};

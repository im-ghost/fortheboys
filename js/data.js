// data.js - Manages user-specific data in localStorage

export const getUserData = () => {
  const currentUser = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users')) || {};
  return users[currentUser] || {};
};

export const updateUserData = (userData) => {
  const currentUser = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users')) || {};
  users[currentUser] = userData;
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCourses = () => {
  const userData = getUserData();
  return Object.keys(userData.courses || {});
};

export const createCourse = (courseName) => {
  const userData = getUserData();
  if (!userData.courses) {
    userData.courses = {};
  }
  if (!userData.courses[courseName]) {
    userData.courses[courseName] = { topics: {} };
    updateUserData(userData);
    return true;
  }
  return false; // Course already exists
};

export const getTopics = (courseName) => {
  const userData = getUserData();
  return Object.keys(userData.courses[courseName]?.topics || {});
};

export const addTopic = (courseName, topicName) => {
  const userData = getUserData();
  if (!userData.courses[courseName].topics[topicName]) {
    userData.courses[courseName].topics[topicName] = [];
    updateUserData(userData);
  }
};

export const saveFlashcard = (courseName, topicName, flashcard) => {
  const userData = getUserData();
  userData.courses[courseName].topics[topicName].push(flashcard);
  updateUserData(userData);
};


export const getFlashcards = (courseName, topicName = null) => {
  const userData = JSON.parse(localStorage.getItem('users')) || {};
  const currentUser = localStorage.getItem('currentUser');

  if (!currentUser || !userData[currentUser]) {
    console.error('User not authenticated or data not found.');
    return [];
  }

  const course = userData[currentUser].courses?.[courseName];
  if (!course) {
    console.error(`Course "${courseName}" not found.`);
    return [];
  }

  if (topicName) {
    // Return flashcards for the specified topic
    return course.topics?.[topicName] || [];
  }

  // If no topic is specified, return all flashcards across all topics
  return Object.values(course.topics || {}).flat();
};

export const saveGrade = (courseName, topicName, score, total) => {
  const userData = getUserData();
  if (!userData.grades) {
    userData.grades = {};
  }
  const gradeKey = `${courseName}-${topicName}`;
  userData.grades[gradeKey] = { score, total };
  updateUserData(userData);
};

export const getGrades = () => {
  const userData = getUserData();
  return userData.grades || {};
};
